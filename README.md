# Book App - Full Stack Application

A modern book management application built with .NET 9.0 backend and React + TypeScript frontend, deployed on Azure Container Apps with Terraform infrastructure.

## 📋 Prerequisites

### Required Software

- **Docker Desktop** (with Docker Compose)
- **Node.js** (v22 or higher)
- **.NET 9.0 SDK**
- **Azure CLI** (for deployment)
- **Git**

### Azure Resources (Pre-configured via Terraform)

- Azure SQL Database
- Azure Container Registry (ACR)
- Azure Container Apps Environment
- Application Insights

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd react-c-book-app-take-home-challenge
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
# Azure SQL Connection String (get from Azure Portal or Terraform output)
AZURE_SQL_CONNECTION_STRING="Server=tcp:<server>.database.windows.net,1433;Initial Catalog=bookdb;..."

# JWT Secret (minimum 32 characters)

JWT_SECRET_KEY="YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!"

# Azure Container Registry (if deploying)

ACR_USERNAME=acrbookapp
ACR_PASSWORD=<get-from-azure-portal>
```

### 3. Database Access Configuration

**Important**: The Azure SQL Database has IP-based firewall rules. To connect locally:

1. Get your public IP: `curl ifconfig.me`
2. Add it to Azure SQL firewall:

```bash
az sql server firewall-rule create \
  --resource-group rg-bookapp-prod \
  --server sql-bookapp-prod \
  --name "Developer-<YourName>" \
  --start-ip-address <YOUR_IP> \
  --end-ip-address <YOUR_IP>
```

**Note**: The database is pre-seeded with test data. No migrations are needed.

## 🏃‍♂️ Running the Application

### Option 1: Docker Compose (Recommended)

**Development Mode** (with hot reload):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8080>
- Swagger: <http://localhost:8080/swagger>

**Production Mode** (nginx + optimized builds):

```bash
docker-compose -f docker-compose.prod.yml up --build
```

- Frontend: <http://localhost:80>
- Backend: <http://localhost:8080>
- Swagger: <http://localhost:8080/swagger>

### Option 2: Run Locally Without Docker

**Backend**:

```bash
cd backend
dotnet restore
dotnet run
# Server starts at http://localhost:8080
```

**Frontend** (in a new terminal):

```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

### Option 3: Run Concurrently

Install concurrently globally:

```bash
npm install -g concurrently
```

Create a `package.json` in the root directory:

```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && dotnet run\" \"cd frontend && npm run dev\"",
    "install:all": "cd backend && dotnet restore && cd ../frontend && npm install"
  }
}
```

Then run:

```bash
npm run install:all
npm run dev
```

## 🧪 API Testing

### Swagger UI

Access the interactive API documentation at:

- Local: <http://localhost:8080/swagger>
- Production: <https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io/swagger>

### Sample API Endpoints

#### Register User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "testuser",
    "password": "Test123!"
  }'
```

#### Test Credentials (Pre-seeded)

- Username: `johndoe` / Password: `Test123!`
- Username: `janedoe` / Password: `Test123!`

## 🏗️ Architecture & Design Decisions

### Technology Stack

**Backend**:

- **.NET 9.0** - Latest LTS with performance improvements
- **Entity Framework Core** - Code-first ORM with migrations
- **JWT Authentication** - Stateless, scalable authentication
- **AutoMapper** - Clean DTO mapping
- **BCrypt** - Industry-standard password hashing

**Frontend**:

- **React 18** with **TypeScript** - Type safety and modern React features
- **Vite** - Fast build tool with HMR
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management

**Infrastructure**:

- **Azure Container Apps** - Serverless container hosting
- **Azure SQL Database** - Managed SQL with automatic backups
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline

### Key Design Decisions

1. **Container Apps over App Service**:
   - Better for microservices architecture
   - Automatic scaling to zero
   - Built-in container support

2. **Separate Frontend/Backend Containers**:
   - Independent scaling
   - Technology-agnostic
   - Clear separation of concerns

3. **Azure SQL over Cosmos DB**:
   - Relational data model fits book/user relationships
   - ACID compliance for transactions
   - Cost-effective for this use case

4. **JWT over Session Authentication**:
   - Stateless and scalable
   - Works well with containerized architecture
   - No session storage needed

### Trade-offs

1. **Azure SQL Database Connectivity**:
   - **Trade-off**: Using cloud database even for local development
   - **Reason**: SQL Server Docker images incompatible with Apple Silicon
   - **Impact**: Requires IP whitelisting for developers

2. **Single Revision Mode**:
   - **Trade-off**: Brief downtime during deployments
   - **Reason**: Simpler configuration and cost savings
   - **Alternative**: Could use Multiple revision mode for zero-downtime

3. **No Redis Cache**:
   - **Trade-off**: All requests hit the database
   - **Reason**: Simplicity for take-home challenge
   - **Future**: Add Redis for session/cache management

4. **Environment Variables at Build Time**:
   - **Trade-off**: Frontend needs rebuild for URL changes
   - **Reason**: Vite's design - variables baked into bundle
   - **Alternative**: Runtime config service

## 🚢 Deployment

### Deploy to Azure Container Apps

**Login to Azure and ACR**:

```bash
az login
az acr login --name acrbookapp
```

**Build and Deploy**:

```bash
# Deploy everything
./deploy-all.sh

# Or deploy individually
./deploy-backend.sh
./deploy-frontend.sh
```

**Production URLs**:

- Frontend: <https://book-app-ui.wittydesert-f0d21091.centralus.azurecontainerapps.io>
- Backend API: <https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io>
- Swagger: <https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io/swagger>

## 🐛 Troubleshooting

### Database Connection Issues

- **Error**: "Cannot connect to SQL Server"
- **Solution**: Ensure your IP is whitelisted in Azure SQL firewall rules

### CORS Errors

- **Error**: "CORS header 'Access-Control-Allow-Origin' missing"
- **Solution**: Backend is configured for `AllowAll` in development. Check if backend is running.

### Frontend Shows localhost:3000 API calls

- **Issue**: Frontend using wrong API URL
- **Solution**: Rebuild frontend with correct `VITE_API_URL`:

```bash
docker buildx build \
  --build-arg VITE_API_URL=https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io/api \
  --target production \
  -t frontend:latest \
  ./frontend
```

### Container Apps Not Updating

- **Issue**: Azure using cached image
- **Solution**: Use unique tags:

```bash
docker tag backend:latest acrbookapp.azurecr.io/backend:v$(date +%s)
docker push acrbookapp.azurecr.io/backend:v$(date +%s)
```

## 📝 Additional Notes

- **Database Migrations**: Not needed - database is pre-configured with schema and seed data
- **Authentication**: JWT tokens expire after 60 minutes
- **Health Checks**: Available at `/health` endpoint
- **Monitoring**: Application Insights integrated for production monitoring
- **Scaling**: Container Apps auto-scale based on HTTP traffic (1-10 replicas)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `dotnet test` (backend), `npm test` (frontend)
4. Submit a pull request

## 📄 License

This is a take-home challenge project for demonstration purposes.
