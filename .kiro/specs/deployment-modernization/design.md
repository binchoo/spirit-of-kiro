# Design Document

## Overview

This design modernizes the game's deployment architecture by eliminating Docker containers and transitioning to native Node.js execution with real AWS services. The current system uses Docker Compose to orchestrate local DynamoDB, ECS credential endpoints, and containerized services. The new architecture will run all services natively using Node.js/npm while connecting directly to AWS DynamoDB and Cognito services.

The modernization focuses on simplifying the development experience by removing container overhead, eliminating local database setup complexity, and providing Windows-friendly batch scripts for AWS resource provisioning.

## Architecture

### Current Architecture (Docker-based)
```
Docker Compose Network (169.254.170.0/24)
├── ECS Local Endpoints (169.254.170.2) - Credential vending
├── DynamoDB Local (169.254.170.3) - Local database
├── Server Container (169.254.170.4) - WebSocket server
├── Client Container (169.254.170.5) - Vue.js frontend
└── Item Images Service (Containerized)
```

### New Architecture (Native)
```
Native Node.js Processes
├── Server Process (Node.js + Bun) → AWS DynamoDB
├── Client Process (Vite dev server) → Server WebSocket
├── Item Images Process (Node.js + Bun) → AWS S3 + Redis
└── AWS Services (DynamoDB, Cognito, S3)
```

## Components and Interfaces

### 1. Server Component Modernization

