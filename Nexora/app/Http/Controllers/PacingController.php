<?php

namespace App\Http\Controllers;

use App\Services\PacingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PacingController extends Controller
{
    public function __construct(
        private readonly PacingService $pacingService
    ) {}

    /**
     * Get teacher pacing information.
     */
    public function index(Request $request): JsonResponse
    {
        $pacing = $this->pacingService->getTeacherPacing(
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'data' => $pacing,
        ]);
    }
}
