# vZDC Website

The Virtual Washington ARTCC Website.

This README is updated to reflect the current repository layout, Docker Compose usage, published container images, and the recommended local development steps.

Quick overview
- The project publishes Docker images to GitHub Container Registry (GHCR). The main image tag used by the repository is `ghcr.io/vzdc-artcc/website:master-latest` and an updater image `ghcr.io/vzdc-artcc/website_updater:master-latest`.
- The included `docker-compose.yaml` uses those GHCR images by default so you can run the site with minimal setup.

Requirements
- Node 18+ (for local development)
- Docker & Docker Compose (for containerized runs)
- A Postgres-compatible database (used by the containers or locally)
- VATSIM Connect credentials (for authentication)

Environment variables

There are two main environment patterns used in this repo:

- `stack.env` (or a file you supply to Docker Compose) — the compose file reads environment variables from a file called `stack.env` by default.
- `.env.example` — a template of environment variables required for local development. Copy it to `.env.local` or to `stack.env` and fill values.
- `.env.public` — holds frontend-public environment variables (for example `NEXT_PUBLIC_DONATION_URL`). This file is committed for convenience (it currently contains the donation URL) but you can override it in your deployment.

Important variables (summary)
- DEV_MODE: `true` to disable VATUSA roster checks for development only
- DATABASE_URL: Postgres connection string
- NEXTAUTH_URL: Base URL used for OAuth2 redirect (e.g. `http://localhost:3000`)
- NEXTAUTH_SECRET: Secret used by NextAuth; use `openssl rand -hex 32` to generate
- VATSIM_CLIENT_ID, VATSIM_CLIENT_SECRET: VATSIM Connect credentials
- VATUSA_FACILITY, VATUSA_API_KEY: Facility name and API key for VATUSA
- UPLOADTHING_TOKEN: file upload token (if used)
- NEXT_PUBLIC_DONATION_URL: (public) donation link — kept in `.env.public`

See `.env.example` for a full list of variables and short descriptions.

Docker Compose (recommended for quick starts)

Why: The compose file is configured to use pre-built images from GHCR so you don't need to build locally.

What it does:
- `postgres`: runs a Postgres container using credentials from your environment file
- `migrations_website`: runs `npx prisma migrate deploy` using the same image to apply migrations
- `website`: the website container (image `ghcr.io/vzdc-artcc/website:master-latest`)
- `website_updater`: optional updater service (image `ghcr.io/vzdc-artcc/website_updater:master-latest`)

Default ports and notes:
- By default `docker-compose.yaml` maps host `3001` to container `3000` for the website service. If you expect `http://localhost:3000`, be aware compose maps to `3001` in the provided file.

Quick-start with Docker Compose

1. Copy `.env.example` to `stack.env` (or create a `stack.env` file) and fill required variables. Do NOT expose production credentials publicly.

2. (Optional) Edit `stack.env` to match your environment. Ensure `DATABASE_URL` points to the Postgres container (if you want the containers to talk to each other use the default compose network and service name `postgres`).

3. Run Docker Compose from the repository root:

```fish
# starts containers, pulling images from GHCR if not present locally
docker compose up
```

4. The compose `migrations_website` service will apply Prisma migrations automatically. After the app is running, seed the database:

- Open a browser and visit: `http://localhost:3001/api/seed`

Local development (when you want to run Next.js locally)

1. Install dependencies:

```fish
# prefer pnpm if you use it; npm also works
pnpm install
# or
npm install
```

2. Create a local environment file from the example and fill values:

```fish
cp .env.example .env.local
# edit .env.local and set at minimum: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, VATSIM_CLIENT_ID, VATSIM_CLIENT_SECRET
```

3. Run local database/migrations (if using local Postgres):

```fish
npm run db:deploy
npx prisma generate
```

4. Run the dev server:

```fish
npm run dev
# or
pnpm dev
```

5. Seed local DB once the server is up by visiting `http://localhost:3000/api/seed`.

Notes on building images locally

- The project uses GHCR-published images by default. If you want to build the website image locally and run it with Docker Compose, either:
  - Build and tag the image with the same name (`ghcr.io/vzdc-artcc/website:master-latest`) and push to your registry (requires auth), or
  - Edit `docker-compose.yaml` to use `build: .` for the `website` service or change the `image:` to `website` after `docker build -t website .`.

Example local-build flow:

```fish
# build locally and run directly
docker build -t website .
# run with env file
docker run -p 80:80 --env-file stack.env website
```

Production

- The repository publishes images to GHCR; `docker compose up` with the provided `docker-compose.yaml` will pull those images.
- Ensure environment variables on the production host are configured correctly. Make sure `NEXTAUTH_URL` points to your production domain and the corresponding VATSIM redirect URI is registered.

Seeding the database

- The seed endpoint is available at `/api/seed` on the running site. For a default compose setup the URL is `http://localhost:3001/api/seed`.
- Run the seed endpoint after migrations have been applied.

Security notes

- Keep secrets (NEXTAUTH_SECRET, VATSIM client secret, VATUSA API key, database credentials) out of public repositories.
- Use `stack.env` (or whichever file you use for Docker Compose) with appropriate filesystem permissions.

Troubleshooting

- If the site doesn't start, check container logs:

```fish
docker compose logs website
```

- If migrations fail, inspect the `migrations_website` service logs or run migrations locally with `npx prisma migrate deploy`.

- If OAuth redirects fail, confirm `NEXTAUTH_URL` and registered provider redirect URIs match exactly.

Development tips / extras

- If you change Prisma schema, run migrations and `npx prisma generate`.
- The frontend-public environment variables (prefixed with `NEXT_PUBLIC_`) can be placed into `.env.public` to be served to the client; this repo already includes `.env.public` for the donation URL.

Contributing

If you'd like to contribute, open a pull request against the repository. Keep changes small and include any relevant tests or instructions.

License

This project is licensed under the repository's LICENSE file.

---
### Developed by the vZDC ARTCC Web Team.
