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
            ->with([
                'grade',
                'subject',
                'term',
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
        $lessons = Lesson::query()->where('teacher_id', $teacherId)->get();
        $assessments = Assessment::query()
            ->whereHas('lesson', fn ($query) => $query->where('teacher_id', $teacherId))
            ->count();

        return $this->success([
            'lessons' => [
                'total' => $lessons->count(),
                'completed' => $lessons->where('status', 'Completed')->count(),
                'scheduled' => $lessons->where('status', 'Scheduled')->count(),
            ],
            'assessments' => $assessments,
            'pacing' => $this->pacingService->getTeacherPacing($teacherId),
        ], 'Report overview generated successfully.');
    }
}
