<?php

namespace App\Services;

use App\Models\Lesson;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class LessonService
{
    /**
     * Create a lesson.
     */
    public function create(int $teacherId, array $data): Lesson
    {
        return DB::transaction(function () use ($teacherId, $data) {
            $data['teacher_id'] = $teacherId;
            $data['status'] ??= 'Draft';

            $lesson = Lesson::create($data);

            if ($lesson->status === 'Scheduled') {
                Notification::create([
                    'user_id' => $teacherId,
                    'title' => 'Lesson scheduled',
                    'message' => sprintf(
                        '%s is scheduled for %s.',
                        $lesson->title,
                        $lesson->lesson_date->toFormattedDateString()
                    ),
                    'type' => 'lesson',
                    'action_url' => '/lessons',
                ]);
            }

            return $lesson;
        });
    }

    /**
     * Update lesson.
     */
    public function update(Lesson $lesson, array $data): Lesson
    {
        return DB::transaction(function () use ($lesson, $data) {
            $wasCompleted = $lesson->status === 'Completed';
            $lesson->update($data);

            if (! $wasCompleted && $lesson->status === 'Completed') {
                Notification::create([
                    'user_id' => $lesson->teacher_id,
                    'title' => 'Lesson completed',
                    'message' => sprintf('%s was marked complete.', $lesson->title),
                    'type' => 'lesson',
                    'action_url' => '/lessons',
                ]);
            }

            return $lesson->refresh();
        });
    }

    /**
     * Delete lesson.
     */
    public function delete(Lesson $lesson): void
    {
        DB::transaction(function () use ($lesson) {
            $lesson->delete();
        });
    }
}
