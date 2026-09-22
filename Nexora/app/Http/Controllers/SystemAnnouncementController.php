<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\SystemAnnouncement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SystemAnnouncementController extends ApiController
{
    public function index(): JsonResponse
    {
        $announcements = SystemAnnouncement::query()
            ->visible()
            ->with('creator:id,name')
            ->latest()
            ->limit(10)
            ->get();

        return $this->success($announcements, 'Announcements retrieved successfully.');
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorizeManagement($request);

        $announcements = SystemAnnouncement::query()
            ->with('creator:id,name')
            ->latest()
            ->get();

        return $this->success($announcements, 'Announcements retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeManagement($request);

        $data = $request->validate($this->rules());
        $data['created_by'] = $request->user()->id;
        $data['is_active'] = $request->boolean('is_active', true);

        $announcement = SystemAnnouncement::create($data);

        if ($announcement->is_active) {
            $this->notifyUsers($announcement);
        }

        return $this->success(
            $announcement->load('creator:id,name'),
            'Announcement posted successfully.',
            201
        );
    }

    public function update(Request $request, SystemAnnouncement $announcement): JsonResponse
    {
        $this->authorizeManagement($request);

        $data = $request->validate($this->rules(partial: true));
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        $announcement->update($data);

        return $this->success(
            $announcement->refresh()->load('creator:id,name'),
            'Announcement updated successfully.'
        );
    }

    public function destroy(Request $request, SystemAnnouncement $announcement): JsonResponse
    {
        $this->authorizeManagement($request);

        $announcement->delete();

        return $this->success(message: 'Announcement deleted successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:255'],
            'message' => [$required, 'string', 'max:5000'],
            'type' => [$required, Rule::in(SystemAnnouncement::TYPES)],
            'priority' => [$required, Rule::in(SystemAnnouncement::PRIORITIES)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    private function authorizeManagement(Request $request): void
    {
        abort_unless($request->user()->isSchoolAdministrator(), 403, 'Only administrators can manage announcements.');
    }

    private function notifyUsers(SystemAnnouncement $announcement): void
    {
        User::query()
            ->where('is_active', true)
            ->select('id')
            ->chunkById(100, function ($users) use ($announcement): void {
                foreach ($users as $user) {
                    Notification::create([
                        'user_id' => $user->id,
                        'title' => "System announcement: {$announcement->title}",
                        'message' => $announcement->message,
                        'type' => 'announcement',
                        'action_url' => '/announcements',
                    ]);
                }
            });
    }
}
