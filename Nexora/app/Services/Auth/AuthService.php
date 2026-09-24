<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthService
{
    /**
     * Authenticate a user and create an API token.
     *
     * @return array{user: User, token: string}
     */
    public function login(
        string $email,
        string $password,
        string $tokenName = 'nexora-web'
    ): array {
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.',
                ],
            ]);
        }

        try {
            $passwordIsValid = Hash::check($password, $user->password);
        } catch (RuntimeException) {
            $passwordIsValid = password_verify($password, $user->password);

            if ($passwordIsValid) {
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        }

        if (! $passwordIsValid) {
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
