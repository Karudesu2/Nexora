<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:100',
            ],
            'middle_name' => [
                'nullable',
                'string',
                'max:100',
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $firstName = Str::squish((string) $this->input('first_name'));
        $middleName = Str::squish((string) $this->input('middle_name'));
        $lastName = Str::squish((string) $this->input('last_name'));

        $this->merge([
            'first_name' => $firstName,
            'middle_name' => $middleName ?: null,
            'last_name' => $lastName,
            'name' => Str::squish(implode(' ', array_filter([
                $firstName,
                $middleName,
                $lastName,
            ]))),
            'email' => Str::lower(trim((string) $this->input('email'))),
        ]);
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'An account with this email address already exists.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
