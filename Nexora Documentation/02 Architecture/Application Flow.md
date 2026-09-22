# Application Flow

```text
Client → Axios/fetch → /api/v1 route → Sanctum middleware → controller → model → PostgreSQL → JSON response → client state → UI
```

Debug the first failed step rather than changing downstream UI code.
