# Development Guide

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
mvn spring-boot:run
```

## Local Services

PostgreSQL should be available at the values configured in `backend/.env`.

## Testing

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
mvn test
```

