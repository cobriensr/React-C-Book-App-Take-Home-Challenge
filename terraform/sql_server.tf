# sql_server.tf

# Azure SQL Server (Serverless)
resource "azurerm_mssql_server" "main" {
  name                         = "sql-${var.project_name}-${var.environment}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = random_password.sql_password.result
  minimum_tls_version          = "1.2"

  azuread_administrator {
    login_username = "AzureAD Admin"
    object_id      = data.azurerm_client_config.current.object_id
  }

  tags = azurerm_resource_group.main.tags
}

# Azure SQL Database (Serverless Tier)
resource "azurerm_mssql_database" "main" {
  name      = "sqldb-${var.project_name}-${var.environment}"
  server_id = azurerm_mssql_server.main.id

  # Serverless configuration
  sku_name                    = "GP_S_Gen5_2"
  min_capacity                = 0.5
  auto_pause_delay_in_minutes = 60
  max_size_gb                 = 32
  zone_redundant              = false

  tags = azurerm_resource_group.main.tags
}

# SQL Server Virtual Network Rule
resource "azurerm_mssql_virtual_network_rule" "container_apps" {
  name      = "container-apps-vnet-rule"
  server_id = azurerm_mssql_server.main.id
  subnet_id = azurerm_subnet.container_apps.id
}