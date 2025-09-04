import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient, DescribeUserPoolCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DYNAMODB_CONFIG, COGNITO_CONFIG } from '../config';

export async function validateAWSConnectivity(): Promise<void> {
  console.log('🔍 Validating AWS service connectivity...');
  
  try {
    await validateDynamoDBTables();
    await validateCognitoUserPool();
    console.log('✅ AWS connectivity validation passed');
  } catch (error) {
    console.error('❌ AWS connectivity validation failed:', error.message);
    throw error;
  }
}

async function validateDynamoDBTables(): Promise<void> {
  const dynamoClient = new DynamoDBClient({
    region: DYNAMODB_CONFIG.region
  });
  
  console.log('  Checking DynamoDB tables...');
  
  for (const [tableName, tableValue] of Object.entries(DYNAMODB_CONFIG.tables)) {
    try {
      await dynamoClient.send(new DescribeTableCommand({
        TableName: tableValue
      }));
      console.log(`    ✅ ${tableName}: ${tableValue}`);
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`DynamoDB table '${tableValue}' not found. Please run setup scripts.`);
      }
      throw error;
    }
  }
}

async function validateCognitoUserPool(): Promise<void> {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_CONFIG.region
  });
  
  console.log('  Checking Cognito User Pool...');
  
  try {
    await cognitoClient.send(new DescribeUserPoolCommand({
      UserPoolId: COGNITO_CONFIG.userPoolId
    }));
    console.log(`    ✅ User Pool: ${COGNITO_CONFIG.userPoolId}`);
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      throw new Error(`Cognito User Pool '${COGNITO_CONFIG.userPoolId}' not found. Please run setup scripts.`);
    }
    throw error;
  }
}

export function validateEnvironmentVariables(): void {
  console.log('🔍 Validating environment variables...');
  
  const required = [
    'AWS_REGION',
    'COGNITO_USER_POOL_ID',
    'COGNITO_CLIENT_ID'
  ];
  
  const missing = required.filter(key => {
    const value = process.env[key];
    return !value || value.trim() === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment variables validation passed');
}