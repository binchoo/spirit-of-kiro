# Spirit of Kiro Game

A modern multiplayer game built with Node.js, Vue.js, and AWS services.

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Bun** (JavaScript runtime and package manager)
   - Install: `npm install -g bun`
   - Verify installation: `bun --version`

3. **AWS CLI** (v2 recommended)
   - Download from: https://aws.amazon.com/cli/
   - Verify installation: `aws --version`

### AWS Configuration

1. **Configure AWS Credentials**
   ```cmd
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, and default region (us-west-2).

2. **Verify AWS Access**
   ```cmd
   aws sts get-caller-identity
   ```

## Quick Setup

### 1. Install Dependencies

```cmd
npm run install:all
```

This will install dependencies for all services (root, server, client, item-images).

### 2. Set Up AWS Resources

Run the setup scripts to create AWS resources:

```cmd
npm run setup:all
```

This will:
- Create DynamoDB tables using CloudFormation
- Create Cognito User Pool using CloudFormation
- Generate `dev.env` file with AWS resource configurations

### 3. Start Development Environment

```cmd
npm run dev
```

This starts all services concurrently:
- Server (WebSocket) on port 8080
- Client (Vue.js) on port 5173
- Item Images service on its configured port

## Manual Setup (Alternative)

If you prefer to run setup steps individually:

### 1. Create DynamoDB Tables

```cmd
npm run setup:dynamodb
```

### 2. Create Cognito User Pool

```cmd
npm run setup:cognito
```

### 3. Verify Configuration

```cmd
cd server && bun run validate-config
```

## Development Commands

### Root Level Commands

- `npm run dev` - Start all services in development mode
- `npm run start` - Start all services in production mode
- `npm run test` - Run tests for all services
- `npm run build` - Build all services
- `npm run install:all` - Install dependencies for all services

### Individual Service Commands

#### Server (WebSocket API)
```cmd
cd server
bun run dev          # Development with file watching
bun run start        # Production mode
bun run test         # Run tests
bun run validate-config  # Validate AWS configuration
```

#### Client (Vue.js Frontend)
```cmd
cd client
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test:unit    # Run unit tests
```

#### Item Images Service
```cmd
cd item-images
bun run dev          # Development with file watching
bun run start        # Production mode
bun run test         # Run tests
```

## Configuration

### Environment Variables

The application uses a `dev.env` file for configuration. This file is automatically created by the setup scripts, but you can also create it manually using the template:

```cmd
copy dev.env.template dev.env
```

### Required Environment Variables

- `AWS_REGION` - AWS region (default: us-west-2)
- `COGNITO_USER_POOL_ID` - Cognito User Pool ID (set by setup script)
- `COGNITO_CLIENT_ID` - Cognito App Client ID (set by setup script)
- `COGNITO_USER_POOL_ARN` - Cognito User Pool ARN (set by setup script)
- `DYNAMODB_TABLE_*` - DynamoDB table names (set by setup script)

### Optional Environment Variables

- `S3_BUCKET_NAME` - S3 bucket for file storage
- `CLOUDFRONT_DOMAIN` - CloudFront distribution domain
- `REDIS_HOST` - Redis server host (default: localhost)
- `ITEM_IMAGES_SERVICE_URL` - Item images service URL

## Troubleshooting

### Common Issues

#### AWS CLI Not Found
```
ERROR: AWS CLI not found. Please install AWS CLI first.
```
**Solution:** Install AWS CLI from https://aws.amazon.com/cli/

#### AWS Credentials Not Configured
```
ERROR: AWS credentials not configured. Please run 'aws configure' first.
```
**Solution:** Run `aws configure` and enter your AWS credentials.

#### DynamoDB Table Not Found
```
DynamoDB table 'Items' not found. Please run setup scripts.
```
**Solution:** Run `npm run setup:dynamodb` to create the required tables.

#### Cognito User Pool Not Found
```
Cognito User Pool 'us-west-2_xxxxxxxxx' not found. Please run setup scripts.
```
**Solution:** Run `npm run setup:cognito` to create the User Pool.

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:** Stop any processes using the port or change the port in the configuration.

### Validation Commands

#### Check AWS Connectivity
```cmd
cd server
bun run validate-config
```

#### Check Service Health
- Server: http://localhost:8080/health (if implemented)
- Client: http://localhost:5173
- Item Images: Check service-specific health endpoint

### Logs and Debugging

#### Server Logs
Server logs are output to the console when running `bun run dev` or `bun run start`.

#### Client Logs
Client logs are available in the browser developer console.

#### AWS CloudFormation Logs
Check AWS CloudFormation console for stack deployment logs:
- Stack names: `game-dynamodb`, `game-cognito`
- Region: us-west-2

## Architecture

### Services

1. **Server** - WebSocket server handling game logic and AWS integrations
2. **Client** - Vue.js frontend providing the game interface
3. **Item Images** - Service for generating and managing item images

### AWS Services

1. **DynamoDB** - Game data storage (items, inventory, users, etc.)
2. **Cognito** - User authentication and management
3. **S3** - File storage (optional)
4. **CloudFront** - CDN for static assets (optional)

### Development vs Production

- **Development**: Uses `dev.env` file and local development servers
- **Production**: Uses environment variables and production builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## License

MIT License