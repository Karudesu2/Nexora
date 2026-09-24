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

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Assessment::class);

        $assessments = Assessment::query()
            ->whereHas('lesson', function ($query) use ($request): void {
                $query->where('teacher_id', $request->user()->id);
            })
            ->select([
                'id',
                'lesson_id',
                'title',
                'type',
                'description',
                'total_points',
                'assessment_date',
            ])
            ->with('lesson:id,title')
            ->orderByDesc('assessment_date')
            ->get();

        return $this->success(
            $assessments,
            'Assessments retrieved successfully.'
        );
    }

    public function store(StoreAssessmentRequest $request): JsonResponse
    {
        $lesson = Lesson::findOrFail($request->integer('lesson_id'));
        $this->authorize('update', $lesson);

        $assessment = $this->assessmentService->create($request->validated());

        return $this->success(
            $assessment,
            'Assessment created successfully.',
            201
        );
    }

    public function show(Request $request, Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);

        return $this->success(
            $assessment->load(['lesson', 'competencies']),
            'Assessment retrieved successfully.'
        );
    }

    public function update(
        Request $request,
        Assessment $assessment
    ): JsonResponse {
        $this->authorize('update', $assessment);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:100'],
            'total_points' => ['nullable', 'numeric', 'min:0'],
            'assessment_date' => ['nullable', 'date'],
            'competency_ids' => ['sometimes', 'array', 'max:20'],
            'competency_ids.*' => ['integer', 'exists:competencies,id'],
        ]);

        $assessment = $this->assessmentService->update($assessment, $data);

        return $this->success(
            $assessment,
            'Assessment updated successfully.'
        );
    }

    public function destroy(Request $request, Assessment $assessment): JsonResponse
    {
        $this->authorize('delete', $assessment);
        $this->assessmentService->delete($assessment);

        return $this->success(
            message: 'Assessment deleted successfully.'
        );
    }
}
