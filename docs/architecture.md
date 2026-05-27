# Architecture

## Goals

- Keep business logic separated from framework and transport concerns.
- Use DTOs at API boundaries.
- Keep modules independently understandable and testable.
- Prefer explicit error responses and validation.

## Backend Module Pattern

Each feature module should generally contain:

```text
controller/   REST or WebSocket entry points
dto/          request and response DTOs
entity/       JPA entities
repository/   persistence interfaces
service/      business logic
mapper/       entity and DTO mapping helpers
```

Initial modules:

- auth
- user
- ride
- request
- chat
- location

## Frontend Module Pattern

Frontend code is organized by feature where possible:

```text
src/features/<feature>/
src/components/ui/
src/components/layout/
src/lib/
src/hooks/
src/types/
```

Reusable visual primitives belong in `components/ui`. Domain-specific UI belongs inside its feature folder.

