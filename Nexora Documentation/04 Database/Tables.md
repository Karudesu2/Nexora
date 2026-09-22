# Database Tables

## `users`

Stores user accounts: `id`, name components, `name`, `email`, hashed `password`, verification and timestamps.

## `roles`

Stores named role codes, including `teacher`, `curriculum_coordinator`, `administrator`, and `system_administrator`.

## `role_user`

Pivot between users and roles. It enforces a unique role/user pair.

## `activity_logs`

Stores non-sensitive audit events, actor user ID, subject type/ID, description, IP address, user agent, and timestamps.

Other table definitions must be read from their corresponding migrations before relying on column details.
