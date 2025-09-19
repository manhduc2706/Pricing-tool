# Build packages script for Pricing Tool (PowerShell)
# This script builds all packages and prepares them for Docker

Write-Host "🔨 Building packages for Docker..." -ForegroundColor Green

# Build all packages
Write-Host "📦 Building packages..." -ForegroundColor Yellow
pnpm run build --filter="./packages/*"

# Create dist directories for Docker
Write-Host "📁 Preparing package distributions..." -ForegroundColor Yellow

# Create temp directory for Docker context
New-Item -ItemType Directory -Force -Path ".docker-context/packages" | Out-Null

# Copy built packages
Get-ChildItem -Path "packages" -Directory | ForEach-Object {
    $packageName = $_.Name
    $distPath = Join-Path $_.FullName "dist"
    
    if (Test-Path $distPath) {
        Write-Host "📋 Copying $packageName..." -ForegroundColor Cyan
        $targetPath = ".docker-context/packages/$packageName"
        New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
        Copy-Item -Path $distPath -Destination $targetPath -Recurse -Force
        Copy-Item -Path (Join-Path $_.FullName "package.json") -Destination $targetPath -Force
    }
}

Write-Host "✅ Packages built and prepared for Docker!" -ForegroundColor Green
Write-Host "📍 Built packages available in .docker-context/packages/" -ForegroundColor Blue
