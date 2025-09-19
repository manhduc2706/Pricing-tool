# Docker Configuration for Pricing Tool

This directory contains Docker configurations for the Pricing Tool application.

## Files

### Docker Compose Files
- `docker-compose.yml` - Main docker compose configuration
- `docker-compose.env.yml` - Environment-specific services (Redis, MongoDB, MinIO)
- `docker-compose.web.yml` - Web application specific configuration

### Dockerfiles
- `Dockerfile.api` - API service Dockerfile
- `Dockerfile.web` - Web application Dockerfile

### Scripts
- `start_docker_env.sh` / `start_docker_env.bat` - Start environment services
- `stop_docker_env.sh` / `stop_docker_env.bat` - Stop environment services
- `clean_docker_env.sh` / `clean_docker_env.bat` - Clean all data and containers

## Quick Start

### 🚀 Start Environment Services

**Linux/macOS:**
```bash
chmod +x start_docker_env.sh
./start_docker_env.sh
```

**Windows:**
```cmd
start_docker_env.bat
```

### 🛑 Stop Environment Services

**Linux/macOS:**
```bash
./stop_docker_env.sh
```

**Windows:**
```cmd
stop_docker_env.bat
```

### 🗑️ Clean All Data

**Linux/macOS:**
```bash
./clean_docker_env.sh
```

**Windows:**
```cmd
clean_docker_env.bat
```

## Services

### Environment Services (docker-compose.env.yml)

| Service | Port | Description | Credentials |
|---------|------|-------------|-------------|
| **Redis** | 26379 | Cache and session storage | No auth |
| **MongoDB** | 27017 | Primary database | admin/admin123 |
| **MinIO** | 29000 | Object storage | minioadmin/minioadmin123 |
| **MinIO Console** | 29001 | MinIO web interface | minioadmin/minioadmin123 |

### Connection Strings

```bash
# Redis
redis://localhost:26379

# MongoDB
mongodb://admin:admin123@localhost:27017/pricing-tool?authSource=admin

# MinIO
http://localhost:29000
```

## Data Persistence

Data is persisted using local directory mounts:

```
./data/
├── redis/          # Redis data
├── mongo/          # MongoDB data
└── minio/          # MinIO data

./logs/             # Application logs
./storage/          # File storage
```

## Manual Commands

### Start specific services
```bash
# Start only environment services
docker-compose -f docker-compose.env.yml up -d

# Start full application
docker-compose up -d
```

### Stop services
```bash
# Stop environment services
docker-compose -f docker-compose.env.yml down

# Stop all services
docker-compose down
```

### View logs
```bash
# View all logs
docker-compose -f docker-compose.env.yml logs -f

# View specific service logs
docker-compose -f docker-compose.env.yml logs -f mongo
```

### Clean up
```bash
# Remove containers and volumes
docker-compose -f docker-compose.env.yml down -v

# Remove unused images
docker system prune -f
```

## Environment Variables

The services use the following default configurations:

### MongoDB
- `MONGO_INITDB_ROOT_USERNAME`: admin
- `MONGO_INITDB_ROOT_PASSWORD`: admin123
- `MONGO_INITDB_DATABASE`: pricing-tool

### MinIO
- `MINIO_ROOT_USER`: minioadmin
- `MINIO_ROOT_PASSWORD`: minioadmin123
- `MINIO_REGION`: us-east-1

### Redis
- No authentication required
- Persistence enabled with AOF

## Troubleshooting

### Port conflicts
If you encounter port conflicts, modify the ports in `docker-compose.env.yml`:

```yaml
ports:
  - "27018:27017"  # Change MongoDB port
  - "29001:9000"   # Change MinIO port
```

### Permission issues (Linux/macOS)
```bash
# Make scripts executable
chmod +x *.sh

# Fix data directory permissions
sudo chown -R $USER:$USER ./data
```

### Data corruption
```bash
# Clean and restart
./clean_docker_env.sh
./start_docker_env.sh
```

```powershell
# Start all services
.\scripts\start-production.ps1
```

### Manual Start (Step by Step)

1. **Start Infrastructure Services:**

   ```bash
   docker-compose -f docker/docker-compose.env.yml up -d
   ```

2. **Start Application Services:**
   ```bash
   docker-compose -f docker/docker-compose.web.yml up -d
   ```

### Stopping Services

**Linux/macOS:**

```bash
./scripts/stop-production.sh
```

**Windows:**

```powershell
.\scripts\stop-production.ps1
```

**Manual Stop:**

```bash
docker-compose -f docker/docker-compose.web.yml down
docker-compose -f docker/docker-compose.env.yml down
```

## Service URLs

- **Web Application:** http://localhost:1680
- **API Server:** http://localhost:3000
- **MongoDB:** localhost:27017
- **MinIO Console:** http://localhost:29001
- **MinIO API:** http://localhost:29000

## Environment Variables

The API container uses the following environment variables (configured in `docker-compose.web.yml`):

### Database

- `MONGO_CONNECTION` - MongoDB connection string
- `MONGO_RETRY_WRITES` - Enable retry writes
- `MONGO_MAX_POOL_SIZE` - Maximum connection pool size

### MinIO Storage

- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_PORT` - MinIO server port
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET_NAME` - Default bucket name

### Security

- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

### File Upload

- `MAX_FILE_SIZE` - Maximum file upload size
- `ALLOWED_IMAGE_FORMATS` - Allowed image formats

## Monitoring

### Health Checks

All services include health checks:

- API: `http://localhost:3000/api/health`
- Web: `http://localhost:1680/health`

### Logs

View logs for all services:

```bash
docker-compose -f docker/docker-compose.web.yml logs -f
```

View logs for specific service:

```bash
docker logs pricing-tool-api -f
docker logs pricing-tool-web -f
```

## Data Persistence

- **MongoDB Data:** Stored in Docker volume `mongo-data`
- **MinIO Data:** Stored in `./docker/data/minio`
- **Application Logs:** Stored in `./docker/logs`
- **File Storage:** Stored in `./docker/storage`

## Network Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │────│ Nginx (Port 1680)│
└─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │  API (Port 3000) │
                       └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌─────────────────┐    ┌─────────────────┐
            │ MongoDB (27017) │    │  MinIO (29000)  │
            └─────────────────┘    └─────────────────┘
```

## Troubleshooting

### Common Issues

1. **Port conflicts:** Ensure ports 1680, 3000, 27017, 29000, 29001 are available
2. **Image not found:** Build the Docker images first
3. **Permission denied:** Make sure scripts are executable (`chmod +x`)

### Debugging

1. **Check container status:**

   ```bash
   docker ps --filter "name=pricing-tool"
   ```

2. **View container logs:**

   ```bash
   docker logs pricing-tool-api --tail 50
   docker logs pricing-tool-web --tail 50
   ```

3. **Access container shell:**
   ```bash
   docker exec -it pricing-tool-api /bin/sh
   ```

### Clean Reset

To completely reset (⚠️ **This will delete all data**):

```bash
docker-compose -f docker/docker-compose.web.yml down
docker-compose -f docker/docker-compose.env.yml down -v
docker system prune -f
```
