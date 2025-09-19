#!/bin/bash

set -e

echo "🛑 Dừng docker-compose environment..."

docker-compose -f docker-compose.env.yml down

echo ""
echo "✅ Docker environment đã được dừng thành công!"
echo ""
echo "📁 Dữ liệu vẫn được giữ lại tại:"
echo "   Redis:   ./data/redis"
echo "   MongoDB: ./data/mongo"
echo "   MinIO:   ./data/minio"
echo ""
echo "🗑️  Để xóa hoàn toàn dữ liệu, chạy: ./clean_docker_env.sh"
