# Nexora

Nexora has three app folders:

- `Nexora` - Laravel API backend
- `nexora-web` - React/Vite web app
- `nexora-mobile` - Expo mobile app

## Local Web Development

From the project root, run:

```bat
dev.cmd
```

Or, from PowerShell:

```powershell
npm.cmd run dev
```

This starts:

- Laravel API: `http://127.0.0.1:8000`
- Web app: `http://127.0.0.1:5173`

Use `npm.cmd` on Windows PowerShell. Running `npm` directly can fail when PowerShell script execution is disabled because it tries to launch `npm.ps1`.

## One-Time Setup

Install web dependencies:

```powershell
npm.cmd --prefix nexora-web ci
```

Install backend dependencies from `Nexora` if needed:

```powershell
composer install
```

## Checks

```powershell
npm.cmd run build:web
npm.cmd run lint:web
```

Local development uses SQLite so the system works without the PHP PostgreSQL extension.

## Supabase Deployment

This app currently uses Laravel authentication and the Laravel `users` table. It does not authenticate directly against Supabase Auth accounts.

To use Supabase as the production database:

1. Enable the PHP PostgreSQL extension on the server: `pdo_pgsql`.
2. Copy `Nexora/.env.supabase.example` to the deployed backend `.env`.
3. Fill in the Supabase Postgres credentials from your Supabase project settings.
4. Before pushing/syncing, run this SQL file in the Supabase SQL Editor:

```text
Nexora/database/sql/supabase_update_before_push.sql
```

This prepares the Laravel auth tables, roles, academic context, lesson planner columns, and version-history tables in the production Supabase database.

5. Generate an app key if needed:

```bash
php artisan key:generate --force
```

6. If your deployment can run Artisan against Supabase, also run:

```bash
php artisan migrate --force
php artisan db:seed --force
```

7. Create teacher accounts through the app Register page, or insert Laravel-compatible users into the `users` table.

Supabase Auth-only users in `auth.users` will not log in until Supabase Auth integration is added.
