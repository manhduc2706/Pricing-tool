# Docker build script for Pricing Tool (PowerShell)
# This script builds packages first, then builds Docker images

Write-Host "🚀 Starting Pricing Tool Docker build process..." -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".docker-context") { Remove-Item -Path ".docker-context" -Recurse -Force }
Get-ChildItem -Path "apps" -Directory | ForEach-Object {
    $distPath = Join-Path $_.FullName "dist"
    if (Test-Path $distPath) { Remove-Item -Path $distPath -Recurse -Force }
}
Get-ChildItem -Path "packages" -Directory | ForEach-Object {
    $distPath = Join-Path $_.FullName "dist"
    if (Test-Path $distPath) { Remove-Item -Path $distPath -Recurse -Force }
}

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install --frozen-lockfile

# Step 3: Build packages
Write-Host "🔨 Building packages..." -ForegroundColor Yellow
& "./scripts/build-packages.ps1"

# Step 4: Build Docker images
Write-Host "🐳 Building Docker images..." -ForegroundColor Yellow

# Build API image
Write-Host "🔧 Building API image..." -ForegroundColor Cyan
docker build -f docker/Dockerfile.api -t pricing-tool-api:latest .

# Build Web image
Write-Host "🌐 Building Web image..." -ForegroundColor Cyan
docker build -f docker/Dockerfile.web -t pricing-tool-web:latest .

# Step 5: Save images as tar files
Write-Host "💾 Saving Docker images as tar files..." -ForegroundColor Yellow
docker save pricing-tool-api:latest -o pricing-tool-api.tar
docker save pricing-tool-web:latest -o pricing-tool-web.tar

# Step 6: Clean up
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
if (Test-Path ".docker-context") { Remove-Item -Path ".docker-context" -Recurse -Force }

Write-Host "✅ Docker build completed successfully!" -ForegroundColor Green
Write-Host "📋 Images built:" -ForegroundColor Blue
Write-Host "   - pricing-tool-api:latest" -ForegroundColor White
Write-Host "   - pricing-tool-web:latest" -ForegroundColor White
Write-Host "📦 Tar files created:" -ForegroundColor Blue
Write-Host "   - pricing-tool-api.tar" -ForegroundColor White
Write-Host "   - pricing-tool-web.tar" -ForegroundColor White

# Show image sizes
Write-Host "📊 Image sizes:" -ForegroundColor Blue
docker images | Select-String "pricing-tool"
