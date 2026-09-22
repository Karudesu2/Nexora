<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Models\Lesson;
use App\Models\LessonVersion;
use App\Services\LessonService;
use App\Services\PacingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class LessonController extends ApiController
{
    public function __construct(
        private readonly LessonService $lessonService,
        private readonly PacingService $pacingService
    ) {}

    /**
     * Display teacher lessons.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Lesson::class);

        $lessons = Lesson::query()
            ->where('teacher_id', $request->user()->id)
            ->select([
                'id', 'school_year_id', 'term_id', 'grade_id', 'subject_id',
                'section', 'title', 'lesson_date', 'status', 'content',
                'differentiation', 'plan_data', 'source_file_name',
                'source_file_path', 'source_file_mime',
            ])
            ->with([
                'schoolYear:id,name',
                'term:id,name',
                'grade:id,name',
                'subject:id,name',
            ])
            ->orderByDesc('lesson_date')
            ->get();

        return $this->success($lessons, 'Lessons retrieved successfully.');
    }

    /**
     * Create lesson.
     */
    public function store(StoreLessonRequest $request): JsonResponse
    {
        $this->authorize('create', Lesson::class);

        $lesson = $this->lessonService->create(
            $request->user()->id,
            $request->validated()
        );
        $this->pacingService->forgetTeacherPacing($lesson->teacher_id);

        return $this->success($lesson, 'Lesson created successfully.', 201);
    }

    /**
     * Display one lesson.
     */
    public function show(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('view', $lesson);

        $lesson->load([
            'schoolYear',
            'term',
            'grade',
            'subject',
            'objectives',
            'activities',
            'resources',
            'reflections',
            'competencies',
            'assessments',
            'versions.user:id,name',
        ]);

        return $this->success($lesson, 'Lesson retrieved successfully.');
    }

    public function import(Request $request): JsonResponse
    {
        $this->authorize('create', Lesson::class);

        $data = $request->validate([
            'school_year_id' => ['required', 'integer', 'exists:school_years,id'],
            'term_id' => ['required', 'integer', 'exists:terms,id'],
            'grade_id' => ['required', 'integer', 'exists:grades,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'section' => ['nullable', 'string', 'max:100'],
            'lesson_date' => ['required', 'date'],
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:doc,docx,pdf,txt',
            ],
        ]);

        $file = $request->file('file');
        $path = $file->store('lesson-imports', 'local');
        $text = $this->extractLessonText($path, $file->getClientOriginalExtension());
        $title = Str::of($file->getClientOriginalName())
            ->beforeLast('.')
            ->replace(['_', '-'], ' ')
            ->squish()
            ->headline()
            ->toString();

        $lesson = $this->lessonService->create($request->user()->id, [
            'school_year_id' => $data['school_year_id'],
            'term_id' => $data['term_id'],
            'grade_id' => $data['grade_id'],
            'subject_id' => $data['subject_id'],
            'section' => $data['section'] ?? 'Imported',
            'title' => $title,
            'lesson_date' => $data['lesson_date'],
            'status' => 'Draft',
            'content' => $text,
            'plan_data' => $this->inferPlanData($text),
            'source_file_name' => $file->getClientOriginalName(),
            'source_file_path' => $path,
            'source_file_mime' => $file->getClientMimeType(),
        ]);

        return $this->success(
            $lesson->load(['grade:id,name', 'subject:id,name', 'versions']),
            'Lesson document imported successfully.',
            201
        );
    }

    /**
     * Update lesson.
     */
    public function update(
        StoreLessonRequest $request,
        Lesson $lesson
    ): JsonResponse {
        $this->authorize('update', $lesson);

        $lesson = $this->lessonService->update(
            $lesson,
            $request->validated()
        );
        $this->pacingService->forgetTeacherPacing($lesson->teacher_id);

        return $this->success($lesson, 'Lesson updated successfully.');
    }

    public function versions(Lesson $lesson): JsonResponse
    {
        $this->authorize('view', $lesson);

        return $this->success(
            $lesson->versions()
                ->with('user:id,name')
                ->latest('version_number')
                ->get(),
            'Lesson versions retrieved successfully.'
        );
    }

    public function restoreVersion(Lesson $lesson, LessonVersion $version): JsonResponse
    {
        $this->authorize('update', $lesson);
        abort_unless($version->lesson_id === $lesson->id, 404);

        $lesson = $this->lessonService->update($lesson, [
            'title' => $version->title,
            'status' => $version->status,
            'content' => $version->content,
            'plan_data' => $version->plan_data,
            'school_year_id' => $lesson->school_year_id,
            'term_id' => $lesson->term_id,
            'grade_id' => $lesson->grade_id,
            'subject_id' => $lesson->subject_id,
            'section' => $lesson->section,
            'lesson_date' => $lesson->lesson_date,
        ]);

        return $this->success(
            $lesson->load(['grade:id,name', 'subject:id,name', 'versions']),
            'Lesson version restored successfully.'
        );
    }

    /**
     * Delete lesson.
     */
    public function destroy(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        $this->authorize('delete', $lesson);

        $this->lessonService->delete($lesson);
        $this->pacingService->forgetTeacherPacing($request->user()->id);

        return $this->success(message: 'Lesson deleted successfully.');
    }

    private function extractLessonText(string $path, string $extension): string
    {
        $fullPath = Storage::disk('local')->path($path);
        $extension = Str::lower($extension);

        if ($extension === 'txt') {
            return (string) file_get_contents($fullPath);
        }

        if ($extension === 'docx') {
            return $this->extractDocxText($fullPath);
        }

        return 'The document was uploaded securely. Automatic text extraction for this file type is not available in the local development environment. Use the editor to paste or complete the lesson plan content.';
    }

    private function extractDocxText(string $fullPath): string
    {
        $zip = new ZipArchive();

        if ($zip->open($fullPath) !== true) {
            return '';
        }

        $xml = $zip->getFromName('word/document.xml') ?: '';
        $zip->close();

        $xml = preg_replace('/<w:tab\/>/', "\t", $xml) ?? $xml;
        $xml = preg_replace('/<\/w:p>/', "\n", $xml) ?? $xml;

        return Str::of(strip_tags($xml))
            ->replace('&amp;', '&')
            ->replace('&lt;', '<')
            ->replace('&gt;', '>')
            ->squish()
            ->toString();
    }

    /**
     * @return array<string, string>
     */
    private function inferPlanData(string $text): array
    {
        $sections = [
            'learnerProfile' => 'Learner Profile',
            'priorKnowledge' => 'Prior Knowledge',
            'learningNeeds' => 'Learning Needs',
            'learningCompetencies' => 'Learning Competencies',
            'objectives' => 'Objectives',
            'materials' => 'Materials',
            'references' => 'References',
            'motivationActivity' => 'Motivation',
            'lessonPresentation' => 'Presentation',
            'assessment' => 'Assessment',
            'assignment' => 'Assignment',
            'teachingReflection' => 'Reflection',
            'aiContribution' => 'AI',
        ];

        $data = [];

        foreach ($sections as $key => $label) {
            if (Str::contains(Str::lower($text), Str::lower($label))) {
                $data[$key] = $text;
            }
        }

        return $data ?: ['importedContent' => $text];
    }
}
