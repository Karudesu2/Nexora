<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_year_id' => [
                'required',
                'integer',
                'exists:school_years,id',
            ],

            'term_id' => [
                'required',
                'integer',
                'exists:terms,id',
            ],

            'grade_id' => [
                'required',
                'integer',
                'exists:grades,id',
            ],

            'subject_id' => [
                'required',
                'integer',
                'exists:subjects,id',
            ],

            'section' => [
                'required',
                'string',
                'max:100',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'lesson_date' => [
                'required',
                'date',
            ],

            'status' => [
                'nullable',
                'in:Draft,Scheduled,In Progress,Completed,Missed,Rescheduled,Cancelled,Archived',
            ],

            'content' => [
                'nullable',
                'string',
            ],
        ];
    }
}
