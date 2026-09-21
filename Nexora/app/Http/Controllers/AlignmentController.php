<?php

namespace App\Http\Controllers;

use App\Models\Competency;
use App\Models\Lesson;
use App\Services\AlignmentService;
use App\Services\CurriculumMappingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlignmentController extends ApiController
{
    public function __construct(
        private readonly AlignmentService $alignmentService,
        private readonly CurriculumMappingService $curriculumMappingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $lessons = Lesson::query()
            ->where('teacher_id', $request->user()->id)
            ->with(['competencies:id,code,description'])
            ->withCount([
                'competencies',
                'objectives',
                'activities',
                'resources',
                'assessments',
            ])
            ->withExists('reflections')
            ->latest('lesson_date')
            ->get()
            ->map(function (Lesson $lesson): array {
                $alignment = $this->alignmentService->evaluate($lesson);

                return [
                    'lesson_id' => $lesson->id,
                    'lesson_title' => $lesson->title,
                    'lesson_date' => $lesson->lesson_date?->toDateString(),
                    ...$alignment,
                    'competencies' => $lesson->competencies,
                ];
            });

        return $this->success($lessons, 'Alignment overview retrieved successfully.');
    }

    public function mapCompetency(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        $this->authorize('update', $lesson);

        $data = $request->validate([
            'competency_id' => ['required', 'integer', 'exists:competencies,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $competency = Competency::findOrFail($data['competency_id']);
        $this->curriculumMappingService->ensureCompatible($lesson, [$competency->id]);

        $lesson->competencies()->syncWithoutDetaching([
            $competency->id => ['notes' => $data['notes'] ?? null],
        ]);

        return $this->success(
            $lesson->competencies()->get(),
            'Competency mapped successfully.',
            201
        );
    }

    public function unmapCompetency(
        Request $request,
        Lesson $lesson,
        Competency $competency
    ): JsonResponse {
        $this->authorize('update', $lesson);

        $lesson->competencies()->detach($competency->id);

        return $this->success(message: 'Competency mapping removed successfully.');
    }
}
