# variables.tf
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "bookapp"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "Central US"
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/cobriensr/React-C-Book-App-Take-Home-Challenge"
}

variable "sql_admin_username" {
  description = "SQL Server admin username"
  type        = string
  default     = "sqladmin"
  sensitive   = true
}

variable "frontend_image" {
  description = "Frontend container image"
  type        = string
}

variable "backend_image" {
  description = "Backend container image"
  type        = string
}