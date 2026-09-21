<?php

namespace App\Http\Requests;

use App\Models\Term;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

            'differentiation' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->hasAny(['school_year_id', 'term_id'])) {
                return;
            }

            $term = Term::find($this->integer('term_id'));

            if ($term && $term->school_year_id !== $this->integer('school_year_id')) {
                $validator->errors()->add(
                    'term_id',
                    'The selected term must belong to the selected school year.'
                );
            }
        }];
    }
}
