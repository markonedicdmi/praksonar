#!/bin/bash
# deploy.sh

echo "Pulling latest changes from main branch..."
git pull origin main

echo "Building new Docker image..."
docker compose build

echo "Restarting the container with new image..."
docker compose up -d

echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment complete! Application is running at http://localhost:3000"
