#!/bin/bash

# Production startup script for Pricing Tool
# This script starts the complete production environment

set -e

echo "🚀 Starting Pricing Tool Production Environment"
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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required images exist
print_status "Checking for required Docker images..."

if ! docker image inspect pricing-tool-api:latest > /dev/null 2>&1; then
    print_error "pricing-tool-api:latest image not found. Please build it first:"
    echo "  docker build -f docker/Dockerfile.api -t pricing-tool-api:latest ."
    exit 1
fi

if ! docker image inspect pricing-tool-web:latest > /dev/null 2>&1; then
    print_error "pricing-tool-web:latest image not found. Please build it first:"
    echo "  docker build -f docker/Dockerfile.web -t pricing-tool-web:latest ."
    exit 1
fi

print_success "All required images found"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p docker/data/minio
mkdir -p docker/logs
mkdir -p docker/storage

# Step 1: Start infrastructure services (MongoDB, MinIO)
print_status "Starting infrastructure services (MongoDB, MinIO)..."
docker-compose -f docker/docker-compose.env.yml up -d

# Wait for services to be ready
print_status "Waiting for infrastructure services to be ready..."
sleep 10

# Check MongoDB
print_status "Checking MongoDB connection..."
for i in {1..30}; do
    if docker exec pricing-tool-mongoDb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "MongoDB failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Check MinIO
print_status "Checking MinIO connection..."
for i in {1..30}; do
    if curl -f http://localhost:29000/minio/health/live > /dev/null 2>&1; then
        print_success "MinIO is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "MinIO health check failed, but continuing..."
        break
    fi
    sleep 1
done

# Step 2: Start application services (API, Web)
print_status "Starting application services (API, Web)..."
docker-compose -f docker/docker-compose.web.yml up -d

# Wait for application services
print_status "Waiting for application services to be ready..."
sleep 15

# Check API
print_status "Checking API health..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "API is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "API failed to start within 60 seconds"
        print_status "Checking API logs..."
        docker logs pricing-tool-api --tail 20
        exit 1
    fi
    sleep 1
done

# Check Web
print_status "Checking Web service..."
for i in {1..30}; do
    if curl -f http://localhost:1680/health > /dev/null 2>&1; then
        print_success "Web service is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Web health check failed, but service might still be working"
        break
    fi
    sleep 1
done

# Final status
echo ""
print_success "🎉 Pricing Tool Production Environment Started Successfully!"
echo ""
echo "📋 Service URLs:"
echo "  🌐 Web Application: http://localhost:1680"
echo "  🔧 API Server: http://localhost:3000"
echo "  🗄️  MongoDB: localhost:27017"
echo "  📦 MinIO Console: http://localhost:29001"
echo "  📦 MinIO API: http://localhost:29000"
echo ""
echo "📊 Service Status:"
docker-compose -f docker/docker-compose.env.yml ps
docker-compose -f docker/docker-compose.web.yml ps
echo ""
echo "🔍 To view logs:"
echo "  docker-compose -f docker/docker-compose.web.yml logs -f"
echo ""
echo "🛑 To stop all services:"
echo "  ./scripts/stop-production.sh"
