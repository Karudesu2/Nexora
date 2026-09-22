<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_teacher_cannot_access_user_management(): void
    {
        Sanctum::actingAs($this->userWithRole('teacher'));

        $this->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_school_administrator_can_assign_teacher_and_coordinator_roles(): void
    {
        $administrator = $this->userWithRole('school_administrator');
        $teacher = $this->userWithRole('teacher');

        Sanctum::actingAs($administrator);

        $this->patchJson("/api/v1/admin/users/{$teacher->id}/role", [
            'role_code' => 'curriculum_coordinator',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role_codes.0', 'curriculum_coordinator');

        $this->assertTrue($teacher->fresh()->hasAnyRole(['curriculum_coordinator']));
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $administrator->id,
            'action' => 'user.role_updated',
            'subject_id' => $teacher->id,
        ]);
    }

    public function test_school_administrator_cannot_assign_system_administrator_or_modify_themselves(): void
    {
        $administrator = $this->userWithRole('school_administrator');
        $teacher = $this->userWithRole('teacher');

        Sanctum::actingAs($administrator);

        $this->patchJson("/api/v1/admin/users/{$teacher->id}/role", [
            'role_code' => 'system_administrator',
        ])->assertForbidden();

        $this->patchJson("/api/v1/admin/users/{$administrator->id}/role", [
            'role_code' => 'curriculum_coordinator',
        ])->assertForbidden();
    }

    public function test_system_administrator_can_assign_any_existing_role_to_another_user(): void
    {
        $systemAdministrator = $this->userWithRole('system_administrator');
        $teacher = $this->userWithRole('teacher');

        Sanctum::actingAs($systemAdministrator);

        $this->patchJson("/api/v1/admin/users/{$teacher->id}/role", [
            'role_code' => 'school_administrator',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role_codes.0', 'school_administrator');
    }

    public function test_registration_ignores_role_injection_and_assigns_teacher_role(): void
    {
        $this->role('teacher');
        $this->role('school_administrator');

        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'New',
            'last_name' => 'Teacher',
            'email' => 'new.teacher@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'school_administrator',
        ])->assertCreated();

        $user = User::query()->where('email', 'new.teacher@example.test')->firstOrFail();

        $this->assertTrue($user->hasAnyRole(['teacher']));
        $this->assertFalse($user->hasAnyRole(['school_administrator']));
    }

    private function userWithRole(string $roleCode): User
    {
        $user = User::factory()->create();
        $user->roles()->attach($this->role($roleCode));

        return $user;
    }

    private function role(string $code): Role
    {
        return Role::query()->firstOrCreate(
            ['code' => $code],
            ['name' => str_replace('_', ' ', ucfirst($code))]
        );
    }
}
