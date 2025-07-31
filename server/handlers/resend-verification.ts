import { ResendVerificationMessage, ConnectionState } from '../types';
import { COGNITO_CONFIG } from '../config';
import { 
  ResendConfirmationCodeCommand,
  CognitoIdentityProviderClient 
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
});

interface ResendVerificationResponse {
  type: string;
  body?: any;
}

export default async function handleResendVerification(state: ConnectionState, data: ResendVerificationMessage): Promise<ResendVerificationResponse> {
  const { email } = data.body;

  if (!email) {
    return {
      type: "resend_verification_failure",
      body: "Email is required"
    };
  }

  try {
    const resendConfirmationCommand = new ResendConfirmationCodeCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email
    });

    await cognitoClient.send(resendConfirmationCommand);

    return {
      type: "verification_resent",
      body: {
        message: "A new verification email has been sent. Please check your inbox and follow the instructions.",
        email
      }
    };
  } catch (error: any) {
    console.error('Resend verification error:', error);
    
    let errorMessage = "Failed to resend verification email. Please try again.";
    
    // Map specific Cognito errors to user-friendly messages
    switch (error.name) {
      case 'UserNotFoundException':
        errorMessage = "No account found with this email address.";
        break;
      case 'InvalidParameterException':
        errorMessage = "Invalid email address.";
        break;
      case 'LimitExceededException':
        errorMessage = "Too many requests. Please wait before requesting another verification email.";
        break;
      case 'UserAlreadyConfirmedException':
        errorMessage = "This account is already verified. You can sign in normally.";
        break;
    }
    
    return {
      type: "resend_verification_failure",
      body: errorMessage
    };
  }
}