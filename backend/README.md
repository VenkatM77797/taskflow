# Backend

Express + TypeScript + Prisma + PostgreSQL.

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

API runs on `http://localhost:4000`.

## Important files

```txt
src/server.ts              Express app entry point
src/routes/auth.routes.ts  Auth endpoints
src/routes/task.routes.ts  Task endpoints, filters, and subtasks
src/routes/stats.routes.ts Dashboard stats endpoint
prisma/schema.prisma       Database schema
```
