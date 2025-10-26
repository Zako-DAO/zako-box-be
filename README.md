# ZakoBox Backend

A modern, type-safe Web3 backend application built with Bun, Hono, and Drizzle ORM. Supports wallet signature authentication and GitHub OAuth integration.

## 1. Overview

ZakoBox Backend is a lightweight API service designed for decentralized applications (DApps). It provides:

- **Wallet Signature Authentication** - Sign-In with Ethereum (SIWE) pattern
- **GitHub OAuth Integration** - Link GitHub accounts to wallet addresses
- **Session Management** - JWT-based authentication with httpOnly cookies
- **Type-Safe Database Operations** - Powered by Drizzle ORM

## 2. Tech Stack

### 2.1 Core Runtime & Framework

- **[Bun](https://bun.sh/)** `v1.x` - High-performance JavaScript runtime
  - Native TypeScript support
  - Built-in test runner and package manager
  - Compiles to standalone binary

- **[Hono](https://hono.dev/)** `v4.10.0` - Ultra-fast web framework
  - Lightweight and edge-optimized
  - Middleware support (CORS, Logger, JWT)
  - Multi-runtime compatible

### 2.2 Database & Caching

- **[PostgreSQL](https://www.postgresql.org/)** `v17` - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** `v0.44.6` - Type-safe ORM
  - Zero runtime overhead
  - Integrated migration tool
- **[Redis](https://redis.io/)** `v7` - In-memory cache
  - Session message storage (60s TTL)
  - Connected via `ioredis`

### 2.3 Web3 & Blockchain

- **[viem](https://viem.sh/)** `v2.38.3` - TypeScript Ethereum library
  - Signature verification (`verifyMessage`)
  - Address validation (`isAddress`)
  - Type-safe Ethereum interactions

### 2.4 Authentication & Security

- **Wallet Signature Authentication** - SIWE pattern
  - Generate challenge messages
  - Verify wallet signatures
  - 60-second message expiration

- **JWT Authentication** - Token-based sessions
  - HttpOnly cookies
  - SameSite: Strict
  - 24-hour validity

### 2.5 Development Tools

- **TypeScript** `v5.9.3` - Strict mode enabled
- **ESLint** `v9.37.0` - Code linting with `@antfu/eslint-config`
- **Bun Test** - Built-in testing framework
  - 80% coverage threshold
  - Transaction-based test isolation

### 2.6 DevOps & Deployment

- **Docker** - Multi-stage build
  - Builder: `oven/bun:1`
  - Runner: `ubuntu:24.04`
  - Output: Standalone binary

- **GitHub Actions** - CI/CD pipeline
  - Automated linting, testing, type-checking
  - Container registry deployment (GHCR)
  - SSH-based production deployment

## 3. Project Structure

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

## 4. API Endpoints

All endpoints are prefixed with `/api/v1`:

```
POST   /api/v1/session-messages     # Generate challenge message for signing
POST   /api/v1/sessions             # Verify signature and create session
GET    /api/v1/sessions             # Get current session
DELETE /api/v1/sessions             # Logout (clear session)
GET    /api/v1/github-oauth         # GitHub OAuth flow (WIP)
```

## 5. Environment Variables

Create a `.env.local` file with the following variables:

```bash
PORT=3001                          # Server port
JWT_SECRET=your_secret_key         # JWT signing secret
JWT_ISSUER=your_issuer             # JWT issuer identifier

DATABASE_URL=postgresql://...      # PostgreSQL connection string
REDIS_URL=redis://...              # Redis connection string

BUN_ENV=development                # Environment: development/production/testing
```

## 6. Development

Copy environment file and fill values to what you want, of course you can use default values.

```bash
cp .env.example .env.local
```

```bash
docker compose down
docker compose up -d --remove-orphans

bun db:migrate
bun dev
```

## 7. Testing

Start the database and redis containers.

```bash
docker compose down
docker compose up -d --remove-orphans
```

Run the tests.

```bash
bun db:migrate
bun test
```

Stop the database and redis containers.

```bash
docker compose down
```

## 8. Production Build

Build the standalone binary locally:

```bash
bun build
```

This creates a single executable file `./zako-box-be` with no runtime dependencies.

---

## 9. Deployment

### 9.1 Prerequisites

Before deploying to your VPS, ensure you have:

- A VPS with Docker installed (Ubuntu 20.04+ recommended)
- Domain name configured (optional, for HTTPS)
- PostgreSQL and Redis instances (can be on the same VPS or external)
- GitHub Personal Access Token (for private registry access)

### 9.2 Option 1: Manual Deployment to VPS

#### 9.2.1 Step 1: Prepare Your VPS

SSH into your VPS and install Docker if not already installed:

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
```

#### 9.2.2 Step 2: Set Up Database Services

Create a `docker-compose.yml` on your VPS for PostgreSQL and Redis:

```bash
mkdir -p ~/zako-box-be
cd ~/zako-box-be
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17
    restart: always
    environment:
      POSTGRES_USER: zakobox
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: zakobox
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    restart: always
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

Start the services:

```bash
docker compose up -d
```

#### 9.2.3 Step 3: Build and Push Docker Image

**Option A: Build on VPS directly**

```bash
# Clone repository
git clone https://github.com/Zako-DAO/zako-box-be.git
cd zako-box-be

# Build Docker image
docker build -t zako-box-be:latest .
```

**Option B: Build locally and push to registry**

```bash
# Build for your VPS architecture
docker buildx build --platform linux/amd64 -t ghcr.io/zako-dao/zako-box-be:latest .

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Push to registry
docker push ghcr.io/zako-dao/zako-box-be:latest
```

#### 9.2.4 Step 4: Configure Environment Variables

Create `.env.production` file on your VPS:

```bash
PORT=3000
JWT_SECRET=your_very_secure_random_string_here
JWT_ISSUER=zakobox-backend

DATABASE_URL=postgresql://zakobox:your_secure_password@localhost:5432/zakobox
REDIS_URL=redis://default:your_redis_password@localhost:6379

GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
BASE_URL=https://your-domain.com

BUN_ENV=production
```

**Generate secure JWT secret:**

```bash
openssl rand -base64 32
```

#### 9.2.5 Step 5: Run Database Migrations

Before starting the application, run migrations:

```bash
# Pull the image (if using registry)
docker pull ghcr.io/zako-dao/zako-box-be:latest

# Run migrations (one-time setup)
docker run --rm \
  --env-file .env.production \
  --network host \
  ghcr.io/zako-dao/zako-box-be:latest \
  bun db:migrate
```

#### 9.2.6 Step 6: Start the Application

```bash
docker run -d \
  --name zako-box-be \
  --restart always \
  --env-file .env.production \
  -p 3000:3000 \
  --network host \
  ghcr.io/zako-dao/zako-box-be:latest
```

**Using local build:**

```bash
docker run -d \
  --name zako-box-be \
  --restart always \
  --env-file .env.production \
  -p 3000:3000 \
  --network host \
  zako-box-be:latest
```

#### 9.2.7 Step 7: Verify Deployment

Check if the container is running:

```bash
docker ps | grep zako-box-be
```

View logs:

```bash
docker logs -f zako-box-be
```

Test the API:

```bash
curl http://localhost:3000/api/v1/sessions
```

#### 9.2.8 Step 8: Set Up Nginx Reverse Proxy (Optional)

Install Nginx:

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Create Nginx configuration `/etc/nginx/sites-available/zako-box-be`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and obtain SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/zako-box-be /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com
```

### 9.3 Option 2: Automated Deployment with GitHub Actions

The repository includes a GitHub Actions workflow for automated deployment on version tags.

#### 9.3.1 Setup GitHub Secrets

In your GitHub repository, go to `Settings > Secrets and variables > Actions` and add:

- `SSH_HOST`: Your VPS IP address
- `SSH_USERNAME`: SSH username (e.g., `ubuntu`, `root`)
- `SSH_KEY`: Private SSH key for authentication
- `SSH_PORT`: SSH port (default: `22`)

#### 9.3.2 Deployment Process

1. **Tag a release:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **GitHub Actions will automatically:**
   - Build the Docker image
   - Push to GitHub Container Registry (`ghcr.io/zako-dao/zako-box-be:v1.0.0`)
   - SSH into your VPS
   - Stop and remove old container
   - Pull new image
   - Start new container

3. **Monitor deployment:**

Visit `Actions` tab in GitHub to watch the deployment progress.

#### 9.3.3 VPS Preparation for GitHub Actions

On your VPS, ensure:

```bash
# Docker is installed
docker --version

# User has docker permissions
sudo usermod -aG docker $USER

# GitHub Container Registry authentication (one-time)
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Create .env file in home directory
nano ~/.env.production
# (paste your environment variables)
```

**Modify the GitHub Actions workflow** to use your env file:

Edit `.github/workflows/deploy.yml` line 54:

```yaml
sudo docker run -dit --restart=always --env-file ~/.env.production -p 3000:3000 --name zako-box-be ghcr.io/zako-dao/zako-box-be:${{ github.ref_name }}
```

### 9.4 Container Management

**View logs:**
```bash
docker logs -f zako-box-be
```

**Restart container:**
```bash
docker restart zako-box-be
```

**Stop container:**
```bash
docker stop zako-box-be
```

**Update to new version:**
```bash
docker stop zako-box-be
docker rm zako-box-be
docker pull ghcr.io/zako-dao/zako-box-be:latest
docker run -d --name zako-box-be --restart always --env-file .env.production -p 3000:3000 ghcr.io/zako-dao/zako-box-be:latest
```

**Access container shell:**
```bash
docker exec -it zako-box-be sh
```

### 9.5 Troubleshooting

**Container won't start:**
```bash
# Check logs for errors
docker logs zako-box-be

# Verify environment variables
docker exec zako-box-be env
```

**Database connection issues:**
```bash
# Test PostgreSQL connection
docker exec zako-box-be pg_isready -h localhost -p 5432

# Test Redis connection
docker exec zako-box-be redis-cli -h localhost ping
```

**Port already in use:**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process or use different port
docker run -p 3001:3000 ...
```

**Run migrations manually:**
```bash
docker exec zako-box-be bun db:migrate
```

### 9.6 Health Check

Create a simple health check script:

```bash
#!/bin/bash
# health-check.sh

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/sessions)

if [ $RESPONSE -eq 401 ]; then
    echo "✅ API is healthy (returned expected 401)"
    exit 0
else
    echo "❌ API health check failed (returned $RESPONSE)"
    exit 1
fi
```

Add to crontab for monitoring:
```bash
*/5 * * * * /path/to/health-check.sh || docker restart zako-box-be
```

### 9.7 Backup Strategy

**Database backup:**
```bash
# Backup PostgreSQL
docker exec postgres pg_dump -U zakobox zakobox > backup-$(date +%Y%m%d).sql

# Restore from backup
docker exec -i postgres psql -U zakobox zakobox < backup-20250126.sql
```

**Redis backup:**
```bash
# Trigger save
docker exec redis redis-cli --pass your_redis_password SAVE

# Copy backup file
docker cp redis:/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```
