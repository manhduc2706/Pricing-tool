#!/bin/bash

set -e

echo "⚠️  CẢNH BÁO: Script này sẽ xóa TẤT CẢ dữ liệu Docker!"
echo "   - Dừng tất cả containers"
echo "   - Xóa tất cả volumes"
echo "   - Xóa tất cả thư mục data"
echo ""
read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Hủy bỏ thao tác."
    exit 1
fi

echo ""
echo "🛑 Dừng và xóa containers..."
docker-compose -f docker-compose.env.yml down -v

echo ""
echo "🗑️  Xóa thư mục dữ liệu..."
if [ -d "./data" ]; then
    rm -rf ./data
    echo "✅ Đã xóa thư mục ./data"
fi

if [ -d "./logs" ]; then
    rm -rf ./logs
    echo "✅ Đã xóa thư mục ./logs"
fi

if [ -d "./storage" ]; then
    rm -rf ./storage
    echo "✅ Đã xóa thư mục ./storage"
fi

echo ""
echo "🧹 Dọn dẹp Docker images không sử dụng..."
docker system prune -f

echo ""
echo "✅ Đã dọn dẹp hoàn toàn Docker environment!"
echo "🚀 Để khởi động lại, chạy: ./start_docker_env.sh"
