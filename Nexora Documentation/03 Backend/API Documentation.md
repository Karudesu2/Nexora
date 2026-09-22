# API Documentation

| Method | Endpoint | Authentication | Purpose | Status |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | Create teacher account | Source inspected |
| POST | `/api/v1/auth/login` | No | Authenticate and issue token | Source inspected |
| GET | `/api/v1/auth/profile` | Sanctum | Retrieve current user | Source inspected |
| POST | `/api/v1/auth/logout` | Sanctum | Revoke current token | Source inspected |
| GET | `/api/v1/dashboard` | Sanctum | Dashboard data | Source inspected |
| GET | `/api/v1/admin/users` | Sanctum + policy | User management list | Added; unverified |
| GET | `/api/v1/admin/users/{user}` | Sanctum + policy | User details | Added; unverified |
| PATCH | `/api/v1/admin/users/{user}/role` | Sanctum + policy | Change another user's role | Added; unverified |
