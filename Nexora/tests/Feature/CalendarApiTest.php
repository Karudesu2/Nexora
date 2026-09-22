<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CalendarApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_teacher_can_retrieve_an_empty_calendar(): void
    {
        Sanctum::actingAs($this->userWithRole('teacher'));

        $this->getJson('/api/v1/calendar')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);
    }

    public function test_school_administrator_can_access_the_calendar_management_endpoint(): void
    {
        Sanctum::actingAs($this->userWithRole('school_administrator'));

        $this->getJson('/api/v1/calendar')->assertOk();
    }

    private function userWithRole(string $roleCode): User
    {
        $user = User::factory()->create();
        $role = Role::query()->create([
            'name' => str_replace('_', ' ', ucfirst($roleCode)),
            'code' => $roleCode,
        ]);
        $user->roles()->attach($role);

        return $user;
    }
}
