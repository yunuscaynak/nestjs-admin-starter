# Backend

NestJS API for the `nestjs-admin-starter` project. This service provides authentication, user management, post CRUD endpoints, Swagger documentation, and Prisma-based PostgreSQL integration.

## Stack

- NestJS
- Prisma ORM
- PostgreSQL
- Swagger

## Prerequisites

- Node.js 20+
- pnpm
- Docker

## Getting Started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start PostgreSQL

```bash
docker compose up -d
```

Default database connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestcrud?schema=public"
```

### 3) Generate the Prisma client and apply the schema

```bash
pnpm db:generate
pnpm db:push
```

### 4) Start the development server

```bash
pnpm start:dev
```

Service URLs:

- API: `http://localhost:3002/api`
- Swagger: `http://localhost:3002/docs`

## Environment Variables

Create or update `backend/.env` with the following values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestcrud?schema=public"
PORT=3002
SWAGGER_PATH=docs
```

## Available Scripts

```bash
pnpm start
pnpm start:dev
pnpm start:debug
pnpm start:prod
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:cov
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:reset
pnpm db:studio
```

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Posts:

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`

Users:

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

## Authentication Notes

- The first account created with a password is automatically assigned the `ADMIN` role.
- The `users` endpoints are restricted to `ADMIN` users.
- Access tokens are short-lived.
- Refresh tokens are used to restore sessions when needed.
- When `remember me` is enabled, the frontend stores the session persistently.

## Database Notes

If `pnpm db:push` fails because required columns were added to an existing table, your local database likely contains records from an older schema.

Options:

```bash
pnpm db:migrate
```

Use this if you want to preserve local data and evolve the schema safely.

```bash
pnpm db:reset
```

Use this if you can discard local development data and recreate the schema from scratch. This command drops the local database data.

## Troubleshooting

### `EADDRINUSE: address already in use :::3002`

Another process is already using port `3002`.

```bash
lsof -nP -iTCP:3002 -sTCP:LISTEN
kill <PID>
```

### `Cannot GET /api/users`

The backend may be running without the expected API prefix. Start the current backend version again:

```bash
pnpm start:dev
```

Then verify:

```text
http://localhost:3002/api/users
```

## License

UNLICENSED
