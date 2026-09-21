<?php

namespace App\Services;

use App\Models\Competency;
use Illuminate\Database\Eloquent\Collection;

class CompetencyService
{
    /**
     * Get competencies using optional filters.
     */
    public function search(array $filters = []): Collection
    {
        return Competency::query()
            ->when(
                isset($filters['curriculum_version_id']),
                fn ($query) => $query->where(
                    'curriculum_version_id',
                    $filters['curriculum_version_id']
                )
            )
            ->when(
                isset($filters['grade_id']),
                fn ($query) => $query->where(
                    'grade_id',
                    $filters['grade_id']
                )
            )
            ->when(
                isset($filters['subject_id']),
                fn ($query) => $query->where(
                    'subject_id',
                    $filters['subject_id']
                )
            )
            ->when(
                isset($filters['term_id']),
                fn ($query) => $query->where(
                    'term_id',
                    $filters['term_id']
                )
            )
            ->orderBy('code')
            ->get();
    }
}
