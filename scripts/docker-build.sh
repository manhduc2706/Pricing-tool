#!/bin/bash

# Docker build script for Pricing Tool
# This script builds packages first, then builds Docker images

set -e

echo "🚀 Starting Pricing Tool Docker build process..."

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .docker-context
rm -rf apps/*/dist
rm -rf packages/*/dist

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Step 3: Build packages
echo "🔨 Building packages..."
./scripts/build-packages.sh

# Step 4: Build Docker images
echo "🐳 Building Docker images..."

# Build API image
echo "🔧 Building API image..."
docker build -f docker/Dockerfile.api -t pricing-tool-api:latest .

# Build Web image
echo "🌐 Building Web image..."
docker build -f docker/Dockerfile.web -t pricing-tool-web:latest .

# Step 5: Save images as tar files (similar to ccam build process)
echo "💾 Saving Docker images as tar files..."
docker save pricing-tool-api:latest -o pricing-tool-api.tar
docker save pricing-tool-web:latest -o pricing-tool-web.tar

# Step 6: Clean up
echo "🧹 Cleaning up..."
rm -rf .docker-context

echo "✅ Docker build completed successfully!"
echo "📋 Images built:"
echo "   - pricing-tool-api:latest"
echo "   - pricing-tool-web:latest"
echo "📦 Tar files created:"
echo "   - pricing-tool-api.tar"
echo "   - pricing-tool-web.tar"

# Show image sizes
echo "📊 Image sizes:"
docker images | grep pricing-tool
