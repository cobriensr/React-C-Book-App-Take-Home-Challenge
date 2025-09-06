# Makefile
.PHONY: help build up down logs clean restart dev prod init-frontend

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yml up --build

dev-build: ## Build development containers
	docker-compose -f docker-compose.dev.yml build

dev-up: ## Start development containers (no build)
	docker-compose -f docker-compose.dev.yml up

dev-down: ## Stop development containers
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod: ## Start production environment
	docker-compose -f docker-compose.prod.yml up --build -d

prod-build: ## Build production containers
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production containers (no build)
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production containers
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

# Database commands
db-migrate: ## Run database migrations
	docker-compose -f docker-compose.dev.yml exec backend dotnet ef database update

db-reset: ## Reset database (drop and recreate)
	docker-compose -f docker-compose.dev.yml exec backend dotnet ef database drop -f
	docker-compose -f docker-compose.dev.yml exec backend dotnet ef database update

# General commands
clean: ## Clean up all containers and volumes
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

restart: ## Restart all containers
	$(MAKE) dev-down
	$(MAKE) dev-up

# Setup commands
init-frontend: ## Initialize frontend with dependencies
	cd frontend && npm install

init-backend: ## Initialize backend with dependencies
	cd backend && dotnet restore

init: ## Initialize both frontend and backend
	$(MAKE) init-backend
	$(MAKE) init-frontend