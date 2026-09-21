<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->success($notifications, 'Notifications retrieved successfully.');
    }

    public function markRead(
        Request $request,
        Notification $notification
    ): JsonResponse {
        $this->authorize('update', $notification);

        $notification->update(['read_at' => now()]);

        return $this->success($notification->refresh(), 'Notification marked as read.');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->success(message: 'Notifications marked as read.');
    }
}
