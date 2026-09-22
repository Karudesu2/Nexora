# Database Relationships

```text
users ← role_user → roles
users → personal_access_tokens
users → activity_logs (actor)
```

Role management uses the existing many-to-many `users`/`roles` relationship.
