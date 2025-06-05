# Blockscout CRUD API

A complete REST API for managing Blockscout servers with Express.js and Prisma ORM. This API implements proper validation ensuring that each project can have only one mainnet and one testnet Blockscout server.

## 🚀 Features

- **Project Management**: Create, read, update, and delete projects
- **Blockscout Server Management**: Full CRUD operations for Blockscout servers
- **Network Type Validation**: Enforces one mainnet and one testnet server per project
- **Soft Delete Support**: Both soft and hard delete options
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database Integration**: PostgreSQL with Prisma ORM
- **Security**: CORS, Helmet, and other security middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd blockscout-crud-api
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file with your database configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/blockscout_db?schema=public"
PORT=3000
NODE_ENV=development
```

4. **Set up the database:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

5. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (soft delete) |
| DELETE | `/api/projects/:id?hard=true` | Permanently delete project |

### Blockscout Servers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blockscout` | Get all Blockscout servers |
| GET | `/api/blockscout/:id` | Get Blockscout server by ID |
| GET | `/api/blockscout/project/:project_id` | Get Blockscout servers by project |
| POST | `/api/blockscout` | Create new Blockscout server |
| PUT | `/api/blockscout/:id` | Update Blockscout server |
| DELETE | `/api/blockscout/:id` | Delete Blockscout server (soft delete) |
| DELETE | `/api/blockscout/:id?hard=true` | Permanently delete Blockscout server |

### RPC Servers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rpc` | Get all RPC servers |
| GET | `/api/rpc/:id` | Get RPC server by ID |
| GET | `/api/rpc/project/:project_id` | Get RPC servers by project |
| POST | `/api/rpc` | Create new RPC server |
| PUT | `/api/rpc/:id` | Update RPC server |
| DELETE | `/api/rpc/:id` | Delete RPC server (soft delete) |
| DELETE | `/api/rpc/:id?hard=true` | Permanently delete RPC server |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

## 📖 API Usage Examples

### Create a Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Blockchain Project",
    "description": "A sample blockchain project"
  }'
```

### Create a Blockscout Server

```bash
curl -X POST http://localhost:3000/api/blockscout \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "network_type": "mainnet",
    "server_url": "https://explorer.mychain.com",
    "ip_address": "192.168.1.100",
    "chain_id": "1",
    "currency": "ETH",
    "description": "Mainnet Blockscout server"
  }'
```

### Create an RPC Server

```bash
curl -X POST http://localhost:3000/api/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "server_url": "https://rpc.mychain.com",
    "ip_address": "192.168.1.101",
    "chain_id": "1",
    "description": "Main RPC server"
  }'
```

### Get All Projects with Servers

```bash
curl http://localhost:3000/api/projects
```

## 🔒 Validation Rules

### Project Validation
- **name**: Required, 1-255 characters, must be unique
- **description**: Optional, max 1000 characters

### Blockscout Server Validation
- **project_id**: Required, must be valid project ID
- **network_type**: Required, must be "mainnet" or "testnet"
- **server_url**: Required, must be valid URL
- **ip_address**: Required, must be valid IP address
- **chain_id**: Optional string
- **currency**: Optional string
- **logo_url**: Optional, must be valid URL if provided
- **rpc_url**: Optional, must be valid URL if provided
- **network_link**: Optional string
- **footer_link**: Optional string
- **is_active**: Optional boolean, defaults to true
- **description**: Optional, max 1000 characters

### RPC Server Validation
- **project_id**: Required, must be valid project ID
- **server_url**: Required, must be valid URL
- **ip_address**: Required, must be valid IP address
- **chain_id**: Optional string
- **is_active**: Optional boolean, defaults to true
- **description**: Optional, max 1000 characters

### Business Rules
- Each project can have **multiple RPC servers** (no restrictions)
- Each project can have only **one mainnet** Blockscout server
- Each project can have only **one testnet** Blockscout server
- Attempting to create duplicate Blockscout network types will result in a 409 Conflict error

## 🏗️ Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── projectController.js
│   ├── blockscoutController.js
│   └── rpcController.js
├── services/            # Business logic
│   ├── projectService.js
│   ├── blockscoutService.js
│   └── rpcService.js
├── routes/              # Route definitions
│   ├── index.js
│   ├── projectRoutes.js
│   ├── blockscoutRoutes.js
│   └── rpcRoutes.js
├── middleware/          # Custom middleware
│   ├── validation.js
│   └── errorHandler.js
├── lib/                 # Utilities
│   └── prisma.js
├── app.js              # Express app configuration
└── server.js           # Server startup
```

## 🗄️ Database Schema

The API uses the provided Prisma schema with:
- **Project**: Main entity for organizing Blockscout servers
- **BlockscoutServer**: Blockchain explorer server configuration
- **RpcServer**: RPC server configuration (included in schema)
- **network_type**: Enum for mainnet/testnet classification

## ⚡ Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 🛡️ Error Handling

The API includes comprehensive error handling:
- **400**: Bad request (validation errors)
- **404**: Resource not found
- **409**: Conflict (duplicate entries, business rule violations)
- **500**: Internal server error

## 🔧 Development

For development, the API includes:
- **Hot reloading** with nodemon
- **Detailed logging** with morgan
- **Database query logging** in development mode
- **Prisma Studio** for database inspection

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please create an issue in the repository or contact the development team.