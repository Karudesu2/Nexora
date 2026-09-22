<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PlanningContextController extends ApiController
{
    public function index(): JsonResponse
    {
        $context = Cache::remember(
            'planning-context',
            now()->addMinutes(30),
            function () {
                return [
                    'school_years' => SchoolYear::query()
                        ->select(['id', 'name'])
                        ->orderByDesc('is_active')
                        ->orderByDesc('start_date')
                        ->get(),

                    'terms' => Term::query()
                        ->select(['id', 'school_year_id', 'name'])
                        ->orderByDesc('is_active')
                        ->orderBy('start_date')
                        ->get(),

                    'grades' => Grade::query()
                        ->select(['id', 'name'])
                        ->orderBy('name')
                        ->get(),

                    'subjects' => Subject::query()
                        ->select(['id', 'name'])
                        ->orderBy('name')
                        ->get(),
                ];
            }
        );

        return $this->success(
            $context,
            'Planning context retrieved successfully.'
        );
    }
}