<?php

namespace App\Services;

use App\Models\Assessment;
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    /**
     * Create assessment.
     */
    public function create(array $data): Assessment
    {
        return DB::transaction(function () use ($data) {
            return Assessment::create($data);
        });
    }

    /**
     * Update assessment.
     */
    public function update(
        Assessment $assessment,
        array $data
    ): Assessment {
        return DB::transaction(function () use ($assessment, $data) {
            $assessment->update($data);

            return $assessment->refresh();
        });
    }

    /**
     * Delete assessment.
     */
    public function delete(Assessment $assessment): void
    {
        DB::transaction(function () use ($assessment) {
            $assessment->delete();
        });
    }
}
