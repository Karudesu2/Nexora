# Mobile API Configuration

The mobile app uses a configured API base URL and posts credentials to Laravel's `/auth/login` endpoint.

Do not use `localhost` or `127.0.0.1` from a physical device unless it resolves to the device itself intentionally. Use a reachable machine address or tunneled URL instead.
