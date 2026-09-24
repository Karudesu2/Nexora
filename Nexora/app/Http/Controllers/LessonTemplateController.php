<?php

namespace App\Http\Controllers;

use App\Models\LessonTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class LessonTemplateController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $templates = LessonTemplate::query()->where(fn ($q) => $q->where('user_id', $request->user()->id)->orWhere('is_public', true))
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($inner) => $inner->where('title', 'like', '%'.$request->string('search').'%')->orWhere('description', 'like', '%'.$request->string('search').'%')))
            ->when($request->filled('subject'), fn ($q) => $q->where('subject', $request->string('subject')))
            ->when($request->filled('grade_level'), fn ($q) => $q->where('grade_level', $request->string('grade_level')))
            ->with('user:id,name')->latest()->paginate(min($request->integer('per_page', 12), 50));

        return $this->success($templates, 'Lesson templates retrieved successfully.');
    }

    public function show(Request $request, LessonTemplate $template): JsonResponse
    {
        $this->authorizeView($request, $template);

        return $this->success($template->load('user:id,name'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['user_id'] = $request->user()->id;
        $data['is_public'] = $request->boolean('is_public');
        $this->storeFile($request, $data);

        return $this->success(LessonTemplate::create($data)->load('user:id,name'), 'Lesson template uploaded successfully.', 201);
    }

    public function update(Request $request, LessonTemplate $template): JsonResponse
    {
        $this->authorizeOwner($request, $template);
        $data = $request->validate($this->rules(true));
        if ($request->has('is_public')) {
            $data['is_public'] = $request->boolean('is_public');
        }
        if ($request->hasFile('file')) {
            Storage::disk('local')->delete([$template->file_path, $template->preview_path]);
            $this->storeFile($request, $data);
        }
        $template->update($data);

        return $this->success($template->refresh()->load('user:id,name'), 'Lesson template updated successfully.');
    }

    public function destroy(Request $request, LessonTemplate $template): JsonResponse
    {
        $this->authorizeOwner($request, $template);
        Storage::disk('local')->delete([$template->file_path, $template->preview_path]);
        $template->delete();

        return $this->success(message: 'Lesson template deleted successfully.');
    }

    public function download(Request $request, LessonTemplate $template): StreamedResponse
    {
        $this->authorizeView($request, $template);
        abort_unless($template->file_path && Storage::disk('local')->exists($template->file_path), 404, 'Template document is unavailable.');

        return Storage::disk('local')->download($template->file_path, $template->file_name, ['Content-Type' => $template->file_mime ?: 'application/octet-stream']);
    }

    public function preview(Request $request, LessonTemplate $template): StreamedResponse
    {
        $this->authorizeView($request, $template);
        abort_unless($template->preview_path && Storage::disk('local')->exists($template->preview_path), 404, 'A preview is not available for this template.');

        return Storage::disk('local')->response($template->preview_path, null, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function duplicate(Request $request, LessonTemplate $template): JsonResponse
    {
        $this->authorizeView($request, $template);
        $copy = $template->replicate(['file_path', 'preview_path']);
        $copy->user_id = $request->user()->id;
        $copy->title = Str::limit($template->title.' (Copy)', 255, '');
        $copy->is_public = false;
        $copy->file_name = null;
        $copy->file_mime = null;
        $copy->file_size = null;
        $copy->processing_status = 'ready';
        $copy->save();

        return $this->success($copy->load('user:id,name'), 'Template duplicated successfully.', 201);
    }

    private function storeFile(Request $request, array &$data): void
    {
        if (! $request->hasFile('file')) {
            return;
        } $file = $request->file('file');
        $path = $file->store('lesson-templates/documents', 'local');
        $data['file_name'] = $file->getClientOriginalName();
        $data['file_path'] = $path;
        $data['file_mime'] = $file->getMimeType();
        $data['file_size'] = $file->getSize();
        $data['processing_status'] = 'ready';
        $data['preview_path'] = $this->makeTextPreview($path, Str::lower($file->getClientOriginalExtension()));
        if (! isset($data['structure']) && $data['preview_path']) {
            $data['structure'] = ['learningActivities' => Storage::disk('local')->get($data['preview_path'])];
        }
    }

    private function makeTextPreview(string $path, string $extension): ?string
    {
        if ($extension !== 'docx' || ! class_exists(ZipArchive::class)) {
            return null;
        } $zip = new ZipArchive;
        if ($zip->open(Storage::disk('local')->path($path)) !== true) {
            return null;
        }
        $xml = $zip->getFromName('word/document.xml') ?: '';
        $zip->close();
        $text = trim(preg_replace('/\s+/', ' ', strip_tags(preg_replace('/<\/w:p>/', "\n", $xml) ?? $xml)) ?? '');
        if ($text === '') {
            return null;
        }
        $preview = 'lesson-templates/previews/'.Str::uuid().'.txt';
        Storage::disk('local')->put($preview, Str::limit($text, 20000));

        return $preview;
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return ['title' => [$required, 'string', 'max:255'], 'category' => ['nullable', 'string', 'max:120'], 'description' => ['nullable', 'string', 'max:5000'], 'structure' => ['nullable', 'array'], 'subject' => ['nullable', 'string', 'max:120'], 'grade_level' => ['nullable', 'string', 'max:120'], 'learning_area' => ['nullable', 'string', 'max:120'], 'is_public' => ['sometimes', 'boolean'], 'file' => [$partial ? 'sometimes' : 'nullable', 'file', 'max:20480', 'mimes:doc,docx,pdf']];
    }

    private function authorizeView(Request $request, LessonTemplate $template): void
    {
        abort_unless($template->user_id === $request->user()->id || $template->is_public || $request->user()->isSchoolAdministrator(), 403);
    }

    private function authorizeOwner(Request $request, LessonTemplate $template): void
    {
        abort_unless($template->user_id === $request->user()->id || $request->user()->isSchoolAdministrator(), 403, 'You can only manage your own templates.');
    }
}
