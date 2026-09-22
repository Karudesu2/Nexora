<?php

namespace App\Http\Controllers;

use App\Models\Competency;
use App\Models\CurriculumVersion;
use App\Models\Lesson;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends ApiController
{
    public function index(): JsonResponse
    {
        $totalLessons = Lesson::query()->count();
        $completedLessons = Lesson::query()->where('status', 'Completed')->count();

        return $this->success([
            'school_year' => SchoolYear::query()->where('is_active', true)->first(['id', 'name']),
            'term' => Term::query()->where('is_active', true)->first(['id', 'name']),
            'active_curriculum_version' => CurriculumVersion::query()->where('is_active', true)->first(['id', 'name', 'code']),
            'teachers' => User::query()->whereHas('roles', fn ($query) => $query->where('code', 'teacher'))->count(),
            'subjects' => Subject::query()->count(),
            'competencies' => Competency::query()->count(),
            'lesson_plans' => $totalLessons,
            'completed_lesson_plans' => $completedLessons,
            'planning_completion' => $totalLessons === 0 ? 0 : (int) round(($completedLessons / $totalLessons) * 100),
        ], 'Administrator dashboard retrieved successfully.');
    }
}
