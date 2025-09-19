@echo off

echo ⚠️  CẢNH BÁO: Script này sẽ xóa TẤT CẢ dữ liệu Docker!
echo    - Dừng tất cả containers
echo    - Xóa tất cả volumes
echo    - Xóa tất cả thư mục data
echo.
set /p confirm="Bạn có chắc chắn muốn tiếp tục? (y/N): "

if /i not "%confirm%"=="y" (
    echo ❌ Hủy bỏ thao tác.
    pause
    exit /b 1
)

echo.
echo 🛑 Dừng và xóa containers...
docker-compose -f docker-compose.env.yml down -v

echo.
echo 🗑️  Xóa thư mục dữ liệu...
if exist ".\data" (
    rmdir /s /q ".\data"
    echo ✅ Đã xóa thư mục .\data
)

if exist ".\logs" (
    rmdir /s /q ".\logs"
    echo ✅ Đã xóa thư mục .\logs
)

if exist ".\storage" (
    rmdir /s /q ".\storage"
    echo ✅ Đã xóa thư mục .\storage
)

echo.
echo 🧹 Dọn dẹp Docker images không sử dụng...
docker system prune -f

echo.
echo ✅ Đã dọn dẹp hoàn toàn Docker environment!
echo 🚀 Để khởi động lại, chạy: start_docker_env.bat

pause
