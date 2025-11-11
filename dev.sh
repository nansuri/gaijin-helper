#!/bin/bash

echo "Starting LibreTranslate service in the background..."
docker-compose up -d libretranslate

echo "Installing npm dependencies (if not already installed)..."
npm install

echo "Starting Vue development server..."
npm run dev
