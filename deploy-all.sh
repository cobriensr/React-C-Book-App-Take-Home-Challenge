#!/bin/bash

# Generate unique build tag
BUILD_TAG=$(date +%Y%m%d%H%M%S)

# Stable URLs from Terraform outputs
BACKEND_URL="https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io"
FRONTEND_URL="https://book-app-ui.wittydesert-f0d21091.centralus.azurecontainerapps.io"

# Deploy Backend
echo "========================================="
echo "Deploying Backend with tag: $BUILD_TAG"
echo "========================================="
docker buildx build \
  --platform linux/amd64 \
  --tag acrbookapp.azurecr.io/backend:$BUILD_TAG \
  --tag acrbookapp.azurecr.io/backend:latest \
  --push \
  ./backend

az containerapp update \
  --name book-app-api \
  --resource-group rg-bookapp-prod \
  --image acrbookapp.azurecr.io/backend:$BUILD_TAG \
  --revision-suffix $BUILD_TAG

echo "Backend deployed to: $BACKEND_URL"

# Deploy Frontend with stable backend URL
echo "========================================="
echo "Deploying Frontend with tag: $BUILD_TAG"
echo "Building with API URL: ${BACKEND_URL}/api"
echo "========================================="
docker buildx build \
  --platform linux/amd64 \
  --target production \
  --build-arg VITE_API_URL=${BACKEND_URL}/api \
  --tag acrbookapp.azurecr.io/frontend:$BUILD_TAG \
  --tag acrbookapp.azurecr.io/frontend:latest \
  --push \
  ./frontend

az containerapp update \
  --name book-app-ui \
  --resource-group rg-bookapp-prod \
  --image acrbookapp.azurecr.io/frontend:$BUILD_TAG \
  --revision-suffix $BUILD_TAG

echo "Frontend deployed to: $FRONTEND_URL"

echo "========================================="
echo "All deployments complete!"
echo "Build Tag: $BUILD_TAG"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "========================================="

# Show recent revisions
echo "Recent backend revisions:"
az containerapp revision list \
  --name book-app-api \
  --resource-group rg-bookapp-prod \
  --query "[0:3].{Name:name, Active:properties.active, Created:properties.createdTime}" \
  -o table

echo "Recent frontend revisions:"
az containerapp revision list \
  --name book-app-ui \
  --resource-group rg-bookapp-prod \
  --query "[0:3].{Name:name, Active:properties.active, Created:properties.createdTime}" \
  -o table