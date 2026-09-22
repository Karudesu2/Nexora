# Supabase Overview

## Provider

Supabase PostgreSQL.

## Security

Laravel connects using server-only database configuration. Do not record database passwords, private keys, service-role keys, or access tokens in this vault.

The active Supabase project must match Laravel's configured `DB_HOST`.

## Authentication Scope

NEXORA currently uses Laravel authentication with Sanctum. Login checks the Laravel `users` table in the configured database.

If production is configured with Supabase Postgres, valid app users must exist in the Laravel `users` table. Supabase Auth-only users stored in `auth.users` are not accepted by the app unless a future Supabase Auth integration is added.

Use `Nexora/.env.supabase.example` as the production database template.
