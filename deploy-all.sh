#!/bin/bash

# Deploy Backend
echo "========================================="
echo "Deploying Backend..."
echo "========================================="
docker buildx build \
  --platform linux/amd64 \
  --tag acrbookapp.azurecr.io/backend:latest \
  --push \
  ./backend

az containerapp update \
  --name book-app-api \
  --resource-group rg-bookapp-prod \
  --image acrbookapp.azurecr.io/backend:latest

# Deploy Frontend
echo "========================================="
echo "Deploying Frontend (production target)..."
echo "========================================="
docker buildx build \
  --platform linux/amd64 \
  --target production \
  --tag acrbookapp.azurecr.io/frontend:latest \
  --push \
  ./frontend

az containerapp update \
  --name book-app-ui \
  --resource-group rg-bookapp-prod \
  --image acrbookapp.azurecr.io/frontend:latest

echo "========================================="
echo "All deployments complete!"