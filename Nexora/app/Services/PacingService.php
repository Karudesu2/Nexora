<?php

namespace App\Services;

use App\Models\Lesson;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class PacingService
{
    /**
     * Calculate teacher lesson pacing.
     */
    public function getTeacherPacing(int $teacherId): array
    {
        return Cache::store('file')->remember(
            $this->cacheKey($teacherId),
            now()->addMinutes(5),
            function () use ($teacherId): array {
                $counts = Lesson::query()
                    ->where('teacher_id', $teacherId)
                    ->whereNotIn('status', ['Cancelled', 'Archived'])
                    ->selectRaw('COUNT(*) as planned')
                    ->selectRaw("SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed")
                    ->selectRaw(
                        'SUM(CASE WHEN lesson_date <= ? THEN 1 ELSE 0 END) as expected',
                        [Carbon::today()->toDateString()]
                    )
                    ->first();

                $planned = (int) $counts->planned;
                $completed = (int) $counts->completed;
                $expectedLessons = (int) $counts->expected;
                $remaining = max($planned - $completed, 0);
                $percentage = $planned > 0
                    ? round(($completed / $planned) * 100, 2)
                    : 0;
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
        );
    }

    public function forgetTeacherPacing(int $teacherId): void
    {
        Cache::store('file')->forget($this->cacheKey($teacherId));
    }

    private function cacheKey(int $teacherId): string
    {
        return "pacing:teacher:{$teacherId}";
    }
}
