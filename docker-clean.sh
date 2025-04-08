#!/bin/bash 

echo "🧹 Cleaning up Docker build cache and dangling images..."

docker builder prune -f
docker image prune -f

echo "📊 Docker disk usage after cleanup:"
docker system df

echo "✅ Done!"
