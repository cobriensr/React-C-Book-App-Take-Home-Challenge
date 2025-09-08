#!/bin/bash

# Deploy Backend

BACKEND_URL="https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io"
FRONTEND_URL="https://book-app-ui.wittydesert-f0d21091.centralus.azurecontainerapps.io"
echo "Deploying Backend..."
docker buildx build \
  --platform linux/amd64 \
  --tag acrbookapp.azurecr.io/backend:latest \
  --push \
  ./backend

az containerapp update \
  --name book-app-api \
  --resource-group rg-bookapp-prod \
  --image acrbookapp.azurecr.io/backend:latest

echo "Backend deployment complete!"
echo "URL: $BACKEND_URL"

# Deploy Frontend
echo "Building and pushing frontend..."
echo "Using Backend API URL: ${BACKEND_URL}/api"
docker buildx build \
  --platform linux/amd64 \
  --target production \
  --build-arg VITE_API_URL=${BACKEND_URL}/api \
  --tag acrbookapp.azurecr.io/frontend:latest \
  --push \
  ./frontend

echo "Updating Azure Container App (frontend)..."
az containerapp update \
  --name book-app-ui \
  --resource-group rg-bookapp-prod \
  --image acrbookapp.azurecr.io/frontend:latest

echo "Frontend deployment complete!"
echo "URL: $FRONTEND_URL"
echo "Connected to backend: $BACKEND_URL"