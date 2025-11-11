#!/bin/bash

# This script performs a clean deployment of the application using Docker Compose.
# It stops and removes existing containers, then builds and starts new ones.

# IMPORTANT:
# Before running this script on a remote instance, ensure your docker-compose.yml
# is configured correctly for the remote environment. Specifically, the
# VITE_LIBRETRANSLATE_API_URL environment variable for the 'frontend' service
# should point to the remote server's IP or domain, not 'localhost'.
# Example: VITE_LIBRETRANSLATE_API_URL=http://<YOUR_REMOTE_IP_OR_DOMAIN>:5050

echo "--- Starting Clean Deployment ---"

echo "1. Stopping and removing existing Docker containers and associated resources..."
DOCKER_BUILDKIT=1 docker-compose down --volumes --remove-orphans

if [ $? -ne 0 ]; then
    echo "Error: docker-compose down failed. Aborting deployment."
    exit 1
fi

echo "2. Building and starting new Docker containers in detached mode..."
DOCKER_BUILDKIT=1 docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo "Error: docker-compose up failed. Aborting deployment."
    exit 1
fi

echo "--- Deployment Complete ---"
echo "Your application should now be running."
echo "Access the frontend at http://<YOUR_REMOTE_IP_OR_DOMAIN>:8090 (replace with your actual remote IP/domain)."
echo "Verify container status with: docker ps"
