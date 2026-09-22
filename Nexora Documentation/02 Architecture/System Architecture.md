# Nexora System Architecture

```text
Web application / Mobile application
                ↓
          Laravel REST API
                ↓
     Supabase PostgreSQL database
```

Clients use Laravel endpoints and do not receive database credentials. Laravel owns authentication, authorization, validation, and database access.
