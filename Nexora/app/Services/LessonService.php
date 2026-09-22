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
            $this->recordVersion($lesson);

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
            $this->recordVersion($lesson->refresh());

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

    private function recordVersion(Lesson $lesson): void
    {
        $nextVersion = ((int) $lesson->versions()->max('version_number')) + 1;

        $lesson->versions()->create([
            'user_id' => $lesson->teacher_id,
            'version_number' => $nextVersion,
            'title' => $lesson->title,
            'status' => $lesson->status,
            'content' => $lesson->content,
            'plan_data' => $lesson->plan_data,
        ]);
    }
}
