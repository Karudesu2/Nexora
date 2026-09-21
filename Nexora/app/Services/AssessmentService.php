<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    public function __construct(
        private readonly CurriculumMappingService $curriculumMappingService
    ) {}

    /**
     * Create assessment.
     */
    public function create(array $data): Assessment
    {
        return DB::transaction(function () use ($data) {
            $competencyIds = $data['competency_ids'] ?? [];
            unset($data['competency_ids']);

            $assessment = Assessment::create($data);
            $assessment->load('lesson');
            $this->curriculumMappingService->ensureCompatible(
                $assessment->lesson,
                $competencyIds
            );
            $assessment->competencies()->sync($competencyIds);

            Notification::create([
                'user_id' => $assessment->lesson->teacher_id,
                'title' => 'Assessment scheduled',
                'message' => sprintf('%s has been added to your assessment plan.', $assessment->title),
                'type' => 'assessment',
                'action_url' => '/assessments',
            ]);

            return $assessment->load('competencies');
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
            $competencyIds = $data['competency_ids'] ?? null;
            unset($data['competency_ids']);

            $assessment->update($data);

            if ($competencyIds !== null) {
                $this->curriculumMappingService->ensureCompatible(
                    $assessment->lesson,
                    $competencyIds
                );
                $assessment->competencies()->sync($competencyIds);
            }

            return $assessment->refresh()->load('competencies');
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
