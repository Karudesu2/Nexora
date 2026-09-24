<?php

namespace Tests\Feature;

use App\Models\Competency;
use App\Models\CurriculumVersion;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Notification;
use App\Models\Role;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlanningModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_save_lesson_planning_details_and_map_a_competency(): void
    {
        $teacher = User::factory()->create();
        $context = $this->createContext();
        $lesson = $this->createLesson($teacher, $context);

        Sanctum::actingAs($teacher);

        $this->putJson("/api/v1/lessons/{$lesson->id}/planning", [
            'objectives' => ['Identify a claim in a text.'],
            'activities' => [[
                'title' => 'Claim sorting activity',
                'duration_minutes' => 20,
            ]],
            'resources' => [[
                'name' => 'Reading guide',
                'url' => 'https://example.test/reading-guide',
            ]],
            'competency_ids' => [$context['competency']->id],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.objectives')
            ->assertJsonCount(1, 'data.activities')
            ->assertJsonCount(1, 'data.competencies');

        $this->getJson('/api/v1/alignment')
            ->assertOk()
            ->assertJsonPath('data.0.lesson_id', $lesson->id)
            ->assertJsonPath('data.0.checks.competency', true)
            ->assertJsonPath('data.0.checks.objectives', true)
            ->assertJsonPath('data.0.checks.activities', true);
    }

    public function test_teacher_can_store_and_retrieve_a_link_resource(): void
    {
        $teacher = User::factory()->create();
        Sanctum::actingAs($teacher);

        $this->postJson('/api/v1/resources', [
            'name' => 'Reading guide',
            'type' => 'Reference material',
            'external_url' => 'https://example.test/reading-guide',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Reading guide');

        $this->getJson('/api/v1/resources')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_resource_files_are_private_and_downloadable_by_the_owner(): void
    {
        Storage::fake('local');
        $teacher = User::factory()->create();
        $otherTeacher = User::factory()->create();

        Sanctum::actingAs($teacher);
        $response = $this->post('/api/v1/resources', [
            'name' => 'Lesson handout',
            'file' => UploadedFile::fake()->create('handout.pdf', 100, 'application/pdf'),
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Lesson handout');

        $resource = $response->json('data');
        Storage::disk('local')->assertExists($resource['file_path']);

        $this->get("/api/v1/resources/{$resource['id']}/download")
            ->assertOk();

        Sanctum::actingAs($otherTeacher);
        $this->get("/api/v1/resources/{$resource['id']}/download")
            ->assertForbidden();
    }

    public function test_school_administrator_can_create_academic_context_and_teacher_cannot(): void
    {
        $teacher = User::factory()->create();
        $administrator = User::factory()->create();
        $administrator->roles()->attach(Role::create([
            'name' => 'School Administrator',
            'code' => 'school_administrator',
        ]));

        Sanctum::actingAs($teacher);
        $this->postJson('/api/v1/admin/grades', ['name' => 'Grade 7'])
            ->assertForbidden();

        Sanctum::actingAs($administrator);
        $this->postJson('/api/v1/admin/school-years', [
            'name' => '2026-2027',
            'start_date' => '2026-06-01',
            'end_date' => '2027-03-31',
            'is_active' => true,
        ])->assertCreated();

        $this->postJson('/api/v1/admin/grades', ['name' => 'Grade 7'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Grade 7');

        $this->getJson('/api/v1/admin/academic-context')
            ->assertOk()
            ->assertJsonPath('data.school_years.0.name', '2026-2027')
            ->assertJsonPath('data.grades.0.name', 'Grade 7');
    }

    public function test_notification_can_only_be_read_by_its_owner(): void
    {
        $teacher = User::factory()->create();
        $otherTeacher = User::factory()->create();
        $notification = Notification::create([
            'user_id' => $otherTeacher->id,
            'title' => 'Private reminder',
            'message' => 'This is private.',
        ]);

        Sanctum::actingAs($teacher);

        $this->patchJson("/api/v1/notifications/{$notification->id}/read")
            ->assertForbidden();
    }

    public function test_competencies_must_match_a_lessons_context(): void
    {
        $teacher = User::factory()->create();
        $context = $this->createContext();
        $lesson = $this->createLesson($teacher, $context);
        $otherGrade = Grade::create(['name' => 'Grade 8']);
        $otherCompetency = Competency::create([
            'curriculum_version_id' => $context['competency']->curriculum_version_id,
            'grade_id' => $otherGrade->id,
            'subject_id' => $context['subject']->id,
            'term_id' => $context['term']->id,
            'code' => 'EN8LT-Ia-3',
            'description' => 'Analyze a claim in a literary text.',
        ]);

        Sanctum::actingAs($teacher);

        $this->putJson("/api/v1/lessons/{$lesson->id}/planning", [
            'competency_ids' => [$otherCompetency->id],
        ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'errors.competency_ids.0',
                'Each competency must match the lesson grade, subject, and term.'
            );
    }

    public function test_competency_list_includes_context_ids_for_planner_filtering(): void
    {
        $teacher = User::factory()->create();
        $context = $this->createContext();

        Sanctum::actingAs($teacher);

        $this->getJson('/api/v1/competencies')
            ->assertOk()
            ->assertJsonPath('data.0.id', $context['competency']->id)
            ->assertJsonPath('data.0.grade_id', $context['grade']->id)
            ->assertJsonPath('data.0.subject_id', $context['subject']->id)
            ->assertJsonPath('data.0.term_id', $context['term']->id);
    }

    /**
     * @return array{schoolYear: SchoolYear, term: Term, grade: Grade, subject: Subject, competency: Competency}
     */
    private function createContext(): array
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
        $grade = Grade::create(['name' => 'Grade 7']);
        $subject = Subject::create(['name' => 'English']);
        $curriculumVersion = CurriculumVersion::create([
            'name' => 'MATATAG',
            'is_active' => true,
        ]);
        $competency = Competency::create([
            'curriculum_version_id' => $curriculumVersion->id,
            'grade_id' => $grade->id,
            'subject_id' => $subject->id,
            'term_id' => $term->id,
            'code' => 'EN7LT-Ia-3',
            'description' => 'Analyze a claim in a literary text.',
        ]);

        return compact(
            'schoolYear',
            'term',
            'grade',
            'subject',
            'competency'
        );
    }

    /**
     * @param  array{schoolYear: SchoolYear, term: Term, grade: Grade, subject: Subject, competency: Competency}  $context
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
            'title' => 'Reading claims',
            'lesson_date' => '2026-09-21',
            'status' => 'Scheduled',
        ]);
    }
}
