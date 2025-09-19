# Pricing Tool - Build and Deployment Guide

This guide explains how to build and deploy the Pricing Tool application, similar to the ccam build process.

## Prerequisites

- Node.js 18+
- pnpm 10.11.0+
- Docker
- Docker Compose

## Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Start specific apps
pnpm dev:api    # API server on port 3000
pnpm dev:web    # Web app on port 5173
```

### Individual App Development

```bash
# API development
cd apps/api
pnpm dev

# Web development
cd apps/web
pnpm dev
```

## Building

### Build All Applications

```bash
# Build all apps and packages
pnpm build

# Build specific apps
pnpm build:api
pnpm build:web
```

### Build Packages Only

```bash
# Linux/macOS
./scripts/build-packages.sh

# Windows
./scripts/build-packages.ps1
```

## Docker Build Process

### Automated Build (Recommended)

```bash
# Linux/macOS
./scripts/docker-build.sh

# Windows PowerShell
./scripts/docker-build.ps1
```

This will:
1. Clean previous builds
2. Install dependencies
3. Build all packages
4. Build Docker images
5. Save images as tar files
6. Clean up temporary files

### Manual Docker Build

```bash
# Build API image
docker build -f docker/Dockerfile.api -t pricing-tool-api:latest .

# Build Web image
docker build -f docker/Dockerfile.web -t pricing-tool-web:latest .

# Save images as tar files
docker save pricing-tool-api:latest -o pricing-tool-api.tar
docker save pricing-tool-web:latest -o pricing-tool-web.tar
```

## Deployment

### Using Docker Compose

```bash
# Start all services (including MongoDB and MinIO)
cd docker
docker-compose up -d

# Start only infrastructure services
docker-compose -f docker-compose.env.yml up -d
```

### Loading Pre-built Images

```bash
# Load images from tar files
docker load -i pricing-tool-api.tar
docker load -i pricing-tool-web.tar

# Verify images are loaded
docker images | grep pricing-tool
```

### Environment Variables

Create a `.env` file in the API directory:

```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://admin:admin123@localhost:27017/pricing-tool?authSource=admin
MINIO_ENDPOINT=localhost
MINIO_PORT=29000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

## Production Deployment

### 1. Build Images

```bash
./scripts/docker-build.sh
```

### 2. Transfer to Production Server

```bash
# Copy tar files to production server
scp pricing-tool-*.tar user@production-server:/path/to/deployment/
```

### 3. Load and Run on Production

```bash
# On production server
docker load -i pricing-tool-api.tar
docker load -i pricing-tool-web.tar

# Update docker-compose.yml to use the loaded images
# Then start services
docker-compose up -d
```

## Monitoring and Health Checks

- API Health Check: `http://localhost:3000/health`
- Web Health Check: `http://localhost:80/health`
- MinIO Console: `http://localhost:29001`
- MongoDB: `mongodb://localhost:27017`

## Troubleshooting

### Build Issues

```bash
# Clean everything and rebuild
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

### Docker Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f docker/Dockerfile.api -t pricing-tool-api:latest .
```

### Port Conflicts

- API: Change port in docker-compose.yml (default: 3000)
- Web: Change port in docker-compose.yml (default: 80)
- MongoDB: Change port in docker-compose.yml (default: 27017)
- MinIO: Change ports in docker-compose.yml (default: 29000, 29001)
