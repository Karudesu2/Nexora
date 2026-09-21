<?php

namespace App\Services;

use App\Models\CalendarEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class CalendarService
{
    /**
     * Get calendar events within a date range.
     */
    public function getEvents(
        Carbon $start,
        Carbon $end
    ): Collection {
        return CalendarEvent::query()
            ->whereDate('start_date', '<=', $end)
            ->where(function ($query) use ($start) {
                $query
                    ->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $start);
            })
            ->orderBy('start_date')
            ->get();
    }

    /**
     * Determine whether a date is an instructional day.
     */
    public function isInstructionalDay(Carbon $date): bool
    {
        if ($date->isWeekend()) {
            return false;
        }

        $eventExists = CalendarEvent::query()
            ->whereDate('start_date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query
                    ->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $date);
            })
            ->where('is_instructional_day', false)
            ->exists();

        return ! $eventExists;
    }
}
