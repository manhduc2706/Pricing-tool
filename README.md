# Pricing Tool

A modern pricing and quotation management system built with a monorepo architecture.

## Structure

- `apps/api` - Backend API server
- `apps/web` - Frontend React application
- `packages/` - Shared packages and utilities

## Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Start specific apps
pnpm dev:api
pnpm dev:web

# Build all apps
pnpm build

# Build specific apps
pnpm build:api
pnpm build:web
```

## Docker

Build and run with Docker:

```bash
# Build Docker images
pnpm run build:web
pnpm run build:api

# Build Docker images
docker build -f ./docker/Dockerfile.web . -t pricing-tool-web:latest
docker build -f ./docker/Dockerfile.api . -t pricing-tool-api:latest

# Save images as tar files
docker save pricing-tool-web:latest -o pricing-tool-web.tar
docker save pricing-tool-api:latest -o pricing-tool-api.tar
```
