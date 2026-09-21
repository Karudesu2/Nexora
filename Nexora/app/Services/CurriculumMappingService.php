<?php

namespace App\Services;

use App\Models\Competency;
use App\Models\Lesson;
use Illuminate\Validation\ValidationException;

class CurriculumMappingService
{
    /**
     * Ensure competencies come from the exact grade, subject, and term of a lesson.
     *
     * @param  array<int, int>  $competencyIds
     */
    public function ensureCompatible(Lesson $lesson, array $competencyIds): void
    {
        $ids = array_values(array_unique(array_map('intval', $competencyIds)));

        if ($ids === []) {
            return;
        }

        $compatibleCount = Competency::query()
            ->whereIn('id', $ids)
            ->where('grade_id', $lesson->grade_id)
            ->where('subject_id', $lesson->subject_id)
            ->where('term_id', $lesson->term_id)
            ->count();

        if ($compatibleCount !== count($ids)) {
            throw ValidationException::withMessages([
                'competency_ids' => [
                    'Each competency must match the lesson grade, subject, and term.',
                ],
            ]);
        }
    }
}
