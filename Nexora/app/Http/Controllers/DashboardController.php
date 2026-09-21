<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\CalendarEvent;
use App\Models\Competency;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user();
        $today = Carbon::today();

        $lessons = Lesson::query()
            ->where('teacher_id', $teacher->id);

        $todayLessons = (clone $lessons)
            ->whereDate('lesson_date', $today)
            ->with([
                'subject:id,name',
                'grade:id,name',
            ])
            ->orderBy('lesson_date')
            ->get();

        $upcomingLessons = (clone $lessons)
            ->whereDate('lesson_date', '>', $today)
            ->with([
                'subject:id,name',
                'grade:id,name',
            ])
            ->orderBy('lesson_date')
            ->limit(5)
            ->get();

        $totalLessons = (clone $lessons)->count();

        $completedLessons = (clone $lessons)
            ->where('status', 'Completed')
            ->count();

        $pendingLessons = (clone $lessons)
            ->whereIn('status', [
                'Draft',
                'Scheduled',
                'In Progress',
            ])
            ->count();

        $competenciesCount = Competency::query()->count();

        $assessmentsCount = Assessment::query()
            ->whereHas(
                'lesson',
                fn ($query) => $query->where('teacher_id', $teacher->id)
            )
            ->count();

        $calendarEvents = CalendarEvent::query()
            ->whereDate('start_date', '>=', $today)
            ->orderBy('start_date')
            ->limit(5)
            ->get();

        return $this->success(
            [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                ],

                'stats' => [
                    'total_lessons' => $totalLessons,
                    'completed_lessons' => $completedLessons,
                    'pending_lessons' => $pendingLessons,
                    'competencies' => $competenciesCount,
                    'assessments' => $assessmentsCount,
                ],

                'today' => [
                    'date' => $today->toDateString(),
                    'lessons' => $todayLessons,
                ],

                'upcoming_lessons' => $upcomingLessons,

                'calendar_events' => $calendarEvents,
            ],
            'Dashboard data retrieved successfully.'
        );
    }
}
