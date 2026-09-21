<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Models\Lesson;
use App\Services\LessonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
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

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Lesson created successfully.',
            'data' => $lesson,
        ], 201);
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

        return response()->json([
            'success' => true,
            'data' => $lesson,
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Lesson updated successfully.',
            'data' => $lesson,
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully.',
        ]);
    }
}
