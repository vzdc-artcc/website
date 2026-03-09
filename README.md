# vZDC Website

The official web platform for the Virtual Washington Air Route Traffic Control Center (ARTCC), part of the VATSIM network. This application serves as the primary hub for managing air traffic controller training, events, staffing, visitor applications, incident reporting, and community resources within the vZDC facility.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Docker Compose (Recommended)](#docker-compose-recommended)
  - [Local Development](#local-development)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Building Docker Images Locally](#building-docker-images-locally)
- [Production Deployment](#production-deployment)
- [CI/CD Pipelines](#cicd-pipelines)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

**Controller Management**
- Controller profiles with statistics and activity tracking (monthly hours by position type)
- Solo certification management
- Online ATC status monitoring
- Visitor application processing
- Leave of Absence (LOA) management
- Operating initials assignment

**Training System**
- Training assignments and session scheduling
- Lesson management with rubrics and performance indicators
- Training progression tracking with instructor/mentor workflows
- Over-the-Shoulder (OTS) recommendations
- Configurable training environments and buffer times

**Events**
- Event creation, scheduling, and management
- Event position assignments with presets
- Controller sign-up system
- Calendar integration with iCalendar export support

**Staffing and Administration**
- Staffing request system
- Role-based access control (Controller, Mentor, Instructor, Staff, Event Staff, Web Team)
- Staff position management (ATM, DATM, TA, EC, FE, WM, and assistants)
- Dossier entries for controller records
- Broadcast and announcement system

**Feedback and Incidents**
- Pilot feedback submission and review system
- Incident report filing and tracking
- Status tracking and resolution workflows

**Integrations**
- VATSIM Connect OAuth authentication
- VATUSA API integration for roster synchronization
- Discord OAuth linking and bot integration
- TeamSpeak server integration
- ATC booking system integration
- AWS SES email delivery with MJML templates

**Knowledge Base and Resources**
- Airport and runway information management
- TRACON group documentation
- Common mistakes reference
- Publications and file management with categories
- Preferred Route Documents (PRD)
- Route practice tool

**Additional Features**
- Special Use Airspace (SUA) block management
- Statistics and performance charts
- Google reCAPTCHA v3 spam protection
- Responsive Material UI design with dark theme
- File upload support via Uploadthing
- Markdown content editing

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org/) 15 with App Router |
| Language | [TypeScript](https://www.typescriptlang.org/) 5 |
| Runtime | [Node.js](https://nodejs.org/) 22 (minimum 18+) |
| UI Library | [React](https://react.dev/) 19 |
| Component Library | [Material UI (MUI)](https://mui.com/) v6 |
| Styling | [Emotion](https://emotion.sh/) CSS-in-JS |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma](https://www.prisma.io/) 6 |
| Authentication | [NextAuth.js](https://next-auth.js.org/) 4 with VATSIM Connect OAuth |
| Charts | [AG Charts](https://www.ag-grid.com/charts/) and [MUI X Charts](https://mui.com/x/react-charts/) |
| Data Grid | [MUI X Data Grid](https://mui.com/x/react-data-grid/) |
| Calendar | [FullCalendar](https://fullcalendar.io/) |
| File Uploads | [Uploadthing](https://uploadthing.com/) |
| Email | [Nodemailer](https://nodemailer.com/) with [AWS SES](https://aws.amazon.com/ses/) and [MJML](https://mjml.io/) templates |
| Validation | [Zod](https://zod.dev/) |
| Containerization | [Docker](https://www.docker.com/) with multi-stage builds |
| CI/CD | [GitHub Actions](https://github.com/features/actions) |
| Registry | [GitHub Container Registry (GHCR)](https://ghcr.io/) |

## Prerequisites

- **Node.js 18+** (Node 22 is used in CI and Docker; recommended for local development)
- **Docker and Docker Compose** (for containerized deployment)
- **PostgreSQL** database (provided by Docker Compose or installed locally)
- **VATSIM Connect credentials** (OAuth client ID and secret from [VATSIM](https://auth.vatsim.net))
- **VATUSA API key** (for roster and facility data)

## Environment Variables

The project uses several environment configuration files:

| File | Purpose |
|------|---------|
| `.env.example` | Template with all supported variables. Copy to `.env.local` (local dev) or `stack.env` (Docker Compose). |
| `.env.local` | Local development overrides (not committed to version control). |
| `stack.env` | Environment file consumed by Docker Compose (not committed to version control). |
| `.env.public` | Public environment variables (e.g., `NEXT_PUBLIC_DONATION_URL`). Committed for convenience. |

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/website?schema=public`) |
| `NEXTAUTH_URL` | Base URL for OAuth redirects (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption. Generate with `openssl rand -hex 32`. |
| `VATSIM_CLIENT_ID` | VATSIM Connect OAuth client ID |
| `VATSIM_CLIENT_SECRET` | VATSIM Connect OAuth client secret |
| `VATUSA_FACILITY` | VATUSA facility identifier (e.g., `ZDC`) |
| `VATUSA_API_KEY` | VATUSA API key for roster data |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `DEV_MODE` | Set to `true` to disable VATUSA roster checks during development |
| `POSTGRES_USER` | PostgreSQL username (used by Docker Compose) |
| `POSTGRES_PASS` | PostgreSQL password (used by Docker Compose) |
| `NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key (frontend) |
| `GOOGLE_CAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 secret key (backend) |
| `UPLOADTHING_TOKEN` | Uploadthing file upload service token |
| `AWS_SMTP_FROM` | Email sender address for AWS SES |
| `AWS_SMTP_REGION` | AWS region for SES (e.g., `us-east-1`) |
| `AWS_SMTP_ACCESS_KEY_ID` | AWS access key for SES |
| `AWS_SMTP_SECRET_ACCESS_KEY` | AWS secret key for SES |
| `TS_KEY` | TeamSpeak integration key |
| `TRAINING_ENVIRONMENTS` | Comma-separated training environment identifiers (e.g., `SBX1,SBX2`) |
| `BUFFER_TIME` | Training scheduling buffer time in minutes (e.g., `15`) |
| `SUAS` | Special Use Airspace configuration |
| `ATC_BOOKING_TOKEN` | ATC booking integration token |
| `UPDATER_KEY` | Authentication key for the updater service |
| `WEB_TEAM_MEMBERS` | Comma-separated VATSIM CIDs for web team members |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret |
| `DISCORD_REDIRECT_URI` | Discord OAuth redirect URI |
| `DISCORD_GUILD_ID` | Discord server (guild) ID |
| `DISCORD_TRAINING_CHANNEL_CREATE_URL` | Discord bot endpoint for training channels |
| `DISCORD_EVENT_POSITION_POST_URL` | Discord bot endpoint for event positions |
| `BOT_API_BASE_URL` | Discord bot API base URL |
| `BOT_API_SECRET_KEY` | Discord bot API secret key |
| `NEXT_PUBLIC_DONATION_URL` | Public donation link (also set in `.env.public`) |

Refer to `.env.example` for the complete list with default values.

## Getting Started

### Docker Compose (Recommended)

Docker Compose is the fastest way to get started. The provided `docker-compose.yaml` pulls pre-built images from GitHub Container Registry, so no local build is required.

The Compose stack includes four services:

| Service | Description |
|---------|-------------|
| `postgres` | PostgreSQL database using `postgres:alpine` |
| `migrations_website` | Runs `npx prisma migrate deploy` to apply database migrations |
| `website` | The main web application (`ghcr.io/vzdc-artcc/website:master-latest`) |
| `website_updater` | Background updater service (`ghcr.io/vzdc-artcc/website_updater:master-latest`) |

**Steps:**

1. Copy the example environment file and fill in the required values:

   ```bash
   cp .env.example stack.env
   ```

   Edit `stack.env` and configure at minimum: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `VATSIM_CLIENT_ID`, `VATSIM_CLIENT_SECRET`, `VATUSA_FACILITY`, `VATUSA_API_KEY`, `POSTGRES_USER`, and `POSTGRES_PASS`.

   Ensure `DATABASE_URL` references the `postgres` service name if using the Compose-provided database (e.g., `postgresql://user:pass@postgres:5432/website?schema=public`).

2. Start the stack:

   ```bash
   docker compose up
   ```

3. The `migrations_website` service will apply Prisma migrations automatically on startup.

4. Seed the database by opening a browser and navigating to:

   ```
   http://localhost:3001/api/seed
   ```

   Note: Docker Compose maps host port `3001` to container port `3000` by default. Adjust the port mapping in `docker-compose.yaml` if needed.

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and configure it:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set at minimum: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `VATSIM_CLIENT_ID`, and `VATSIM_CLIENT_SECRET`.

3. Generate the Prisma client and apply database migrations:

   ```bash
   npx prisma generate
   npm run db:deploy
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

5. Seed the database by navigating to `http://localhost:3000/api/seed` in your browser (one-time setup).

## Database Setup

The application uses PostgreSQL with Prisma ORM. The Prisma schema is located at `prisma/schema.prisma`.

**Migrations:**

- `npm run db:migrate` -- Create and apply a new migration during development.
- `npm run db:deploy` -- Apply existing migrations to the database (production-safe).
- `npm run db:reset` -- Reset the database and re-apply all migrations. This is destructive and should only be used in development.

**Prisma Studio:**

To visually inspect and edit database records, run:

```bash
npm run studio
```

**Seeding:**

After migrations have been applied, seed the database by visiting the `/api/seed` endpoint on the running application. This is a one-time operation that populates initial data.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development server | `npm run dev` | Starts the Next.js development server with Turbopack |
| Production build | `npm run build` | Creates an optimized production build |
| Production server | `npm start` | Starts the production server (requires a prior build) |
| Lint | `npm run lint` | Runs ESLint across the codebase |
| Migrate (dev) | `npm run db:migrate` | Creates and applies Prisma migrations in development mode |
| Migrate (deploy) | `npm run db:deploy` | Applies pending Prisma migrations to the database |
| Reset database | `npm run db:reset` | Resets the database and re-applies all migrations (destructive) |
| Prisma Studio | `npm run studio` | Opens Prisma Studio for database inspection |

## Building Docker Images Locally

The project uses GHCR-published images by default. To build the image locally:

```bash
docker build -t vzdc-website .
```

To run the locally built image:

```bash
docker run -p 3000:3000 --env-file stack.env vzdc-website
```

To use a locally built image with Docker Compose, update the `image` field for the `website` service in `docker-compose.yaml` to reference your local image tag, or replace it with a `build: .` directive.

## Production Deployment

The repository CI/CD pipeline automatically builds and publishes Docker images to GitHub Container Registry on pushes to the `master` and `next` branches. Production deployment to DigitalOcean Kubernetes is triggered automatically for the `master` branch.

For manual production deployment:

1. Pull the latest image:

   ```bash
   docker pull ghcr.io/vzdc-artcc/website:master-latest
   ```

2. Ensure all environment variables are properly configured on the production host. In particular, verify that `NEXTAUTH_URL` matches the production domain and that the VATSIM redirect URI is registered accordingly.

3. Deploy using Docker Compose or your preferred container orchestration tool.

## CI/CD Pipelines

The repository includes two GitHub Actions workflows:

**Build Test** (`.github/workflows/build-test.yml`)
- Triggered on pull requests to the `master` and `next` branches.
- Installs dependencies, generates the Prisma client, and runs a production build to verify that the code compiles without errors.

**Docker Build and Push** (`.github/workflows/docker-build-push.yml`)
- Triggered on pushes to the `master` and `next` branches.
- Builds the Docker image and pushes it to GHCR with branch-specific tags (e.g., `master-latest`, `master-<commit>`).
- Automatically deploys to DigitalOcean Kubernetes for the `master` branch.

## Project Structure

```
.
├── actions/              # Server actions (Next.js server-side logic)
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Administration dashboard
│   ├── airports/         # Airport information pages
│   ├── api/              # API routes (auth, Discord, events, files, etc.)
│   ├── bookings/         # ATC booking calendar and management
│   ├── changelog/        # Changelog display
│   ├── charts/           # Statistics and performance charts
│   ├── controllers/      # Controller profiles and statistics
│   ├── events/           # Event management pages
│   ├── feedback/         # Pilot feedback system
│   ├── incident/         # Incident reporting
│   ├── profile/          # User profile management
│   ├── publications/     # Training publications
│   ├── staffing/         # Staffing request system
│   ├── training/         # Training management and scheduling
│   ├── visitor/          # Visitor application system
│   └── ...               # Additional pages (privacy, credits, etc.)
├── auth/                 # Authentication configuration (NextAuth, VATSIM provider)
├── components/           # Reusable React components
├── lib/                  # Utility libraries and helper functions
├── prisma/               # Prisma schema and database migrations
│   ├── schema.prisma     # Database schema definition
│   └── migrations/       # Migration files
├── public/               # Static assets
├── templates/            # Email templates (MJML)
├── theme/                # MUI theme configuration
├── types/                # TypeScript type definitions
├── docker-compose.yaml   # Docker Compose orchestration
├── Dockerfile            # Multi-stage Docker build
├── next.config.ts        # Next.js configuration
└── package.json          # Project dependencies and scripts
```

## Security Considerations

- Never commit secrets (`NEXTAUTH_SECRET`, `VATSIM_CLIENT_SECRET`, `VATUSA_API_KEY`, database credentials, AWS keys) to version control.
- Use `stack.env` or `.env.local` files with appropriate filesystem permissions. Both files are excluded from version control via `.gitignore`.
- Ensure the `NEXTAUTH_URL` value and VATSIM redirect URI match exactly in both the application configuration and the VATSIM developer portal.
- The `DEV_MODE` variable should never be set to `true` in production environments, as it disables VATUSA roster verification.
- Review the `.env.public` file before deployment to confirm that only intended values are publicly exposed.

## Troubleshooting

**The application does not start:**

Check the container logs for error messages:

```bash
docker compose logs website
```

**Database migrations fail:**

Inspect the migration service logs or run migrations manually:

```bash
docker compose logs migrations_website
npx prisma migrate deploy
```

**OAuth redirects fail or return errors:**

Verify that the `NEXTAUTH_URL` environment variable matches the URL you are accessing the application from, and confirm that the redirect URI registered in the VATSIM developer portal is correct.

**Prisma schema changes are not reflected:**

After modifying `prisma/schema.prisma`, regenerate the Prisma client and run migrations:

```bash
npx prisma generate
npm run db:migrate
```

**Public environment variables are not updating:**

Frontend-public variables (prefixed with `NEXT_PUBLIC_`) can be set in `.env.public`. Changes require a rebuild of the application to take effect.

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch from `master`.
3. Make your changes, keeping them focused and well-documented.
4. Ensure the project builds successfully (`npm run build`) and passes linting (`npm run lint`).
5. Open a pull request against the `master` or `next` branch with a clear description of the changes.

Pull requests are automatically validated by the CI pipeline, which runs a full production build.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for the full license text.

---

Developed by the vZDC ARTCC Web Team.
