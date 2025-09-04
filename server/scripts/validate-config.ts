import { DYNAMODB_CONFIG, COGNITO_CONFIG } from '../config';

function validateConfig() {
  console.log('🔍 Validating configuration...');
  
  const required = [
    'AWS_REGION',
    'COGNITO_USER_POOL_ID',
    'COGNITO_CLIENT_ID'
  ];
  
  const missing = required.filter(key => !process.env[key] && !COGNITO_CONFIG[key.toLowerCase().replace('_', '')]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please run the setup scripts or configure these variables manually.');
    process.exit(1);
  }
  
  console.log('✅ Configuration validation passed');
  console.log(`AWS Region: ${DYNAMODB_CONFIG.region}`);
  console.log(`Cognito User Pool ID: ${COGNITO_CONFIG.userPoolId}`);
  console.log(`DynamoDB Tables:`);
  Object.entries(DYNAMODB_CONFIG.tables).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

validateConfig();