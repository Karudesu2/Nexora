<?php

namespace App\Services;

use App\Models\Lesson;

class PacingService
{
    /**
     * Calculate teacher lesson pacing.
     */
    public function getTeacherPacing(int $teacherId): array
    {
        $lessons = Lesson::where('teacher_id', $teacherId)->get();

        $planned = $lessons->count();

        $completed = $lessons
            ->where('status', 'Completed')
            ->count();

        $remaining = max($planned - $completed, 0);

        $percentage = $planned > 0
            ? round(($completed / $planned) * 100, 2)
            : 0;

        return [
            'planned_lessons' => $planned,
            'completed_lessons' => $completed,
            'remaining_lessons' => $remaining,
            'completion_percentage' => $percentage,
        ];
    }
}
