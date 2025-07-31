import { ConnectionState } from '../types';
import { COGNITO_CONFIG } from '../config';
import { 
  ForgotPasswordCommand,
  CognitoIdentityProviderClient 
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
});

interface ForgotPasswordMessage {
  type: 'forgot_password';
  body: {
    email: string;
  };
}

interface ForgotPasswordResponse {
  type: string;
  body?: any;
}

export default async function handleForgotPassword(state: ConnectionState, data: ForgotPasswordMessage): Promise<ForgotPasswordResponse> {
  const { email } = data.body;

  if (!email) {
    return {
      type: "forgot_password_failure",
      body: "Email is required"
    };
  }

  try {
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email
    });

    await cognitoClient.send(forgotPasswordCommand);

    // Always return success message to prevent email enumeration
    return {
      type: "password_reset_sent",
      body: {
        message: "If an account with this email exists, a password reset link has been sent.",
        email
      }
    };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Don't reveal whether the user exists - always return success message
    return {
      type: "password_reset_sent",
      body: {
        message: "If an account with this email exists, a password reset link has been sent.",
        email
      }
    };
  }
}