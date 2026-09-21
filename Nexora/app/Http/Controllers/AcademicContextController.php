<?php

namespace App\Http\Controllers;

use App\Models\CurriculumVersion;
use App\Models\Grade;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Services\AcademicContextService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AcademicContextController extends ApiController
{
    public function __construct(
        private readonly AcademicContextService $academicContextService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->ensureAdministrator($request);

        return $this->success([
            'school_years' => SchoolYear::query()->with('terms')->latest('start_date')->get(),
            'grades' => Grade::query()->orderBy('name')->get(),
            'subjects' => Subject::query()->orderBy('name')->get(),
            'curriculum_versions' => CurriculumVersion::query()->latest('effective_date')->get(),
        ], 'Academic context retrieved successfully.');
    }

    public function storeSchoolYear(Request $request): JsonResponse
    {
        $this->ensureAdministrator($request);

        $schoolYear = $this->academicContextService->createSchoolYear(
            $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:school_years,name'],
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after:start_date'],
                'is_active' => ['sometimes', 'boolean'],
            ])
        );

        return $this->success($schoolYear, 'School year created successfully.', 201);
    }

    public function storeTerm(Request $request): JsonResponse
    {
        $this->ensureAdministrator($request);

        $term = $this->academicContextService->createTerm(
            $request->validate([
                'school_year_id' => ['required', 'integer', 'exists:school_years,id'],
                'name' => ['required', 'string', 'max:255'],
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after:start_date'],
                'is_active' => ['sometimes', 'boolean'],
            ])
        );

        return $this->success($term, 'Term created successfully.', 201);
    }

    public function storeGrade(Request $request): JsonResponse
    {
        $this->ensureAdministrator($request);

        $grade = $this->academicContextService->createGrade(
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
            ])
        );

        return $this->success($grade, 'Grade created successfully.', 201);
    }

    public function storeSubject(Request $request): JsonResponse
    {
        $this->ensureAdministrator($request);

        $subject = $this->academicContextService->createSubject(
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'code' => ['nullable', 'string', 'max:100'],
            ])
        );

        return $this->success($subject, 'Subject created successfully.', 201);
    }

    public function storeCurriculumVersion(Request $request): JsonResponse
    {
        $this->ensureCurriculumManager($request);

        $curriculumVersion = $this->academicContextService->createCurriculumVersion(
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'code' => ['nullable', 'string', 'max:100'],
                'description' => ['nullable', 'string'],
                'effective_date' => ['nullable', 'date'],
                'is_active' => ['sometimes', 'boolean'],
            ])
        );

        return $this->success(
            $curriculumVersion,
            'Curriculum version created successfully.',
            201
        );
    }

    public function storeCompetency(Request $request): JsonResponse
    {
        $this->ensureCurriculumManager($request);

        $competency = $this->academicContextService->createCompetency(
            $request->validate([
                'curriculum_version_id' => ['required', 'integer', 'exists:curriculum_versions,id'],
                'grade_id' => ['required', 'integer', 'exists:grades,id'],
                'subject_id' => ['required', 'integer', 'exists:subjects,id'],
                'term_id' => ['required', 'integer', 'exists:terms,id'],
                'code' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('competencies', 'code')->where(
                        fn ($query) => $query
                            ->where(
                                'curriculum_version_id',
                                $request->integer('curriculum_version_id')
                            )
                            ->where('grade_id', $request->integer('grade_id'))
                            ->where('subject_id', $request->integer('subject_id'))
                            ->where('term_id', $request->integer('term_id'))
                    ),
                ],
                'description' => ['required', 'string'],
                'learning_area' => ['nullable', 'string', 'max:255'],
            ])
        );

        return $this->success($competency, 'Competency created successfully.', 201);
    }

    private function ensureAdministrator(Request $request): void
    {
        if (! $request->user()->hasAnyRole([
            'administrator',
            'system_administrator',
        ])) {
            throw new AuthorizationException;
        }
    }

    private function ensureCurriculumManager(Request $request): void
    {
        if (! $request->user()->hasAnyRole([
            'administrator',
            'system_administrator',
            'curriculum_coordinator',
        ])) {
            throw new AuthorizationException;
        }
    }
}
