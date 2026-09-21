<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssessmentRequest;
use App\Models\Assessment;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
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
            ->with('lesson')
            ->orderByDesc('assessment_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assessments,
        ]);
    }

    /**
     * Create assessment.
     */
    public function store(
        StoreAssessmentRequest $request
    ): JsonResponse {
        $lesson = Lesson::findOrFail($request->integer('lesson_id'));

        $this->authorize('update', $lesson);

        $assessment = Assessment::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Assessment created successfully.',
            'data' => $assessment,
        ], 201);
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

        return response()->json([
            'success' => true,
            'data' => $assessment,
        ]);
    }

    /**
     * Update assessment.
     */
    public function update(
        StoreAssessmentRequest $request,
        Assessment $assessment
    ): JsonResponse {
        $this->authorize('update', $assessment);

        $assessment->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Assessment updated successfully.',
            'data' => $assessment->refresh(),
        ]);
    }

    /**
     * Delete assessment.
     */
    public function destroy(
        Request $request,
        Assessment $assessment
    ): JsonResponse {
        $this->authorize('delete', $assessment);
        $assessment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Assessment deleted successfully.',
        ]);
    }
}
