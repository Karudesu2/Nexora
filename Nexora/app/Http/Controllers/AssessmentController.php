<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssessmentRequest;
use App\Models\Assessment;
use App\Models\Lesson;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends ApiController
{
    public function __construct(
        private readonly AssessmentService $assessmentService
    ) {}

    /**
     * Display assessments.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Assessment::class);

        $assessments = Assessment::query()
            ->whereHas(
                'lesson',
                fn ($query) => $query->where(
                    'teacher_id',
                    $request->user()->id
                )
            )
            ->select([
                'id', 'lesson_id', 'title', 'type', 'assessment_date',
                'total_points',
            ])
            ->with('lesson:id,title')
            ->orderByDesc('assessment_date')
            ->get();

        return $this->success($assessments, 'Assessments retrieved successfully.');
    }

    /**
     * Create assessment.
     */
    public function store(
        StoreAssessmentRequest $request
    ): JsonResponse {
        $lesson = Lesson::findOrFail($request->integer('lesson_id'));

        $this->authorize('update', $lesson);

        $assessment = $this->assessmentService->create($request->validated());

        return $this->success($assessment, 'Assessment created successfully.', 201);
    }

    /**
     * Display assessment.
     */
    public function show(Request $request, Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);

        $assessment->load([
            'lesson',
            'competencies',
        ]);

        return $this->success($assessment, 'Assessment retrieved successfully.');
    }

    /**
     * Update assessment.
     */
    public function update(
        StoreAssessmentRequest $request,
        Assessment $assessment
    ): JsonResponse {
        $this->authorize('update', $assessment);

        $assessment = $this->assessmentService->update(
            $assessment,
            $request->validated()
        );

        return $this->success($assessment, 'Assessment updated successfully.');
    }

    /**
     * Delete assessment.
     */
    public function destroy(
        Request $request,
        Assessment $assessment
    ): JsonResponse {
        $this->authorize('delete', $assessment);
        $this->assessmentService->delete($assessment);

        return $this->success(message: 'Assessment deleted successfully.');
    }
}
