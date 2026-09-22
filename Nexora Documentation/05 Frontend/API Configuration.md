# API Configuration

The web client reads `VITE_API_URL`. Local development routes API calls through the Vite `/api` proxy to Laravel on port 8000.

Authentication uses the `nexora_token` local-storage key and an `Authorization: Bearer` header.
