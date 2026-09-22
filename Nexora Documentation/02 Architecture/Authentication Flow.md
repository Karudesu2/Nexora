# Authentication Flow

1. The client posts email and password to `/api/v1/auth/login`.
2. Laravel validates credentials and creates a Sanctum token.
3. Laravel returns the user and `role_codes`.
4. The web client stores the token as `nexora_token` in local storage and sends it as a bearer token.
5. Protected Laravel routes authenticate through `auth:sanctum`.

Registration assigns the `teacher` role server-side. Role selection is not accepted from the public client.
