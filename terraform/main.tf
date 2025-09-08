# main.tf

# Random password for SQL Server
resource "random_password" "sql_password" {
  length  = 32
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Random password for JWT Secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = false # Base64 friendly
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-bookapp-prod"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# Virtual Network for Container Apps
resource "azurerm_virtual_network" "main" {
  name                = "vnet-bookapp-prod"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.0.0.0/16"]

  tags = azurerm_resource_group.main.tags
}

# Subnet for Container Apps Environment
resource "azurerm_subnet" "container_apps" {
  name                 = "snet-container-apps"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.0.0/23"]
  service_endpoints    = ["Microsoft.Sql"]
}

# Subnet for Azure SQL Database
resource "azurerm_subnet" "sql" {
  name                 = "snet-sql"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Sql"]

  delegation {
    name = "delegation"
    service_delegation {
      name = "Microsoft.Sql/managedInstances"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
        "Microsoft.Network/virtualNetworks/subnets/prepareNetworkPolicies/action",
        "Microsoft.Network/virtualNetworks/subnets/unprepareNetworkPolicies/action",
      ]
    }
  }
}

# SQL Server Firewall Rule for Azure Services
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# SQL Server Firewall Rule for your development machine
resource "azurerm_mssql_firewall_rule" "allow_dev_machine" {
  name             = "AllowDevMachine"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "45.45.137.135"
  end_ip_address   = "45.45.137.135"
}