<?php

namespace App\Http\Controllers;

use App\Models\Competency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetencyController extends ApiController
{
    /**
     * Display competencies.
     */
    public function index(Request $request): JsonResponse
    {
        $competencies = Competency::query()
            ->when(
                $request->filled('curriculum_version_id'),
                fn ($query) => $query->where(
                    'curriculum_version_id',
                    $request->curriculum_version_id
                )
            )
            ->when(
                $request->filled('grade_id'),
                fn ($query) => $query->where(
                    'grade_id',
                    $request->grade_id
                )
            )
            ->when(
                $request->filled('subject_id'),
                fn ($query) => $query->where(
                    'subject_id',
                    $request->subject_id
                )
            )
            ->when(
                $request->filled('term_id'),
                fn ($query) => $query->where(
                    'term_id',
                    $request->term_id
                )
            )
            ->select([
                'id',
                'grade_id',
                'subject_id',
                'term_id',
                'code',
                'description',
                'learning_area',
            ])
            ->orderBy('code')
            ->get();

        return $this->success($competencies, 'Competencies retrieved successfully.');
    }

    /**
     * Display one competency.
     */
    public function show(Competency $competency): JsonResponse
    {
        return $this->success($competency, 'Competency retrieved successfully.');
    }
}
