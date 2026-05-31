# NestJS Admin Starter (NestJS + Prisma + PostgreSQL + Next.js)

Full-stack starter project with NestJS-based authentication and an admin panel.

- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js (App Router)

## Features

- Login / register / refresh / logout endpoints
- Access + refresh token based authentication
- Persistent session with a remember me option
- Admin-protected user create, list, fetch, update, and delete operations
- Swagger documentation (`/docs`)
- PostgreSQL connection via Prisma
- Frontend UI with a login screen and admin panel
- API prefix: `/api`

## Project Structure

```text
nestjs-admin-starter/
  backend/   # NestJS API
  frontend/  # Next.js UI
```

## Requirements

- Node.js 20+
- pnpm 10+
- Docker

## Quick Start

### 1) Start PostgreSQL

```bash
cd backend
docker compose up -d
cd ..
```

### 2) Install everything and prepare Prisma

```bash
pnpm setup
```

### 3) Run backend and frontend

In separate terminals:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Or run both together from the root:

```bash
pnpm dev
```

Backend default: `http://localhost:3002`  
API: `http://localhost:3002/api`  
Swagger: `http://localhost:3002/docs`  
Frontend: `http://localhost:3000`

## Environment Variables

`backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestcrud?schema=public"
PORT=3002
SWAGGER_PATH=docs
```

Frontend API base URL:

`frontend/.env`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
```

## Workspace Scripts

From the project root:

```bash
pnpm setup
pnpm dev
pnpm dev:backend
pnpm dev:frontend
pnpm lint
pnpm test
pnpm build
pnpm check
```

The repository now uses a single `pnpm` workspace and a shared root lockfile.

## Git Hooks and CI

- `pnpm install` runs `husky` setup automatically.
- `.husky/pre-commit` runs `pnpm lint` and `pnpm test`.
- GitHub Actions CI runs install, Prisma client generation, lint, test, and build on every push and pull request.

## Backend Scripts

```bash
pnpm start:dev
pnpm build
pnpm lint
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

## API Endpoints

- `GET /`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

## Auth Notes

- The first account created with a password in the system is assigned the `ADMIN` role.
- The `users` endpoints are only accessible to users with the `ADMIN` role.
- The access token is short-lived; the frontend automatically refreshes the session with the refresh token when needed.
- If `remember me` is enabled, a longer-lived refresh token is generated and the session is stored in `localStorage`.
- If `remember me` is disabled, the session is stored in `sessionStorage` and is cleared when the browser tab is closed.
- If your old database contains user records from before auth was added, their `passwordHash` field may be empty; those users cannot log in directly.
- In that case, if you create a new account and there is no existing user with a password set, that new account is automatically assigned the `ADMIN` role.

## Common Issues

### `EADDRINUSE: address already in use :::3002`

Port 3002 is already in use.

```bash
lsof -nP -iTCP:3002 -sTCP:LISTEN
kill <PID>
```

### `Cannot GET /api/users`

The backend may be running, but you might have started a version without the API prefix. With the current backend code:

```bash
cd backend
pnpm start:dev
```

Then check `http://localhost:3002/api/users`.

### `Prisma db push` required-column error

Your local PostgreSQL database may still contain records from an older schema:

```bash
cd backend
pnpm db:push

# If needed, wipe local data and recreate the schema
pnpm db:reset
```

## License

UNLICENSED
