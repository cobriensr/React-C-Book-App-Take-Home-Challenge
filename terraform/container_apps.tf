# container_apps.tf

# Container Registry (for storing Docker images)
resource "azurerm_container_registry" "main" {
  name                = "acrbookapp"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true # Required for admin credentials
  tags                = azurerm_resource_group.main.tags
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.project_name}-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  infrastructure_subnet_id   = azurerm_subnet.container_apps.id
  tags                       = azurerm_resource_group.main.tags
}

# Backend Container App - WITH ACR AUTHENTICATION
resource "azurerm_container_app" "backend" {
  name                         = "${var.project_name}-api"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # Add registry authentication
  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "registry-password"
  }

  template {
    container {
      name   = "backend"
      image  = "${azurerm_container_registry.main.login_server}/backend:latest" # Use ACR URL
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "production"
      }

      env {
        name        = "ConnectionStrings__DefaultConnection"
        secret_name = "connection-string"
      }

      env {
        name  = "ApplicationInsights__ConnectionString"
        value = azurerm_application_insights.main.connection_string
      }

      env {
        name  = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        value = azurerm_application_insights.main.connection_string
      }

      env {
        name        = "Jwt__SecretKey"
        secret_name = "jwt-secret"
      }

      env {
        name  = "Jwt__Issuer"
        value = "BookApi"
      }

      env {
        name  = "Jwt__Audience"
        value = "BookApiUsers"
      }

      env {
        name  = "Jwt__ExpirationMinutes"
        value = "60"
      }
    }

    min_replicas = 1
    max_replicas = 10

    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 100
    }
  }

  secret {
    name  = "connection-string"
    value = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_admin_username};Password=${random_password.sql_password.result};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }

  # Add ACR password as secret
  secret {
    name  = "registry-password"
    value = azurerm_container_registry.main.admin_password
  }

  # Add JWT secret as secret
  secret {
    name  = "jwt-secret"
    value = random_password.jwt_secret.result
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = azurerm_resource_group.main.tags
}

# Frontend Container App - WITH ACR AUTHENTICATION
resource "azurerm_container_app" "frontend" {
  name                         = "${var.project_name}-ui"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # Add registry authentication
  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "registry-password"
  }

  template {
    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.main.login_server}/frontend:latest" # Use ACR URL
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "VITE_APP_INSIGHTS_CONNECTION_STRING"
        value = azurerm_application_insights.main.connection_string
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }

    min_replicas = 1
    max_replicas = 10

    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 100
    }
  }

  # Add ACR password as secret
  secret {
    name  = "registry-password"
    value = azurerm_container_registry.main.admin_password
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = azurerm_resource_group.main.tags
}