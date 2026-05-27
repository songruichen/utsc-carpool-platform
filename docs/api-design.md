# API Design

Base URL:

```text
/api/v1
```

## Planned Resources

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /users/me
PATCH  /users/me

POST   /rides
GET    /rides
GET    /rides/{rideId}
PATCH  /rides/{rideId}
DELETE /rides/{rideId}

POST   /rides/{rideId}/requests
GET    /rides/{rideId}/requests
PATCH  /requests/{requestId}/accept
PATCH  /requests/{requestId}/reject

GET    /chats
GET    /chats/{chatId}/messages
POST   /chats/{chatId}/messages

GET    /locations/search
GET    /routes/estimate
```

## Response Shape

Successful responses should use:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Errors should use:

```json
{
  "timestamp": "2026-01-01T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/example"
}
```

