<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Authenticate a user and create an API token.
     */
    public function login(
        string $email,
        string $password,
        string $tokenName = 'nexora-web'
    ): array {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.',
                ],
            ]);
        }

        $user->tokens()
            ->where('name', $tokenName)
            ->delete();

        $token = $user->createToken($tokenName)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Revoke the current token.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
