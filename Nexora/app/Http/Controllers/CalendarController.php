<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\Term;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CalendarController extends ApiController
{
    /**
     * Display calendar events.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CalendarEvent::class);

        $events = CalendarEvent::query()
            ->when(
                $request->filled('start_date'),
                fn ($query) => $query->whereDate(
                    'start_date',
                    '>=',
                    $request->start_date
                )
            )
            ->when(
                $request->filled('end_date'),
                fn ($query) => $query->whereDate(
                    'start_date',
                    '<=',
                    $request->end_date
                )
            )
            ->orderBy('start_date')
            ->get();

        return $this->success($events, 'Calendar events retrieved successfully.');
    }

    /**
     * Store calendar event.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', CalendarEvent::class);

        $data = $request->validate([
            'school_year_id' => ['required', 'integer', 'exists:school_years,id'],
            'term_id' => ['nullable', 'integer', 'exists:terms,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string'],
            'is_instructional_day' => ['boolean'],
        ]);

        if (isset($data['term_id'])) {
            $term = Term::find($data['term_id']);

            if ($term && $term->school_year_id !== $data['school_year_id']) {
                throw ValidationException::withMessages([
                    'term_id' => [
                        'The selected term must belong to the selected school year.',
                    ],
                ]);
            }
        }

        $event = CalendarEvent::create($data);

        return $this->success($event, 'Calendar event created successfully.', 201);
    }

    /**
     * Display one calendar event.
     */
    public function show(Request $request, CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('view', $calendarEvent);

        return $this->success($calendarEvent, 'Calendar event retrieved successfully.');
    }

    /**
     * Update calendar event.
     */
    public function update(
        Request $request,
        CalendarEvent $calendarEvent
    ): JsonResponse {
        $this->authorize('update', $calendarEvent);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:50'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_instructional_day' => ['boolean'],
        ]);

        $calendarEvent->update($data);

        return $this->success($calendarEvent->refresh(), 'Calendar event updated successfully.');
    }

    /**
     * Delete calendar event.
     */
    public function destroy(Request $request, CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('delete', $calendarEvent);

        $calendarEvent->delete();

        return $this->success(message: 'Calendar event deleted successfully.');
    }
}
