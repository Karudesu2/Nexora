<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends ApiController
{
    /**
     * Register a teacher account and issue a Sanctum token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $registration = DB::transaction(function () use ($request): array {
            $user = User::create($request->validated());
            $teacherRole = Role::query()->firstOrCreate(
                ['code' => 'teacher'],
                ['name' => 'Teacher']
            );

            $user->roles()->syncWithoutDetaching([$teacherRole->id]);

            return [
                'user' => $user,
                'token' => $user->createToken('nexora-web')->plainTextToken,
            ];
        });

        return $this->success($registration, 'Registration successful.', 201);
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->tokens()
            ->where('name', 'nexora-web')
            ->delete();

        $token = $user->createToken('nexora-web')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Login successful.');
    }

    /**
     * Logout current user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(message: 'Logout successful.');
    }

    /**
     * Get authenticated user.
     */
    public function profile(Request $request): JsonResponse
    {
        return $this->success([
            'user' => $request->user(),
        ], 'Profile retrieved successfully.');
    }
}
