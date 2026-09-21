<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Role;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_api_endpoints_return_a_consistent_unauthenticated_response(): void
    {
        $this->getJson('/api/v1/dashboard')
            ->assertUnauthorized()
            ->assertExactJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_user_can_login_and_retrieve_their_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'teacher@example.test',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $user->id);

        $this->withToken($loginResponse->json('data.token'))
            ->getJson('/api/v1/auth/profile')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id);
    }

    public function test_lesson_validation_errors_use_the_standard_api_response(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/lessons', [])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure(['errors' => ['school_year_id', 'term_id', 'grade_id', 'subject_id', 'section', 'title', 'lesson_date']]);
    }

    public function test_dashboard_counts_only_the_authenticated_teachers_assessments(): void
    {
        $teacher = User::factory()->create();
        $otherTeacher = User::factory()->create();
        $context = $this->createAcademicContext();

        Assessment::create([
            'lesson_id' => $this->createLesson($teacher, $context)->id,
            'title' => 'Teacher Assessment',
        ]);
        Assessment::create([
            'lesson_id' => $this->createLesson($otherTeacher, $context)->id,
            'title' => 'Other Assessment',
        ]);

        Sanctum::actingAs($teacher);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.assessments', 1);
    }

    public function test_teacher_cannot_create_an_assessment_for_another_teachers_lesson(): void
    {
        $teacher = User::factory()->create();
        $otherTeacher = User::factory()->create();
        $context = $this->createAcademicContext();
        $lesson = $this->createLesson($otherTeacher, $context);

        Sanctum::actingAs($teacher);

        $this->postJson('/api/v1/assessments', [
            'lesson_id' => $lesson->id,
            'title' => 'Unauthorized Assessment',
            'type' => 'Quiz',
        ])->assertForbidden();
    }

    public function test_only_administrators_can_create_calendar_events(): void
    {
        $teacher = User::factory()->create();
        $administrator = User::factory()->create();
        $context = $this->createAcademicContext();
        $payload = [
            'school_year_id' => $context['schoolYear']->id,
            'term_id' => $context['term']->id,
            'title' => 'Faculty Development Day',
            'type' => 'Teacher Activity',
            'start_date' => '2026-10-01',
            'is_instructional_day' => false,
        ];

        Sanctum::actingAs($teacher);
        $this->postJson('/api/v1/calendar', $payload)->assertForbidden();

        $administrator->roles()->attach(Role::create([
            'name' => 'School Administrator',
            'code' => 'administrator',
        ]));
        Sanctum::actingAs($administrator);

        $this->postJson('/api/v1/calendar', $payload)
            ->assertCreated()
            ->assertJsonPath('data.type', 'Teacher Activity');
    }

    /**
     * @return array{schoolYear: SchoolYear, term: Term, grade: Grade, subject: Subject}
     */
    private function createAcademicContext(): array
    {
        $schoolYear = SchoolYear::create([
            'name' => '2026-2027',
            'start_date' => '2026-06-01',
            'end_date' => '2027-03-31',
            'is_active' => true,
        ]);
        $term = Term::create([
            'school_year_id' => $schoolYear->id,
            'name' => 'Term 1',
            'start_date' => '2026-06-01',
            'end_date' => '2026-08-31',
            'is_active' => true,
        ]);

        return [
            'schoolYear' => $schoolYear,
            'term' => $term,
            'grade' => Grade::create(['name' => 'Grade 7']),
            'subject' => Subject::create(['name' => 'English']),
        ];
    }

    /**
     * @param  array{schoolYear: SchoolYear, term: Term, grade: Grade, subject: Subject}  $context
     */
    private function createLesson(User $teacher, array $context): Lesson
    {
        return Lesson::create([
            'teacher_id' => $teacher->id,
            'school_year_id' => $context['schoolYear']->id,
            'term_id' => $context['term']->id,
            'grade_id' => $context['grade']->id,
            'subject_id' => $context['subject']->id,
            'section' => 'A',
            'title' => 'Lesson',
            'lesson_date' => '2026-09-21',
        ]);
    }
}
