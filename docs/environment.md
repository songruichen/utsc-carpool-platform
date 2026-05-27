# Environment Variables

## Frontend

See `frontend/.env.example`.

- `VITE_API_BASE_URL`: backend REST API URL
- `VITE_WS_BASE_URL`: backend WebSocket URL
- `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox browser token

## Backend

See `backend/.env.example`.

- `SERVER_PORT`: Spring Boot server port
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`: PostgreSQL connection settings
- `JWT_SECRET`: secret for signing JWTs
- `JWT_ACCESS_TOKEN_EXPIRATION_MS`: access token lifetime
- `JWT_REFRESH_TOKEN_EXPIRATION_MS`: refresh token lifetime
- `MAPBOX_ACCESS_TOKEN`: Mapbox server-side token if needed
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins

