#!/bin/bash

echo "Starting LibreTranslate service in the background..."
DOCKER_BUILDKIT=1 docker-compose up -d libretranslate

echo "Installing npm dependencies (if not already installed)..."
npm install

echo "Starting Vue development server..."
npm run dev
