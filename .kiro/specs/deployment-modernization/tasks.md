# Implementation Plan

- [x] 1. Create Windows batch scripts for AWS resource setup
  - Create setup-cognito.bat script that deploys Cognito User Pool using existing CloudFormation template
  - Create setup-dynamodb.bat script that deploys DynamoDB tables using existing CloudFormation template
  - Add error handling and validation for AWS CLI availability and stack deployment success
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Update server configuration for native AWS DynamoDB connection
  - Modify server/config.ts to remove local DynamoDB endpoint configuration
  - Update DYNAMODB_CONFIG to use AWS SDK defaults instead of localhost endpoint
  - Remove Docker-specific environment variable loading from /shared/.env
  - Add AWS region configuration and credential chain support
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create root-level package.json with native execution scripts
  - Create package.json in project root with scripts for running all services natively
  - Add concurrently dependency for running multiple services simultaneously
  - Create dev scripts that run server, client, and item-images services without Docker
  - Add setup scripts that call the Windows batch files for AWS resource creation
  - _Requirements: 1.1, 1.2, 1.3, 4.4_

- [x] 4. Update server package.json for native development
  - Add dev script to server/package.json that runs server with file watching
  - Remove Docker-specific configurations and dependencies
  - Update start script to use native Node.js execution
  - Add environment variable validation on startup
  - _Requirements: 1.1, 1.2, 1.3, 4.1_

- [x] 5. Update item-images service configuration for native execution
  - Modify item-images/config.ts to remove Docker-specific environment file loading
  - Update configuration to use standard environment variables instead of .env files
  - Remove container-specific networking configurations
  - Add AWS SDK configuration for native S3 and Redis connections
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.3_

- [x] 6. Create environment configuration template and validation
  - Create dev.env.template file with all required environment variables
  - Add configuration validation function that checks for required AWS settings
  - Update server startup to validate AWS connectivity before starting WebSocket server
  - Create environment-specific configuration loading that works without Docker
  - _Requirements: 6.1, 6.2, 6.4, 6.5, 4.3_

- [x] 7. Update client configuration for direct server connection
  - Modify client Vite configuration to connect directly to localhost server
  - Remove Docker networking dependencies from client code
  - Update WebSocket connection URL to use standard localhost addressing
  - Ensure hot reload and development features work with native Vite server
  - _Requirements: 1.1, 1.2, 1.3, 4.4_

- [x] 8. Remove Docker dependencies and files
  - Delete docker-compose.yml file
  - Remove Dockerfile from server, client, and item-images directories
  - Delete Docker-specific scripts and configurations
  - Update .gitignore to remove Docker-related entries
  - _Requirements: 1.4, 4.1, 4.2_

- [x] 9. Create comprehensive setup documentation
  - Write setup instructions for Windows developers using the new batch scripts
  - Document prerequisites (Node.js, npm/bun, AWS CLI)
  - Create troubleshooting guide for common AWS connection issues
  - Document environment variable configuration and validation
  - _Requirements: 4.2, 4.3, 4.5, 3.5_

- [x] 10. Add AWS service connectivity validation
  - Implement DynamoDB table existence validation on server startup
  - Add Cognito User Pool connectivity check during authentication initialization
  - Create health check endpoints that verify AWS service connections
  - Add retry logic with exponential backoff for AWS service calls
  - _Requirements: 2.4, 2.5, 6.5_

- [x] 11. Update launch.ts for native multi-service orchestration
  - Modify launch.ts to start all services natively without Docker Compose
  - Add process management for server, client, and item-images services
  - Implement graceful shutdown handling for all native processes
  - Add logging and monitoring for native service execution
  - _Requirements: 1.1, 1.2, 1.3, 4.4_
