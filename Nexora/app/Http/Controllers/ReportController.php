<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends ApiController
{
    /**
     * Basic lesson report.
     */
    public function lessons(Request $request): JsonResponse
    {
        $lessons = Lesson::query()
            ->where('teacher_id', $request->user()->id)
            ->with([
                'grade',
                'subject',
                'term',
            ])
            ->orderBy('lesson_date')
            ->get();

        return $this->success(
            [
                'total' => $lessons->count(),
                'lessons' => $lessons,
            ],
            'Lesson report generated successfully.'
        );
    }
}
