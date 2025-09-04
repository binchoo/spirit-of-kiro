import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Try to load environment variables from dev.env file
let envConfig = {};
try {
  const envFile = readFileSync(join(process.cwd(), 'dev.env'), 'utf8');
  
  // Parse the .env file content
  envConfig = envFile.split('\n').reduce((acc, line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if they exist
      value = value.replace(/^['"]|['"]$/g, '').trim();
      acc[key] = value;
      console.log(key + "=" + value);
    }
    return acc;
  }, {});

  for (const [key, value] of Object.entries(envConfig)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  
  console.log('Successfully loaded environment variables from dev.env');
} catch (error) {
  console.log('Could not load environment variables from dev.env, using process.env only');
  console.log(`Error details: ${error.message}`);
}

// Merge loaded config with process.env, with process.env taking precedence
const getEnv = (key) => {
  return process.env[key] || envConfig[key];
};

export const DYNAMODB_CONFIG = {
  // Use AWS SDK defaults for DynamoDB endpoint (no local endpoint)
  endpoint: undefined,
  region: getEnv('AWS_REGION') || 'us-west-2',
  tables: {
    items: getEnv('DYNAMODB_TABLE_ITEMS') || 'Items',
    inventory: getEnv('DYNAMODB_TABLE_INVENTORY') || 'Inventory',
    location: getEnv('DYNAMODB_TABLE_LOCATION') || 'Location',
    users: getEnv('DYNAMODB_TABLE_USERS') || 'Users',
    usernames: getEnv('DYNAMODB_TABLE_USERNAMES') || 'Usernames',
    persona: getEnv('DYNAMODB_TABLE_PERSONA') || 'Persona'
  }
};

export const S3_CONFIG = {
  bucketName: getEnv('S3_BUCKET_NAME'),
};

export const CLOUDFRONT_CONFIG = {
  domain: getEnv('CLOUDFRONT_DOMAIN'),
};

export const REDIS_CONFIG = {
  host: getEnv('REDIS_HOST') || 'localhost',
  port: 6379
};

export const ITEM_IMAGES_SERVICE_CONFIG = {
  url: getEnv('ITEM_IMAGES_SERVICE_URL') || 'https://item-images.nathanpeck.gg',
};

export const COGNITO_CONFIG = {
  userPoolId: getEnv('COGNITO_USER_POOL_ID') || '',
  clientId: getEnv('COGNITO_CLIENT_ID') || '',
  region: getEnv('AWS_REGION') || 'us-west-2'
};