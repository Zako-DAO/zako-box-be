# ZakoBox Backend

A modern, type-safe Web3 backend application built with Bun, Hono, and Drizzle ORM. Supports wallet signature authentication and GitHub OAuth integration.

## Overview

ZakoBox Backend is a lightweight API service designed for decentralized applications (DApps). It provides:

- **Wallet Signature Authentication** - Sign-In with Ethereum (SIWE) pattern
- **GitHub OAuth Integration** - Link GitHub accounts to wallet addresses
- **Session Management** - JWT-based authentication with httpOnly cookies
- **Type-Safe Database Operations** - Powered by Drizzle ORM

## Tech Stack

### Core Runtime & Framework

- **[Bun](https://bun.sh/)** `v1.x` - High-performance JavaScript runtime
  - Native TypeScript support
  - Built-in test runner and package manager
  - Compiles to standalone binary

- **[Hono](https://hono.dev/)** `v4.10.0` - Ultra-fast web framework
  - Lightweight and edge-optimized
  - Middleware support (CORS, Logger, JWT)
  - Multi-runtime compatible

### Database & Caching

- **[PostgreSQL](https://www.postgresql.org/)** `v17` - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** `v0.44.6` - Type-safe ORM
  - Zero runtime overhead
  - Integrated migration tool
- **[Redis](https://redis.io/)** `v7` - In-memory cache
  - Session message storage (60s TTL)
  - Connected via `ioredis`

### Web3 & Blockchain

- **[viem](https://viem.sh/)** `v2.38.3` - TypeScript Ethereum library
  - Signature verification (`verifyMessage`)
  - Address validation (`isAddress`)
  - Type-safe Ethereum interactions

### Authentication & Security

- **Wallet Signature Authentication** - SIWE pattern
  - Generate challenge messages
  - Verify wallet signatures
  - 60-second message expiration

- **JWT Authentication** - Token-based sessions
  - HttpOnly cookies
  - SameSite: Strict
  - 24-hour validity

### Development Tools

- **TypeScript** `v5.9.3` - Strict mode enabled
- **ESLint** `v9.37.0` - Code linting with `@antfu/eslint-config`
- **Bun Test** - Built-in testing framework
  - 80% coverage threshold
  - Transaction-based test isolation

### DevOps & Deployment

- **Docker** - Multi-stage build
  - Builder: `oven/bun:1`
  - Runner: `ubuntu:24.04`
  - Output: Standalone binary

- **GitHub Actions** - CI/CD pipeline
  - Automated linting, testing, type-checking
  - Container registry deployment (GHCR)
  - SSH-based production deployment

## Project Structure

```
zako-box-be/
├── src/
│   ├── db/                      # Database layer
│   │   ├── index.ts             # DB/Redis initialization
│   │   └── schema.ts            # Drizzle schema definitions
│   ├── handlers/                # API route handlers
│   │   ├── sessions/            # Session management
│   │   ├── session-message/     # Challenge message generation
│   │   └── github-oauth/        # OAuth integration (WIP)
│   ├── middlewares/             # Custom middlewares
│   │   └── jwt.ts               # JWT verification
│   ├── utils/                   # Utility functions
│   │   ├── redis.ts             # Redis key generators
│   │   └── session-message.ts  # Message generation
│   ├── bun.d.ts                # Bun environment types
│   └── index.ts                # Application entry point
├── drizzle/                     # Database migrations
├── .github/workflows/           # CI/CD workflows
└── docker-compose.yml           # Local development services
```

## API Endpoints

All endpoints are prefixed with `/api/v1`:

```
POST   /api/v1/session-messages     # Generate challenge message for signing
POST   /api/v1/sessions             # Verify signature and create session
GET    /api/v1/sessions             # Get current session
DELETE /api/v1/sessions             # Logout (clear session)
GET    /api/v1/github-oauth         # GitHub OAuth flow (WIP)
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
PORT=3001                          # Server port
JWT_SECRET=your_secret_key         # JWT signing secret
JWT_ISSUER=your_issuer             # JWT issuer identifier

DATABASE_URL=postgresql://...      # PostgreSQL connection string
REDIS_URL=redis://...              # Redis connection string

BUN_ENV=development                # Environment: development/production/testing
```

## Development

Copy environment file and fill values to what you want, of course you can use default values.

```
cp .env.example .env.local
```

```
docker compose down
docker compose up -d --remove-orphans

bun db:migrate
bun dev
```

## Testing

Start the database and redis containers.

```
docker compose down
docker compose up -d --remove-orphans
```

Run the tests.

```
bun db:migrate
bun test
```

Stop the database and redis containers.

```
docker compose down
```

## Production

```
bun build
```

## Deployment

```
docker build -t zako-box-be .
docker run -p 3000:3000 zako-box-be
```
