<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();
    }

    public function test_teacher_cannot_access_the_admin_dashboard(): void
    {
        Sanctum::actingAs($this->userWithRole('teacher'));

        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
    }

    public function test_school_administrator_can_retrieve_real_dashboard_summary(): void
    {
        Sanctum::actingAs($this->userWithRole('school_administrator'));

        $this->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'teachers',
                    'subjects',
                    'competencies',
                    'lesson_plans',
                    'planning_completion',
                ],
            ]);
    }

    private function userWithRole(string $roleCode): User
    {
        $user = User::factory()->create();
        $role = Role::query()->firstOrCreate(
            ['code' => $roleCode],
            ['name' => ucfirst(str_replace('_', ' ', $roleCode))]
        );
        $user->roles()->attach($role);

        return $user;
    }
}
