# Frontend

Next.js frontend for the `nestjs-admin-starter` project. This application provides the login flow, session handling, and the admin UI used to interact with the backend API.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Prerequisites

- Node.js 20+
- npm

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure the API base URL

Create `frontend/.env.local` if you want to override the default backend address:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
```

If this variable is not set, make sure the frontend and backend are configured consistently in your local environment.

### 3) Start the development server

```bash
npm run dev -- --port 3001
```

Application URL:

- Frontend: `http://localhost:3001`

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Application Scope

The frontend includes:

- Login and authentication flow
- Session persistence with remember me behavior
- Protected admin interface
- User management views
- Integration with the NestJS backend API

## Development Notes

- The frontend expects the backend API to be available locally.
- The documented backend default is `http://localhost:3002/api`.
- For local development, run the backend before testing authenticated flows.

## Production Build

Build the app:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Troubleshooting

### Frontend cannot reach the API

Check that:

- The backend is running on `http://localhost:3002`
- `NEXT_PUBLIC_API_BASE_URL` points to the correct API origin
- You restarted the frontend after changing environment variables

### Port `3001` is already in use

Run the app on another port:

```bash
npm run dev -- --port 3003
```

## License

UNLICENSED
