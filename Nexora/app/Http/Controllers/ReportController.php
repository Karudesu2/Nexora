<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Lesson;
use App\Services\PacingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends ApiController
{
    public function __construct(
        private readonly PacingService $pacingService
    ) {}

    /**
     * Basic lesson report.
     */
    public function lessons(Request $request): JsonResponse
    {
        $lessons = Lesson::query()
            ->where('teacher_id', $request->user()->id)
            ->select([
                'id', 'term_id', 'grade_id', 'subject_id', 'section', 'title',
                'lesson_date', 'status',
            ])
            ->with([
                'grade:id,name',
                'subject:id,name',
                'term:id,name',
            ])
            ->orderBy('lesson_date')
            ->get();

        return $this->success(
            [
                'total' => $lessons->count(),
                'lessons' => $lessons,
            ],
            'Lesson report generated successfully.'
        );
    }

    public function overview(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;
        $lessonCounts = Lesson::query()
            ->where('teacher_id', $teacherId)
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed")
            ->selectRaw("COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled")
            ->first();
        $assessments = Assessment::query()
            ->whereHas('lesson', fn ($query) => $query->where('teacher_id', $teacherId))
            ->count();

        return $this->success([
            'lessons' => [
                'total' => (int) $lessonCounts->total,
                'completed' => (int) $lessonCounts->completed,
                'scheduled' => (int) $lessonCounts->scheduled,
            ],
            'assessments' => $assessments,
            'pacing' => $this->pacingService->getTeacherPacing($teacherId),
        ], 'Report overview generated successfully.');
    }
}
