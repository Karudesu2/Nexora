<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Http\JsonResponse;

class PlanningContextController extends ApiController
{
    public function index(): JsonResponse
    {
        return $this->success([
            'school_years' => SchoolYear::query()->orderByDesc('is_active')->orderByDesc('start_date')->get(),
            'terms' => Term::query()->with('schoolYear:id,name')->orderByDesc('is_active')->orderBy('start_date')->get(),
            'grades' => Grade::query()->orderBy('name')->get(),
            'subjects' => Subject::query()->orderBy('name')->get(),
        ], 'Planning context retrieved successfully.');
    }
}
