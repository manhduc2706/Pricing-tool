# Production startup script for Pricing Tool (Windows PowerShell)
# This script starts the complete production environment

param(
    [switch]$SkipHealthCheck = $false
)

Write-Host "🚀 Starting Pricing Tool Production Environment" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

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

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if required images exist
Write-Status "Checking for required Docker images..."

try {
    docker image inspect pricing-tool-api:latest | Out-Null
} catch {
    Write-Error "pricing-tool-api:latest image not found. Please build it first:"
    Write-Host "  docker build -f docker/Dockerfile.api -t pricing-tool-api:latest ."
    exit 1
}

try {
    docker image inspect pricing-tool-web:latest | Out-Null
} catch {
    Write-Error "pricing-tool-web:latest image not found. Please build it first:"
    Write-Host "  docker build -f docker/Dockerfile.web -t pricing-tool-web:latest ."
    exit 1
}

Write-Success "All required images found"

# Create necessary directories
Write-Status "Creating necessary directories..."
New-Item -ItemType Directory -Force -Path "docker/data/minio" | Out-Null
New-Item -ItemType Directory -Force -Path "docker/logs" | Out-Null
New-Item -ItemType Directory -Force -Path "docker/storage" | Out-Null

# Step 1: Start infrastructure services (MongoDB, MinIO)
Write-Status "Starting infrastructure services (MongoDB, MinIO)..."
docker-compose -f docker/docker-compose.env.yml up -d

if (!$SkipHealthCheck) {
    # Wait for services to be ready
    Write-Status "Waiting for infrastructure services to be ready..."
    Start-Sleep -Seconds 10

    # Check MongoDB
    Write-Status "Checking MongoDB connection..."
    $mongoReady = $false
    for ($i = 1; $i -le 30; $i++) {
        try {
            docker exec pricing-tool-mongoDb mongosh --eval "db.adminCommand('ping')" | Out-Null
            Write-Success "MongoDB is ready"
            $mongoReady = $true
            break
        } catch {
            if ($i -eq 30) {
                Write-Error "MongoDB failed to start within 30 seconds"
                exit 1
            }
            Start-Sleep -Seconds 1
        }
    }

    # Check MinIO
    Write-Status "Checking MinIO connection..."
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:29000/minio/health/live" -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Success "MinIO is ready"
                break
            }
        } catch {
            if ($i -eq 30) {
                Write-Warning "MinIO health check failed, but continuing..."
                break
            }
            Start-Sleep -Seconds 1
        }
    }
}

# Step 2: Start application services (API, Web)
Write-Status "Starting application services (API, Web)..."
docker-compose -f docker/docker-compose.web.yml up -d

if (!$SkipHealthCheck) {
    # Wait for application services
    Write-Status "Waiting for application services to be ready..."
    Start-Sleep -Seconds 15

    # Check API
    Write-Status "Checking API health..."
    $apiReady = $false
    for ($i = 1; $i -le 60; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Success "API is ready"
                $apiReady = $true
                break
            }
        } catch {
            if ($i -eq 60) {
                Write-Error "API failed to start within 60 seconds"
                Write-Status "Checking API logs..."
                docker logs pricing-tool-api --tail 20
                exit 1
            }
            Start-Sleep -Seconds 1
        }
    }

    # Check Web
    Write-Status "Checking Web service..."
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:1680/health" -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Success "Web service is ready"
                break
            }
        } catch {
            if ($i -eq 30) {
                Write-Warning "Web health check failed, but service might still be working"
                break
            }
            Start-Sleep -Seconds 1
        }
    }
}

# Final status
Write-Host ""
Write-Success "🎉 Pricing Tool Production Environment Started Successfully!"
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "  🌐 Web Application: http://localhost:1680"
Write-Host "  🔧 API Server: http://localhost:3000"
Write-Host "  🗄️  MongoDB: localhost:27017"
Write-Host "  📦 MinIO Console: http://localhost:29001"
Write-Host "  📦 MinIO API: http://localhost:29000"
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose -f docker/docker-compose.env.yml ps
docker-compose -f docker/docker-compose.web.yml ps
Write-Host ""
Write-Host "🔍 To view logs:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker/docker-compose.web.yml logs -f"
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor Cyan
Write-Host "  .\scripts\stop-production.ps1"
