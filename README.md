# vZDC Website

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.7-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0--rc.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3.1-2D3748)](https://www.prisma.io/)

The official website for the Virtual Washington ARTCC (Air Route Traffic Control Center) on the VATSIM network. This modern web application provides comprehensive facilities management, training systems, event coordination, and member services for the vZDC community.

## ✨ Features

- **User Authentication** - VATSIM Connect OAuth2 integration
- **Training Management** - Comprehensive training system with appointments, tickets, and progress tracking
- **Event Management** - Event creation, registration, and calendar integration
- **Roster Management** - Controller roster with ratings, certifications, and status tracking
- **Feedback System** - Staff and member feedback collection and management
- **Administrative Tools** - Staff-only tools for facility management
- **Special Use Airspace (SUA)** - Military operations coordination
- **Publications & Resources** - Document management and distribution
- **Discord & TeamSpeak Integration** - Seamless community platform integration
- **Real-time Notifications** - Push notifications and broadcast system
- **Changelog Management** - Version tracking and update notifications

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Material-UI (MUI)
- **Backend**: Next.js API Routes with Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with VATSIM Connect
- **Styling**: Material-UI with custom theming
- **Email**: AWS SES integration with MJML templates
- **File Upload**: UploadThing service
- **Calendar**: FullCalendar integration
- **Deployment**: Docker with Node.js Alpine
- **Build System**: Next.js with Turbopack (development)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or later
- **npm** v9.6 or later
- **PostgreSQL** database (local or remote)
- **VATSIM Connect** OAuth2 credentials ([Get them here](https://auth.vatsim.net/))
- **VATUSA API Key** (contact VATUSA staff)

## 🚀 Quick Start

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vZDC-ARTCC/website.git
   cd website
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and configure the required variables:
   ```bash
   cp .env.example .env.local
   ```

4. **Setup the database:**
   ```bash
   # Deploy database migrations
   npm run db:deploy
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Seed the database:**
   Navigate to [http://localhost:3000/api/seed](http://localhost:3000/api/seed)

7. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## ⚙️ Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL database connection string | `postgresql://postgres:password@localhost:5432/website_db` |
| `NEXTAUTH_URL` | Base URL for OAuth redirects | `https://vzdc.org` or `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for token encryption | Generate with `openssl rand -base64 32` |
| `VATSIM_CLIENT_ID` | VATSIM Connect OAuth2 Client ID | From VATSIM Connect dashboard |
| `VATSIM_CLIENT_SECRET` | VATSIM Connect OAuth2 Client Secret | From VATSIM Connect dashboard |
| `VATUSA_FACILITY` | ARTCC facility identifier | `ZDC` |
| `VATUSA_API_KEY` | VATUSA API authentication key | From VATUSA staff |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEV_MODE` | Disables VATUSA roster checks in development | `false` |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - |
| `NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY` | reCAPTCHA site key | - |
| `GOOGLE_CAPTCHA_SECRET_KEY` | reCAPTCHA secret key | - |
| `UPLOADTHING_SECRET` | UploadThing API secret | - |
| `UPLOADTHING_APP_ID` | UploadThing application ID | - |
| `AWS_ACCESS_KEY_ID` | AWS access key for SES | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for SES | - |
| `AWS_SMTP_REGION` | AWS SES region | `us-east-1` |
| `AWS_SMTP_FROM` | Email sender address | - |
| `TRAINING_ENVIRONMENTS` | Available training environments | `SBX1,SBX2` |
| `BUFFER_TIME` | Training appointment buffer time (minutes) | `15` |
| `SUAS` | Available Special Use Airspace areas | - |

> **⚠️ Security Note**: Never commit `.env.local` to version control. Use strong, unique values for secrets in production.

# Development

## 🐳 Docker Development (Recommended)

The fastest way to get started is using Docker Compose:

1. **Build the Docker image:**
   ```bash
   docker build -t vzdc-website .
   ```

2. **Configure environment:**
   Navigate to the `docker-compose` directory and create `.env.local` based on `.env.example`:
   ```bash
   cd docker-compose
   cp ../.env.example .env.local
   # Edit .env.local with your configuration
   ```

   > **⚠️ Important**: Do not modify `DATABASE_URL` and `NEXTAUTH_URL` when using Docker Compose.

3. **Start the services:**
   ```bash
   docker-compose up
   ```

4. **Seed the database:**
   Open [http://localhost/api/seed](http://localhost/api/seed)

   > **Note**: You'll need to seed the database each time you restart the Docker Compose stack.

## 💻 Local Development Setup

### Prerequisites Checklist
- [ ] Node.js v18+ installed
- [ ] npm v9.6+ installed
- [ ] PostgreSQL database available
- [ ] VATSIM Connect OAuth2 app created
- [ ] VATUSA API key obtained

### Setup Steps

1. **Clone and install:**
   ```bash
   git clone https://github.com/vZDC-ARTCC/website.git
   cd website
   npm install --legacy-peer-deps
   ```

2. **Database setup:**
   ```bash
   # Deploy migrations
   npm run db:deploy
   
   # Generate Prisma client
   npx prisma generate
   
   # Optional: Open Prisma Studio for database inspection
   npm run studio
   ```

3. **Environment configuration:**
   - Copy `.env.example` to `.env.local`
   - Set `NEXTAUTH_URL=http://localhost:3000`
   - Configure your VATSIM Connect redirect URI to: `http://localhost:3000/api/auth/callback/vatsim`
   - Fill in all required environment variables

4. **Start development:**
   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create and run new database migration |
| `npm run db:deploy` | Deploy pending migrations |
| `npm run db:reset` | Reset database and run all migrations |
| `npm run studio` | Open Prisma Studio |

# 🚀 Production Deployment

## Standard Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables:**
   Ensure all production environment variables are properly configured on your server.

3. **Start the production server:**
   ```bash
   npm run start
   ```

4. **Seed the database:**
   Access `/api/seed` on your production URL to initialize the database.

## Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t vzdc-website .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 --env-file .env.local vzdc-website
   ```

   > **Note**: The container runs on port 3000 by default. Adjust port mapping as needed.

## 🏗 Project Architecture

```
vzdc-website/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Administrative interfaces
│   ├── api/               # API routes
│   ├── training/          # Training management
│   ├── events/            # Event management
│   └── ...
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── auth/                 # Authentication configuration
└── types/                # TypeScript type definitions
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: Dependencies installation fails with peer dependency conflicts
```bash
# Solution: Use legacy peer deps flag
npm install --legacy-peer-deps
```

**Issue**: Database connection fails
- Verify `DATABASE_URL` is correctly formatted
- Ensure PostgreSQL is running and accessible
- Check firewall and network settings

**Issue**: VATSIM OAuth not working
- Verify `VATSIM_CLIENT_ID` and `VATSIM_CLIENT_SECRET` are correct
- Ensure redirect URI matches exactly: `{NEXTAUTH_URL}/api/auth/callback/vatsim`
- Check VATSIM Connect app configuration

**Issue**: Build fails in production
- Ensure all environment variables are set
- Run `npx prisma generate` before building
- Check for TypeScript errors with `npm run lint`

### Getting Help

- 🐛 **Bug Reports**: [Open an issue](https://github.com/vZDC-ARTCC/website/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/vZDC-ARTCC/website/discussions)
- 📧 **Private Issues**: Contact the vZDC Web Team

## 🤝 Contributing

We welcome contributions from the community! Please read our [contribution guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow the existing TypeScript/React patterns
- Use Material-UI components consistently
- Write clear, self-documenting code
- Add JSDoc comments for complex functions

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🎯 About vZDC

The Virtual Washington ARTCC (vZDC) is a division of VATUSA, providing air traffic control services in the Washington D.C. metropolitan area on the VATSIM network. We serve controllers and pilots in one of the busiest and most complex airspace regions in the world.

**Links:**
- 🌐 [Website](https://vzdc.org)
- 💬 [Discord](https://discord.gg/vzdc)
- 🎮 [VATSIM](https://vatsim.net)

---

**Developed with ❤️ by the vZDC ARTCC Web Team**

*README Version 2.0.0*

