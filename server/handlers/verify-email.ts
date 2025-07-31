import { VerifyEmailMessage, ConnectionState } from '../types';
import { COGNITO_CONFIG } from '../config';
import { 
  ConfirmSignUpCommand,
  CognitoIdentityProviderClient 
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
});

interface VerifyEmailResponse {
  type: string;
  body?: any;
}

export default async function handleVerifyEmail(state: ConnectionState, data: VerifyEmailMessage): Promise<VerifyEmailResponse> {
  const { email, confirmationCode } = data.body;

  if (!email) {
    return {
      type: "email_verification_failure",
      body: "Email is required"
    };
  }

  if (!confirmationCode) {
    return {
      type: "email_verification_failure",
      body: "Confirmation code is required"
    };
  }

  try {
    const confirmSignUpCommand = new ConfirmSignUpCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
      ConfirmationCode: confirmationCode
    });

    await cognitoClient.send(confirmSignUpCommand);

    return {
      type: "email_verified",
      body: {
        message: "Your email has been successfully verified! You can now sign in to your account.",
        email
      }
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    let errorMessage = "Failed to verify email. Please try again.";
    
    // Map specific Cognito errors to user-friendly messages
    switch (error.name) {
      case 'CodeExpiredException':
        errorMessage = "The verification code has expired. Please request a new verification email.";
        break;
      case 'InvalidParameterException':
        errorMessage = "Invalid verification code or email address.";
        break;
      case 'CodeMismatchException':
        errorMessage = "Invalid verification code. Please check and try again.";
        break;
      case 'UserNotFoundException':
        errorMessage = "No account found with this email address.";
        break;
      case 'LimitExceededException':
        errorMessage = "Too many attempts. Please try again later.";
        break;
      case 'UserAlreadyConfirmedException':
        errorMessage = "This account is already verified. You can sign in normally.";
        break;
    }
    
    return {
      type: "email_verification_failure",
      body: errorMessage
    };
  }
}