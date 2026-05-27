# UTSC Carpool

A full-stack ride-sharing platform for University of Toronto Scarborough students.

## Tech Stack

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Java, Spring Boot, Maven, Spring Security, JWT
- Database: PostgreSQL
- Realtime: WebSocket
- Maps: Mapbox

## Monorepo Structure

```text
frontend/   React application
backend/    Spring Boot API
docs/       Product, architecture, and API documentation
```

## Getting Started

1. Copy environment examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

2. Start PostgreSQL locally and create the configured database.

3. Run the backend:

```bash
cd backend
mvn spring-boot:run
```

4. Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Planned Phases

- Phase 1: repository structure, configuration, and starter documentation
- Phase 2: authentication and user profiles
- Phase 3: ride posting, searching, and ride requests
- Phase 4: realtime chat
- Phase 5: Mapbox route and location features
- Phase 6: testing, deployment, and production hardening

