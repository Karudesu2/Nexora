<?php

namespace App\Services;

use App\Models\Lesson;
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

            return Lesson::create($data);
        });
    }

    /**
     * Update lesson.
     */
    public function update(Lesson $lesson, array $data): Lesson
    {
        return DB::transaction(function () use ($lesson, $data) {
            $lesson->update($data);

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
