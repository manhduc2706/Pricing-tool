#!/bin/bash

# Build packages script for Pricing Tool
# This script builds all packages and prepares them for Docker

set -e

echo "🔨 Building packages for Docker..."

# Build all packages
echo "📦 Building packages..."
pnpm run build --filter="./packages/*"

# Create dist directories for Docker
echo "📁 Preparing package distributions..."

# Create temp directory for Docker context
mkdir -p .docker-context/packages

# Copy built packages
for package in packages/*/; do
  package_name=$(basename "$package")
  if [ -d "$package/dist" ]; then
    echo "📋 Copying $package_name..."
    mkdir -p ".docker-context/packages/$package_name"
    cp -r "$package/dist" ".docker-context/packages/$package_name/"
    cp "$package/package.json" ".docker-context/packages/$package_name/"
  fi
done

echo "✅ Packages built and prepared for Docker!"
echo "📍 Built packages available in .docker-context/packages/"