**Current State:**
- Runs in Docker container with custom networking
- Uses local DynamoDB endpoint (http://dynamodb-local:8000)
- Relies on ECS credential endpoints for AWS authentication
- Configuration through Docker environment variables

**New Design:**
- Native Node.js process using Bun runtime
- Direct AWS DynamoDB connection using AWS SDK
- Standard AWS credential chain (AWS CLI, environment variables, IAM roles)
- Environment-based configuration management

**Configuration Changes:**
```typescript
// New config.ts structure
export const DYNAMODB_CONFIG = {
  // Remove endpoint override - use default AWS DynamoDB
  endpoint: undefined, // Let AWS SDK use default
  region: process.env.AWS_REGION || 'us-west-2',
  tables: {
    items: process.env.DYNAMODB_TABLE_ITEMS || 'Items',
    inventory: process.env.DYNAMODB_TABLE_INVENTORY || 'Inventory',
    location: process.env.DYNAMODB_TABLE_LOCATION || 'Location',
    users: process.env.DYNAMODB_TABLE_USERS || 'Users',
    usernames: process.env.DYNAMODB_TABLE_USERNAMES || 'Usernames',
    persona: process.env.DYNAMODB_TABLE_PERSONA || 'Persona'
  }
};
```

### 2. Client Component Modernization

**Current State:**
- Runs in Docker container with volume mounts
- Uses Docker networking to connect to server
- Vite dev server with hot reload through container

**New Design:**
- Native Vite dev server process
- Direct localhost connection to server
- Standard npm/bun package management
- Native file watching and hot reload

### 3. Item Images Service Modernization

**Current State:**
- Containerized Node.js service
- Environment-specific configuration files
- Docker-based deployment

**New Design:**
- Native Node.js process
- Environment variable configuration
- Direct AWS S3 and Redis connections

### 4. Database Migration Strategy

**Migration from Local DynamoDB to AWS DynamoDB:**

1. **Table Creation:** Use existing CloudFormation template (server/iac/dynamodb.yml) to create real DynamoDB tables
2. **Connection Update:** Remove local endpoint configuration, use AWS SDK defaults
3. **Credential Management:** Leverage AWS credential chain instead of ECS endpoints
4. **Data Migration:** No data migration needed for development (fresh start)

**Table Structure (Unchanged):**
- Items: Single table with hash key `id`
- Inventory: Composite key with `id` (hash) and `itemId` (range)
- Location: Composite key with `itemId` (hash) and `location` (range)
- Users: Single table with hash key `userId`
- Usernames: Single table with hash key `username`
- Persona: Composite key with `userId` (hash) and `detail` (range)

### 5. Windows Batch Script Design

**Cognito Setup Script (setup-cognito.bat):**
```batch
@echo off
setlocal enabledelayedexpansion

REM Check AWS CLI installation
aws --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS CLI not found. Please install AWS CLI first.
    exit /b 1
)

REM Deploy Cognito stack
echo Deploying Cognito User Pool...
aws cloudformation deploy ^
    --template-file server\iac\cognito.yml ^
    --stack-name %1-cognito ^
    --capabilities CAPABILITY_IAM ^
    --region us-west-2

REM Extract Cognito outputs
echo Extracting Cognito configuration...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %1-cognito --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text --region us-west-2') do set COGNITO_USER_POOL_ID=%%i
for /f "tokens=*" %%j in ('aws cloudformation describe-stacks --stack-name %1-cognito --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text --region us-west-2') do set COGNITO_CLIENT_ID=%%j
for /f "tokens=*" %%k in ('aws cloudformation describe-stacks --stack-name %1-cognito --query "Stacks[0].Outputs[?OutputKey=='UserPoolArn'].OutputValue" --output text --region us-west-2') do set COGNITO_USER_POOL_ARN=%%k

REM Append Cognito config to .env file
echo COGNITO_USER_POOL_ID=!COGNITO_USER_POOL_ID! >> dev.env
echo COGNITO_CLIENT_ID=!COGNITO_CLIENT_ID! >> dev.env
echo COGNITO_USER_POOL_ARN=!COGNITO_USER_POOL_ARN! >> dev.env

echo Cognito setup complete!
echo User Pool ID: !COGNITO_USER_POOL_ID!
echo Client ID: !COGNITO_CLIENT_ID!
```

**DynamoDB Setup Script (setup-dynamodb.bat):**
```batch
@echo off
echo Deploying DynamoDB tables...
aws cloudformation deploy ^
    --template-file server\iac\dynamodb.yml ^
    --stack-name %1-dynamodb ^
    --region us-west-2

echo DynamoDB tables created successfully!
```

## Data Models

### Environment Configuration Model

**Development Environment (.env):**
```
AWS_REGION=us-west-2
COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-west-2:xxxx:userpool/us-west-2_xxxxxxxxx
DYNAMODB_TABLE_ITEMS=Items
DYNAMODB_TABLE_INVENTORY=Inventory
DYNAMODB_TABLE_LOCATION=Location
DYNAMODB_TABLE_USERS=Users
DYNAMODB_TABLE_USERNAMES=Usernames
DYNAMODB_TABLE_PERSONA=Persona
```

**Production Environment:**
```
AWS_REGION=us-west-2
COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
COGNITO_USER_POOL_ARN=${COGNITO_USER_POOL_ARN}
DYNAMODB_TABLE_ITEMS=Items-prod
DYNAMODB_TABLE_INVENTORY=Inventory-prod
DYNAMODB_TABLE_LOCATION=Location-prod
DYNAMODB_TABLE_USERS=Users-prod
DYNAMODB_TABLE_USERNAMES=Usernames-prod
DYNAMODB_TABLE_PERSONA=Persona-prod
```

### Package.json Scripts Model

**Root package.json:**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:images\"",
    "dev:server": "cd server && bun run dev",
    "dev:client": "cd client && npm run dev",
    "dev:images": "cd item-images && bun run dev",
    "setup:cognito": "scripts\\setup-cognito.bat game",
    "setup:dynamodb": "scripts\\setup-dynamodb.bat game",
    "setup:all": "npm run setup:dynamodb && npm run setup:cognito"
  }
}
```

## Error Handling

### AWS Connection Errors

**DynamoDB Connection Issues:**
- Implement retry logic with exponential backoff
- Provide clear error messages for credential issues
- Fallback to local development mode if AWS unavailable
- Validate table existence on startup

**Cognito Authentication Errors:**
- Handle invalid user pool configuration
- Provide meaningful error messages for authentication failures
- Implement token refresh logic
- Graceful degradation for authentication service outages

### Configuration Validation

**Environment Variable Validation:**
```typescript
function validateConfig() {
  const required = [
    'AWS_REGION',
    'COGNITO_USER_POOL_ID',
    'COGNITO_CLIENT_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

**AWS Service Availability:**
- Check DynamoDB table accessibility on startup
- Verify Cognito User Pool configuration
- Validate AWS credentials before service initialization

## Testing Strategy

### Unit Testing
- Test configuration loading and validation
- Mock AWS SDK calls for isolated testing
- Test error handling scenarios
- Validate environment variable parsing

### Integration Testing
- Test real AWS service connections
- Validate DynamoDB operations with test tables
- Test Cognito authentication flows
- End-to-end WebSocket communication testing

### Development Testing
- Local testing with real AWS services
- Automated setup script validation
- Cross-platform compatibility testing (Windows focus)
- Performance comparison with Docker-based setup

### Testing Environment Setup
```json
{
  "scripts": {
    "test": "bun test",
    "test:integration": "bun test --grep integration",
    "test:aws": "AWS_PROFILE=test bun test --grep aws"
  }
}
```

## Migration Strategy

### Phase 1: Infrastructure Preparation
1. Create Windows batch scripts for AWS resource setup
2. Deploy DynamoDB tables using existing CloudFormation templates
3. Deploy Cognito User Pool using existing templates
4. Validate AWS resource accessibility

### Phase 2: Configuration Updates
1. Update server configuration to remove Docker-specific settings
2. Modify client configuration for direct server connection
3. Update item-images service configuration
4. Create environment-specific configuration files

### Phase 3: Service Modernization
1. Update server startup to use native Node.js
2. Modify client to use native Vite dev server
3. Update item-images service to run natively
4. Remove Docker Compose dependencies

### Phase 4: Validation and Documentation
1. Test complete application flow
2. Validate Windows batch script functionality
3. Update documentation and setup instructions
4. Performance testing and optimization

## Security Considerations

### AWS Credentials Management
- Use AWS credential chain (CLI, environment, IAM roles)
- Avoid hardcoding credentials in configuration files
- Implement least-privilege IAM policies
- Support multiple AWS profiles for different environments

### Environment Variable Security
- Use .env files for local development
- Implement environment variable validation
- Secure storage of production credentials
- Clear separation between development and production configs

### Network Security
- Remove custom Docker networking
- Use standard localhost connections for development
- Implement proper CORS configuration
- Secure WebSocket connections