<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Models\Lesson;
use App\Services\LessonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends ApiController
{
    public function __construct(
        private readonly LessonService $lessonService
    ) {}

    /**
     * Display teacher lessons.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Lesson::class);

        $lessons = Lesson::query()
            ->where('teacher_id', $request->user()->id)
            ->with([
                'schoolYear',
                'term',
                'grade',
                'subject',
            ])
            ->orderByDesc('lesson_date')
            ->get();

        return $this->success($lessons, 'Lessons retrieved successfully.');
    }

    /**
     * Create lesson.
     */
    public function store(StoreLessonRequest $request): JsonResponse
    {
        $this->authorize('create', Lesson::class);

        $lesson = $this->lessonService->create(
            $request->user()->id,
            $request->validated()
        );

        return $this->success($lesson, 'Lesson created successfully.', 201);
    }

    /**
     * Display one lesson.
     */
    public function show(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('view', $lesson);

        $lesson->load([
            'schoolYear',
            'term',
            'grade',
            'subject',
            'objectives',
            'activities',
            'resources',
            'reflections',
            'competencies',
            'assessments',
        ]);

        return $this->success($lesson, 'Lesson retrieved successfully.');
    }

    /**
     * Update lesson.
     */
    public function update(
        StoreLessonRequest $request,
        Lesson $lesson
    ): JsonResponse {
        $this->authorize('update', $lesson);

        $lesson = $this->lessonService->update(
            $lesson,
            $request->validated()
        );

        return $this->success($lesson, 'Lesson updated successfully.');
    }

    /**
     * Delete lesson.
     */
    public function destroy(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        $this->authorize('delete', $lesson);

        $this->lessonService->delete($lesson);

        return $this->success(message: 'Lesson deleted successfully.');
    }
}
