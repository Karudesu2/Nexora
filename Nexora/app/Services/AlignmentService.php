<?php

namespace App\Services;

use App\Models\Lesson;

class AlignmentService
{
    /**
     * @return array{score: int, level: string, checks: array<string, bool>}
     */
    public function evaluate(Lesson $lesson): array
    {
        $checks = [
            'competency' => $lesson->competencies_count > 0,
            'objectives' => $lesson->objectives_count > 0,
            'content' => filled($lesson->content),
            'activities' => $lesson->activities_count > 0,
            'assessment' => $lesson->assessments_count > 0,
            'resources' => $lesson->resources_count > 0,
            'differentiation' => filled($lesson->differentiation),
            'reflection' => $lesson->reflections_exists,
        ];
        $weights = config('alignment.weights');
        $score = (int) collect($weights)
            ->filter(fn (int $weight, string $component): bool => $checks[$component])
            ->sum();
        $levels = config('alignment.levels');

        return [
            'score' => $score,
            'level' => match (true) {
                $score >= $levels['very_strong'] => 'Very Strong',
                $score >= $levels['strong'] => 'Strong',
                $score >= $levels['partial'] => 'Partial',
                default => 'Weak',
            },
            'checks' => $checks,
        ];
    }
}
