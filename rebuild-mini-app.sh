#!/bin/bash
echo "Stopping services..."
docker compose -f docker-compose.prod.yml down

echo "Removing old build volume..."
docker volume rm tour_telegram_mini_app_dist

echo "Rebuilding mini-app..."
docker compose -f docker-compose.prod.yml build tour-telegram-mini-app

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Done! Mini-app rebuilt and deployed."
