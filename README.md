# vZDC Website

The **Virtual Washington ARTCC (vZDC) Website** is a Next.js application used by controllers and visitors for center operations, training, events, staffing tools, bookings, and member services.

## Tech stack

- Next.js 16 + React 19
- Prisma ORM
- PostgreSQL
- NextAuth (VATSIM Connect OAuth)
- Docker / Docker Compose

## Repository structure (high level)

- `/app` - App Router pages and API routes
- `/components` - reusable UI and feature components
- `/prisma` - Prisma schema and migrations
- `/public` - static assets
- `/templates` - email/template assets

## Requirements

- Node.js 18+ (local development)
- npm (or pnpm/bun if preferred)
- PostgreSQL
- Docker + Docker Compose (for containerized runs)

## Environment configuration

Use `.env.example` as the source of truth for required variables.

Common files:

- `stack.env` - used by `docker-compose.yaml`
- `.env.local` - used for local `npm run dev`
- `.env.public` - public client-side values (`NEXT_PUBLIC_*`)

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - base URL for auth callbacks
- `NEXTAUTH_SECRET` - auth secret (`openssl rand -hex 32`)
- `VATSIM_CLIENT_ID`, `VATSIM_CLIENT_SECRET` - VATSIM OAuth app credentials
- `VATUSA_FACILITY`, `VATUSA_API_KEY` - facility integration
- `DEV_MODE` - development-only behavior toggle

> Keep secrets out of git and out of screenshots/logs.

## Quick start (Docker Compose, recommended)

The compose stack uses prebuilt GHCR images:

- `ghcr.io/vzdc-artcc/website:master-latest`
- `ghcr.io/vzdc-artcc/website_updater:master-latest`

Steps:

1. Create env file:
   ```bash
   cp .env.example stack.env
   ```
2. Update `stack.env` values (especially `DATABASE_URL`, OAuth/auth values, and secrets).
3. Start services:
   ```bash
   docker compose up
   ```
4. Open the site at `http://localhost:3001`.
5. Seed data (after migrations complete):
   - `http://localhost:3001/api/seed`

Services in compose:

- `postgres` - database
- `migrations_website` - runs `prisma migrate deploy`
- `website` - main web app
- `website_updater` - updater service

## Local development (run Next.js directly)

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Create local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Set required values in `.env.local`.
4. Apply database migrations:
   ```bash
   npm run db:deploy
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```
6. Seed local data:
   - `http://localhost:3000/api/seed`

## Useful scripts

- `npm run dev` - start local dev server
- `npm run build` - production build (`prisma generate && next build`)
- `npm run start` - run production server
- `npm run lint` - run lint task
- `npm run db:migrate` - create/apply local Prisma migration
- `npm run db:deploy` - deploy existing migrations
- `npm run db:reset` - reset DB (destructive)

## Troubleshooting

- View web logs:
  ```bash
  docker compose logs website
  ```
- View migration logs:
  ```bash
  docker compose logs migrations_website
  ```
- If auth callback fails, verify `NEXTAUTH_URL` and VATSIM redirect URI match exactly.

## License

See `LICENSE`.

---
### Developed by the vZDC ARTCC Web Team
