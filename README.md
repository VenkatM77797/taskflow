# TaskFlow Productivity App

TaskFlow is a Todoist-inspired full-stack task manager. This version is reorganized for easier future improvements and now includes a clearer `/dashboard` app structure, task details, subtasks and weekly views, dashboard statistics, search, and priority filtering.
fdmngkmdmckenfnkesofmo
## Tech stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt

## Features included

- Register, login, logout
- JWT-protected dashboard
- Dashboard overview with task statistics
- Projects CRUD
- Labels CRUD
- Tasks CRUD
- Task title, description, due date, priority, project, and label
- Edit tasks from the task card
- Complete and reopen tasks
- Delete tasks and subtasks
- Subtasks nested under parent tasks
- Search by task title or description
- Filter by priority
- Filter tasks without due dates
- Inbox, Today, This Week, Upcoming, and Completed views
- Project and label views
- Clean Todoist-inspired UI
- Docker Compose PostgreSQL setup

## Clean folder structure

```txt
taskflow-productivity-app/
├─ backend/                  Express API, Prisma schema, auth, task routes
│  ├─ prisma/schema.prisma    Database models
│  └─ src/
│     ├─ server.ts            Backend app entry point
│     ├─ routes/              API route handlers
│     ├─ middleware/          Auth and error middleware
│     ├─ lib/                 Shared backend clients
│     ├─ utils/               Backend helper utilities
│     └─ types/               Express TypeScript types
├─ frontend/                 Next.js user interface
│  └─ src/
│     ├─ app/                 Next.js pages and route groups
│     │  ├─ dashboard/        Protected task dashboard routes
│     │  ├─ login/            Login page
│     │  └─ register/         Register page
│     ├─ components/          Reusable UI components
│     ├─ lib/                 Frontend API/auth/date helpers
│     └─ types.ts             Shared frontend TypeScript types
├─ docs/                     Extra project documentation
└─ docker-compose.yml        Local PostgreSQL service
```

More details are in `docs/PROJECT_STRUCTURE.md` and `docs/FUTURE_IMPROVEMENTS.md`.

## 1. Start PostgreSQL with Docker

From the project root:

```bash
docker compose up -d
```

PostgreSQL will run at:

```txt
postgresql://postgres:postgres@localhost:5432/taskflow_db?schema=public
```

## 2. Setup backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend runs on:

```txt
http://localhost:4000
```

## 3. Setup frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

## 4. Use the app

Open:

```txt
http://localhost:3000
```

Create an account, then go to the dashboard and start adding tasks, projects, labels, due dates, and subtasks.

## Main app routes

```txt
/                         Landing page
/login                    Login
/register                 Register
/dashboard                Dashboard overview
/dashboard/inbox          Inbox tasks
/dashboard/today          Today tasks
/dashboard/week           Tasks due in the next 7 days
/dashboard/upcoming       Future tasks
/dashboard/completed      Completed tasks
/dashboard/projects/:id   Project tasks
/dashboard/labels/:id     Label tasks
```

## API routes

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/stats

GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id

GET    /api/labels
POST   /api/labels
PATCH  /api/labels/:id
DELETE /api/labels/:id

GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Task query examples:

```txt
GET /api/tasks?view=inbox
GET /api/tasks?view=today
GET /api/tasks?view=week
GET /api/tasks?view=upcoming
GET /api/tasks?view=completed
GET /api/tasks?projectId=PROJECT_ID
GET /api/tasks?labelId=LABEL_ID
GET /api/tasks?search=design
GET /api/tasks?priority=1
GET /api/tasks?noDueDate=true
```

## Notes for production

This is a strong MVP starter, not a finished production SaaS. Before production, add HTTP-only refresh tokens, email verification, password reset, rate limiting, request logging, tests, deployment configs, and proper notification delivery.
