<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Services\CurriculumMappingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonPlanningController extends ApiController
{
    public function __construct(
        private readonly CurriculumMappingService $curriculumMappingService
    ) {}

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson);

        $data = $request->validate([
            'objectives' => ['sometimes', 'array', 'max:20'],
            'objectives.*' => ['required', 'string', 'max:5000'],
            'activities' => ['sometimes', 'array', 'max:30'],
            'activities.*.title' => ['required', 'string', 'max:255'],
            'activities.*.description' => ['nullable', 'string'],
            'activities.*.activity_type' => ['nullable', 'string', 'max:100'],
            'activities.*.duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'resources' => ['sometimes', 'array', 'max:20'],
            'resources.*.name' => ['required', 'string', 'max:255'],
            'resources.*.type' => ['nullable', 'string', 'max:100'],
            'resources.*.url' => ['nullable', 'url', 'max:2048'],
            'competency_ids' => ['sometimes', 'array', 'max:20'],
            'competency_ids.*' => ['integer', 'exists:competencies,id'],
            'differentiation' => ['nullable', 'string'],
            'reflection' => ['sometimes', 'array'],
            'reflection.what_went_well' => ['nullable', 'string'],
            'reflection.challenges' => ['nullable', 'string'],
            'reflection.student_learning' => ['nullable', 'string'],
            'reflection.next_steps' => ['nullable', 'string'],
            'reflection.teacher_notes' => ['nullable', 'string'],
        ]);

        if (array_key_exists('competency_ids', $data)) {
            $this->curriculumMappingService->ensureCompatible(
                $lesson,
                $data['competency_ids']
            );
        }

        DB::transaction(function () use ($lesson, $data): void {
            if (array_key_exists('differentiation', $data)) {
                $lesson->update([
                    'differentiation' => $data['differentiation'],
                ]);
            }

            if (array_key_exists('objectives', $data)) {
                $lesson->objectives()->delete();
                $lesson->objectives()->createMany(
                    collect($data['objectives'])
                        ->values()
                        ->map(fn (string $objective, int $index): array => [
                            'objective' => $objective,
                            'sort_order' => $index + 1,
                        ])
                        ->all()
                );
            }

            if (array_key_exists('activities', $data)) {
                $lesson->activities()->delete();
                $lesson->activities()->createMany(
                    collect($data['activities'])
                        ->values()
                        ->map(fn (array $activity, int $index): array => [
                            ...$activity,
                            'sort_order' => $index + 1,
                        ])
                        ->all()
                );
            }

            if (array_key_exists('resources', $data)) {
                $lesson->resources()->delete();
                $lesson->resources()->createMany($data['resources']);
            }

            if (array_key_exists('competency_ids', $data)) {
                $lesson->competencies()->sync($data['competency_ids']);
            }

            if (array_key_exists('reflection', $data)) {
                $lesson->reflections()->updateOrCreate([], $data['reflection']);
            }
        });

        return $this->success(
            $lesson->fresh()->load([
                'objectives',
                'activities',
                'resources',
                'reflections',
                'competencies',
            ]),
            'Lesson plan details saved successfully.'
        );
    }
}
