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

echo "1. Checking if libretranslate container needs to be restarted..."
if docker ps -a --format '{{.Names}}' | grep -q '^gaijin-helper_libretranslate$'; then
    echo "   Found gaijin-helper_libretranslate container. Stopping and removing it..."
    docker stop gaijin-helper_libretranslate 2>/dev/null
    docker rm gaijin-helper_libretranslate 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "Error: Failed to remove gaijin-helper_libretranslate container. Aborting deployment."
        exit 1
    fi
    echo "   Successfully removed gaijin-helper_libretranslate container."
else
    echo "   gaijin-helper_libretranslate container not found. Skipping removal."
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
