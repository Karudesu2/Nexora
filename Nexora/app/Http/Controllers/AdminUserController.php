<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $search = trim((string) $request->query('search'));
        $users = User::query()
            ->with('roles:id,name,code')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $like = '%'.strtolower($search).'%';

                    $query->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
                });
            })
            ->orderBy('name')
            ->paginate(25);

        return $this->success([
            'users' => $users->through(fn (User $user): array => $this->userPayload($user)),
            'available_roles' => $this->assignableRoles($request->user()),
        ], 'Users retrieved successfully.');
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return $this->success([
            'user' => $this->userPayload($user->load('roles:id,name,code')),
            'available_roles' => $this->assignableRoles($request->user()),
        ], 'User retrieved successfully.');
    }

    public function updateRole(
        UpdateUserRoleRequest $request,
        User $user
    ): JsonResponse {
        $this->authorize('updateRole', $user);

        $role = Role::query()
            ->where('code', $request->validated('role_code'))
            ->firstOrFail();

        if (! $this->canAssignRole($request->user(), $role)) {
            abort(403);
        }

        $previousRoleCodes = $user->roles()
            ->pluck('code')
            ->sort()
            ->values()
            ->all();

        $user->roles()->sync([$role->id]);

        ActivityLog::query()->create([
            'user_id' => $request->user()->id,
            'action' => 'user.role_updated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'description' => sprintf(
                'Changed %s role from %s to %s.',
                $user->email,
                implode(', ', $previousRoleCodes) ?: 'none',
                $role->code,
            ),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $this->success([
            'user' => $this->userPayload($user->fresh('roles')),
        ], 'User role updated successfully.');
    }

    /**
     * @return array<int, array{id: int, name: string, code: string}>
     */
    private function assignableRoles(User $user): array
    {
        $roleCodes = $user->hasAnyRole(['system_administrator'])
            ? null
            : ['teacher', 'curriculum_coordinator'];

        return Role::query()
            ->when($roleCodes, fn ($query) => $query->whereIn('code', $roleCodes))
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'code' => $role->code,
            ])
            ->all();
    }

    private function canAssignRole(User $user, Role $role): bool
    {
        return $user->hasAnyRole(['system_administrator'])
            || in_array($role->code, ['teacher', 'curriculum_coordinator'], true);
    }

    /**
     * @return array{id: int, name: string, first_name: ?string, middle_name: ?string, last_name: ?string, email: string, role_codes: array<int, string>}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'middle_name' => $user->middle_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role_codes' => $user->roles->pluck('code')->sort()->values()->all(),
        ];
    }
}
