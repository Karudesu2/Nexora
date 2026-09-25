<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResourceController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $resources = Resource::query()
            ->when($user, function ($query) use ($user) {
                $query->where(function ($query) use ($user) {
                    $query->where('teacher_id', $user->id)
                        ->orWhere('is_public', true);
                });
            }, function ($query) {
                $query->where('is_public', true);
            })
            ->select([
                'id',
                'teacher_id',
                'name',
                'description',
                'type',
                'file_path',
                'external_url',
                'is_public',
            ])
            ->latest()
            ->get();

        return $this->success(
            $resources,
            'Resources retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url:http,https', 'max:2048'],
            'file' => ['nullable', 'file', 'max:10240'],
            'is_public' => ['sometimes', 'boolean'],
        ]);

        if (! $request->hasFile('file') && empty($data['external_url'])) {
            return $this->error(
                'Add a file or resource link.',
                422,
                [
                    'file' => [
                        'Add a file or resource link.',
                    ],
                ]
            );
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            $data['file_path'] = $file->store(
                'resources',
                'local'
            );

            $data['type'] ??= $file->getClientOriginalExtension();
        }

        unset($data['file']);

        $data['teacher_id'] = $request->user()->id;

        $resource = Resource::create($data);

        return $this->success(
            $resource,
            'Resource created successfully.',
            201
        );
    }

    public function update(
        Request $request,
        Resource $resource
    ): JsonResponse {
        $this->authorize('update', $resource);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url:http,https', 'max:2048'],
            'is_public' => ['sometimes', 'boolean'],
        ]);

        $resource->update($data);

        return $this->success(
            $resource->refresh(),
            'Resource updated successfully.'
        );
    }

    public function download(Resource $resource): StreamedResponse
    {
        $this->authorize('view', $resource);

        abort_unless(
            $resource->file_path,
            404
        );

        $disk = Storage::disk('local')->exists($resource->file_path)
            ? Storage::disk('local')
            : Storage::disk('public');

        return $disk->download(
            $resource->file_path,
            $resource->name
        );
    }

    public function destroy(
        Request $request,
        Resource $resource
    ): JsonResponse {
        $this->authorize('delete', $resource);

        if ($resource->file_path) {
            Storage::disk('local')
                ->delete($resource->file_path);

            Storage::disk('public')
                ->delete($resource->file_path);
        }

        $resource->delete();

        return $this->success(
            message: 'Resource deleted successfully.'
        );
    }
}
