<?php

namespace App\Http\Controllers;

use App\Models\FeedbackReport;
use App\Models\FeedbackUpdate;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FeedbackController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $reports = FeedbackReport::query()
            ->where('user_id', $request->user()->id)
            ->with(['updates' => fn ($query) => $query->latest()->limit(3)])
            ->latest()
            ->get()
            ->map(fn (FeedbackReport $report): array => $this->reportPayload($report));

        return $this->success($reports, 'Feedback reports retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->reportRules());

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $data['attachment_path'] = $file->store('feedback-attachments', 'local');
            $data['attachment_name'] = $file->getClientOriginalName();
            $data['attachment_mime'] = $file->getClientMimeType();
        }

        unset($data['attachment']);

        $data['user_id'] = $request->user()->id;
        $data['status'] = 'Submitted';
        $data['system_information'] = $request->userAgent();

        $report = FeedbackReport::create($data);
        $report->updates()->create([
            'user_id' => $request->user()->id,
            'status' => 'Submitted',
            'message' => 'Feedback received and queued for review.',
        ]);

        Notification::create([
            'user_id' => $request->user()->id,
            'title' => 'Feedback received',
            'message' => "Your feedback #{$report->id} was submitted successfully.",
            'type' => 'feedback',
            'action_url' => '/feedback',
        ]);

        return $this->success(
            $this->reportPayload($report->fresh(['updates', 'user'])),
            'Feedback submitted successfully.',
            201
        );
    }

    public function show(Request $request, FeedbackReport $feedback): JsonResponse
    {
        $this->authorizeFeedbackAccess($request, $feedback);

        return $this->success(
            $this->reportPayload($feedback->load(['updates.user:id,name,email', 'user:id,name,email'])),
            'Feedback report retrieved successfully.'
        );
    }

    public function downloadAttachment(Request $request, FeedbackReport $feedback): StreamedResponse
    {
        $this->authorizeFeedbackAccess($request, $feedback);

        abort_unless($feedback->attachment_path, 404);
        abort_unless(Storage::disk('local')->exists($feedback->attachment_path), 404);

        return Storage::disk('local')->download(
            $feedback->attachment_path,
            $feedback->attachment_name ?? "feedback-{$feedback->id}-attachment"
        );
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorizeFeedbackManagement($request);

        $filters = $request->validate([
            'category' => ['nullable', Rule::in(FeedbackReport::CATEGORIES)],
            'priority' => ['nullable', Rule::in(FeedbackReport::PRIORITIES)],
            'status' => ['nullable', Rule::in(FeedbackReport::STATUSES)],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $reports = FeedbackReport::query()
            ->with(['user:id,name,email', 'updates' => fn ($query) => $query->latest()->limit(1)])
            ->when($filters['category'] ?? null, fn ($query, $value) => $query->where('category', $value))
            ->when($filters['priority'] ?? null, fn ($query, $value) => $query->where('priority', $value))
            ->when($filters['status'] ?? null, fn ($query, $value) => $query->where('status', $value))
            ->when($filters['date_from'] ?? null, fn ($query, $value) => $query->whereDate('created_at', '>=', $value))
            ->when($filters['date_to'] ?? null, fn ($query, $value) => $query->whereDate('created_at', '<=', $value))
            ->latest()
            ->get()
            ->map(fn (FeedbackReport $report): array => $this->reportPayload($report, true));

        return $this->success($reports, 'Feedback reports retrieved successfully.');
    }

    public function adminShow(Request $request, FeedbackReport $feedback): JsonResponse
    {
        $this->authorizeFeedbackManagement($request);

        return $this->success(
            $this->reportPayload($feedback->load(['updates.user:id,name,email', 'user:id,name,email']), true),
            'Feedback report retrieved successfully.'
        );
    }

    public function adminUpdate(Request $request, FeedbackReport $feedback): JsonResponse
    {
        $this->authorizeFeedbackManagement($request);

        $data = $request->validate([
            'status' => ['required', Rule::in(FeedbackReport::STATUSES)],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $feedback->status = $data['status'];

        if (in_array($data['status'], ['Resolved', 'Closed'], true)) {
            $feedback->resolved_by = $request->user()->id;
            $feedback->resolved_at = now();
        } else {
            $feedback->resolved_by = null;
            $feedback->resolved_at = null;
        }

        $feedback->save();

        $feedback->updates()->create([
            'user_id' => $request->user()->id,
            'status' => $data['status'],
            'message' => $data['message'],
        ]);

        Notification::create([
            'user_id' => $feedback->user_id,
            'title' => "Feedback #{$feedback->id} {$data['status']}",
            'message' => $data['message'],
            'type' => 'feedback',
            'action_url' => '/feedback',
        ]);

        return $this->success(
            $this->reportPayload($feedback->fresh(['updates.user', 'user']), true),
            'Feedback status updated successfully.'
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function reportPayload(FeedbackReport $report, bool $includeUser = false): array
    {
        return [
            'id' => $report->id,
            'feedback_id' => sprintf('FB-%05d', $report->id),
            'category' => $report->category,
            'priority' => $report->priority,
            'status' => $report->status,
            'title' => $report->title,
            'description' => $report->description,
            'affected_module' => $report->affected_module,
            'steps_to_reproduce' => $report->steps_to_reproduce,
            'suggested_solution' => $report->suggested_solution,
            'system_information' => $includeUser ? $report->system_information : null,
            'has_attachment' => (bool) $report->attachment_path,
            'attachment_name' => $report->attachment_name,
            'submitted_at' => $report->created_at?->toISOString(),
            'updated_at' => $report->updated_at?->toISOString(),
            'resolved_at' => $report->resolved_at?->toISOString(),
            'user' => $includeUser && $report->relationLoaded('user') && $report->user ? [
                'id' => $report->user->id,
                'name' => $report->user->name,
                'email' => $report->user->email,
            ] : null,
            'updates' => $report->relationLoaded('updates')
                ? $report->updates->map(fn (FeedbackUpdate $update): array => [
                    'id' => $update->id,
                    'status' => $update->status,
                    'message' => $update->message,
                    'created_at' => $update->created_at?->toISOString(),
                    'user' => $update->relationLoaded('user') && $update->user ? [
                        'id' => $update->user->id,
                        'name' => $update->user->name,
                    ] : null,
                ])->values()->all()
                : [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function reportRules(): array
    {
        return [
            'category' => ['required', Rule::in(FeedbackReport::CATEGORIES)],
            'priority' => ['required', Rule::in(FeedbackReport::PRIORITIES)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'affected_module' => ['nullable', 'string', 'max:255'],
            'steps_to_reproduce' => ['nullable', 'string', 'max:5000'],
            'suggested_solution' => ['nullable', 'string', 'max:5000'],
            'attachment' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,webp,pdf,txt,doc,docx',
            ],
        ];
    }

    private function authorizeFeedbackAccess(Request $request, FeedbackReport $feedback): void
    {
        if ($feedback->user_id === $request->user()->id || $this->canManageFeedback($request->user())) {
            return;
        }

        abort(403, 'You can only view your own feedback.');
    }

    private function authorizeFeedbackManagement(Request $request): void
    {
        abort_unless($this->canManageFeedback($request->user()), 403, 'Only administrators can manage feedback.');
    }

    private function canManageFeedback(User $user): bool
    {
        return $user->hasAnyRole([
            'school_administrator',
            'administrator',
            'system_administrator',
        ]);
    }
}
