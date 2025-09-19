# Production stop script for Pricing Tool (Windows PowerShell)
# This script stops the complete production environment

Write-Host "🛑 Stopping Pricing Tool Production Environment" -ForegroundColor Red
Write-Host "==============================================" -ForegroundColor Red

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Step 1: Stop application services (API, Web)
Write-Status "Stopping application services (API, Web)..."
try {
    $webServices = docker-compose -f docker/docker-compose.web.yml ps -q
    if ($webServices) {
        docker-compose -f docker/docker-compose.web.yml down
        Write-Success "Application services stopped"
    } else {
        Write-Warning "No application services were running"
    }
} catch {
    Write-Warning "Error stopping application services: $($_.Exception.Message)"
}

# Step 2: Stop infrastructure services (MongoDB, MinIO)
Write-Status "Stopping infrastructure services (MongoDB, MinIO)..."
try {
    $envServices = docker-compose -f docker/docker-compose.env.yml ps -q
    if ($envServices) {
        docker-compose -f docker/docker-compose.env.yml down
        Write-Success "Infrastructure services stopped"
    } else {
        Write-Warning "No infrastructure services were running"
    }
} catch {
    Write-Warning "Error stopping infrastructure services: $($_.Exception.Message)"
}

# Optional: Clean up volumes (uncomment if you want to remove data)
# Write-Warning "Removing volumes (this will delete all data)..."
# docker-compose -f docker/docker-compose.env.yml down -v

Write-Success "🎉 All services stopped successfully!"
Write-Host ""
Write-Host "📋 Remaining containers:" -ForegroundColor Cyan
docker ps --filter "name=pricing-tool" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""
Write-Host "🔄 To start services again:" -ForegroundColor Cyan
Write-Host "  .\scripts\start-production.ps1"
