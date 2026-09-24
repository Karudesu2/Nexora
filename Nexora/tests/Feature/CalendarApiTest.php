<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\CalendarEvent;
use App\Models\SchoolYear;
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

    public function test_calendar_date_range_includes_events_that_overlap_the_range(): void
    {
        Sanctum::actingAs($this->userWithRole('teacher'));

        $schoolYear = SchoolYear::query()->create([
            'name' => '2026-2027',
            'start_date' => '2026-06-01',
            'end_date' => '2027-03-31',
        ]);

        CalendarEvent::query()->create([
            'school_year_id' => $schoolYear->id,
            'title' => 'Multi-day event',
            'type' => 'Holiday',
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-05',
        ]);

        $this->getJson('/api/v1/calendar?start_date=2026-09-03&end_date=2026-09-04')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_calendar_date_range_rejects_invalid_dates(): void
    {
        Sanctum::actingAs($this->userWithRole('teacher'));

        $this->getJson('/api/v1/calendar?start_date=not-a-date')
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
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
