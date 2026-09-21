<?php

namespace App\Services;

use App\Models\Lesson;
use Illuminate\Support\Carbon;

class PacingService
{
    /**
     * Calculate teacher lesson pacing.
     */
    public function getTeacherPacing(int $teacherId): array
    {
        $lessons = Lesson::query()
            ->where('teacher_id', $teacherId)
            ->whereNotIn('status', ['Cancelled', 'Archived'])
            ->orderBy('lesson_date')
            ->get();

        $planned = $lessons->count();

        $completed = $lessons
            ->where('status', 'Completed')
            ->count();

        $remaining = max($planned - $completed, 0);

        $percentage = $planned > 0
            ? round(($completed / $planned) * 100, 2)
            : 0;

        $expectedLessons = $lessons
            ->filter(
                fn (Lesson $lesson): bool => $lesson->lesson_date->lessThanOrEqualTo(
                    Carbon::today()
                )
            )
            ->count();

        $expectedPercentage = $planned > 0
            ? round(($expectedLessons / $planned) * 100, 2)
            : 0;

        $difference = round($percentage - $expectedPercentage, 2);
        $thresholds = config('pacing.thresholds');
        $status = match (true) {
            $planned === 0 => 'On Track',
            $difference >= $thresholds['ahead'] => 'Ahead',
            $difference >= $thresholds['on_track'] => 'On Track',
            $difference >= $thresholds['behind'] => 'Behind',
            default => 'At Risk',
        };

        return [
            'planned_lessons' => $planned,
            'completed_lessons' => $completed,
            'remaining_lessons' => $remaining,
            'completion_percentage' => $percentage,
            'expected_progress_percentage' => $expectedPercentage,
            'progress_difference' => $difference,
            'status' => $status,
            'recovery_actions' => $difference < -5 ? [
                'Create a catch-up day',
                'Reschedule a lesson',
                'Review the lesson sequence',
                'Keep the current plan',
            ] : [],
        ];
    }
}
