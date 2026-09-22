<?php

namespace App\Http\Controllers;

use App\Models\LessonTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonTemplateController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $templates = LessonTemplate::query()
            ->where(function ($query) use ($request): void {
                $query
                    ->where('user_id', $request->user()->id)
                    ->orWhere('is_public', true);
            })
            ->with('user:id,name')
            ->latest()
            ->get();

        return $this->success($templates, 'Lesson templates retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['user_id'] = $request->user()->id;
        $data['is_public'] = $request->boolean('is_public');

        $template = LessonTemplate::create($data);

        return $this->success($template->load('user:id,name'), 'Lesson template created successfully.', 201);
    }

    public function update(Request $request, LessonTemplate $template): JsonResponse
    {
        $this->authorizeOwner($request, $template);

        $data = $request->validate($this->rules(partial: true));
        if ($request->has('is_public')) {
            $data['is_public'] = $request->boolean('is_public');
        }

        $template->update($data);

        return $this->success($template->refresh()->load('user:id,name'), 'Lesson template updated successfully.');
    }

    public function destroy(Request $request, LessonTemplate $template): JsonResponse
    {
        $this->authorizeOwner($request, $template);

        $template->delete();

        return $this->success(message: 'Lesson template deleted successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:5000'],
            'structure' => ['nullable', 'array'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    private function authorizeOwner(Request $request, LessonTemplate $template): void
    {
        if ($template->user_id === $request->user()->id || $request->user()->isSchoolAdministrator()) {
            return;
        }

        abort(403, 'You can only manage your own templates.');
    }
}
