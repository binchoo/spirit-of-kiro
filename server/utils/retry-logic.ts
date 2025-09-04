/**
 * Retry logic with exponential backoff for AWS service calls
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      console.log(`Error: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // AWS SDK error codes that are typically retryable
  const retryableErrorCodes = [
    'ThrottlingException',
    'ProvisionedThroughputExceededException',
    'ServiceUnavailable',
    'InternalServerError',
    'RequestTimeout',
    'NetworkingError'
  ];
  
  return retryableErrorCodes.includes(error.name) || 
         retryableErrorCodes.includes(error.code) ||
         error.retryable === true;
}