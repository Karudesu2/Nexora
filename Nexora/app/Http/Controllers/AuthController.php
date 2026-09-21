<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends ApiController
{
    /**
     * Register a teacher account and issue a Sanctum token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $registration = DB::transaction(function () use ($request): array {
            $user = User::create($request->validated());
            $teacherRole = Role::query()->firstOrCreate(
                ['code' => 'teacher'],
                ['name' => 'Teacher']
            );

            $user->roles()->syncWithoutDetaching([$teacherRole->id]);

            return [
                'user' => $user,
                'token' => $user->createToken('nexora-web')->plainTextToken,
            ];
        });

        return $this->success([
            'user' => $this->userPayload($registration['user']),
            'token' => $registration['token'],
        ], 'Registration successful.', 201);
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->tokens()
            ->where('name', 'nexora-web')
            ->delete();

        $token = $user->createToken('nexora-web')->plainTextToken;

        return $this->success([
            'user' => $this->userPayload($user),
            'token' => $token,
        ], 'Login successful.');
    }

    /**
     * Logout current user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(message: 'Logout successful.');
    }

    /**
     * Get authenticated user.
     */
    public function profile(Request $request): JsonResponse
    {
        return $this->success([
            'user' => $this->userPayload($request->user()),
        ], 'Profile retrieved successfully.');
    }

    /**
     * Update the authenticated user's profile details.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,'.$request->user()->id,
            ],
        ]);

        $data['first_name'] = Str::squish($data['first_name']);
        $data['middle_name'] = empty($data['middle_name'])
            ? null
            : Str::squish($data['middle_name']);
        $data['last_name'] = Str::squish($data['last_name']);
        $data['email'] = Str::lower(trim($data['email']));
        $data['name'] = Str::squish(implode(' ', array_filter([
            $data['first_name'],
            $data['middle_name'],
            $data['last_name'],
        ])));

        $request->user()->update($data);

        return $this->success([
            'user' => $this->userPayload($request->user()->refresh()),
        ], 'Profile updated successfully.');
    }

    /**
     * Change the authenticated user's password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        $request->user()->update(['password' => $data['password']]);

        return $this->success(message: 'Password updated successfully.');
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
            'role_codes' => $user->roles()->pluck('code')->all(),
        ];
    }
}
