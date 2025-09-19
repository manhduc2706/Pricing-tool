@echo off
setlocal enabledelayedexpansion

echo 🔍 Tạo thư mục mount nếu chưa tồn tại...

REM Redis
if not exist ".\data\redis" (
    mkdir ".\data\redis"
    echo ✅ Tạo thư mục Redis: .\data\redis
)

REM MongoDB
if not exist ".\data\mongo" (
    mkdir ".\data\mongo"
    echo ✅ Tạo thư mục MongoDB: .\data\mongo
)

REM MinIO
if not exist ".\data\minio" (
    mkdir ".\data\minio"
    echo ✅ Tạo thư mục MinIO: .\data\minio
)

REM Logs directory
if not exist ".\logs" (
    mkdir ".\logs"
    echo ✅ Tạo thư mục Logs: .\logs
)

REM Storage directory
if not exist ".\storage" (
    mkdir ".\storage"
    echo ✅ Tạo thư mục Storage: .\storage
)

echo.
echo 🚀 Khởi động docker-compose environment...
echo 📋 Services sẽ được khởi động:
echo    - Redis (port: 26379)
echo    - MongoDB (port: 27017)
echo    - MinIO (port: 29000, console: 29001)
echo.

docker-compose -f docker-compose.env.yml up -d

echo.
echo ✅ Docker environment đã được khởi động thành công!
echo.
echo 🔗 Thông tin kết nối:
echo    Redis:   redis://localhost:26379
echo    MongoDB: mongodb://admin:admin123@localhost:27017/pricing-tool?authSource=admin
echo    MinIO:   http://localhost:29000 (admin: minioadmin/minioadmin123)
echo    MinIO Console: http://localhost:29001
echo.
echo 📁 Dữ liệu được lưu tại:
echo    Redis:   .\data\redis
echo    MongoDB: .\data\mongo
echo    MinIO:   .\data\minio
echo.
echo 🛠️  Để dừng services: docker-compose -f docker-compose.env.yml down
echo 🗑️  Để xóa dữ liệu: stop_docker_env.bat và clean_docker_env.bat

pause
