#!/bin/bash

# Production stop script for Pricing Tool
# This script stops the complete production environment

set -e

echo "🛑 Stopping Pricing Tool Production Environment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Stop application services (API, Web)
print_status "Stopping application services (API, Web)..."
if docker-compose -f docker/docker-compose.web.yml ps -q | grep -q .; then
    docker-compose -f docker/docker-compose.web.yml down
    print_success "Application services stopped"
else
    print_warning "No application services were running"
fi

# Step 2: Stop infrastructure services (MongoDB, MinIO)
print_status "Stopping infrastructure services (MongoDB, MinIO)..."
if docker-compose -f docker/docker-compose.env.yml ps -q | grep -q .; then
    docker-compose -f docker/docker-compose.env.yml down
    print_success "Infrastructure services stopped"
else
    print_warning "No infrastructure services were running"
fi

# Optional: Clean up volumes (uncomment if you want to remove data)
# print_warning "Removing volumes (this will delete all data)..."
# docker-compose -f docker/docker-compose.env.yml down -v

print_success "🎉 All services stopped successfully!"
echo ""
echo "📋 Remaining containers:"
docker ps --filter "name=pricing-tool" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🔄 To start services again:"
echo "  ./scripts/start-production.sh"
