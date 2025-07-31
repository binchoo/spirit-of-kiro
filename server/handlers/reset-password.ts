import { ResetPasswordMessage, ConnectionState } from '../types';
import { COGNITO_CONFIG } from '../config';
import { 
  ConfirmForgotPasswordCommand,
  CognitoIdentityProviderClient 
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
});

interface ResetPasswordResponse {
  type: string;
  body?: any;
}

export default async function handleResetPassword(state: ConnectionState, data: ResetPasswordMessage): Promise<ResetPasswordResponse> {
  const { email, confirmationCode, newPassword } = data.body;

  if (!email) {
    return {
      type: "password_reset_failure",
      body: "Email is required"
    };
  }

  if (!confirmationCode) {
    return {
      type: "password_reset_failure",
      body: "Confirmation code is required"
    };
  }

  if (!newPassword) {
    return {
      type: "password_reset_failure",
      body: "New password is required"
    };
  }

  try {
    const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword
    });

    await cognitoClient.send(confirmForgotPasswordCommand);

    return {
      type: "password_reset_success",
      body: {
        message: "Your password has been successfully reset. You can now sign in with your new password.",
        email
      }
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    let errorMessage = "Failed to reset password. Please try again.";
    
    // Map specific Cognito errors to user-friendly messages
    switch (error.name) {
      case 'CodeExpiredException':
        errorMessage = "The reset code has expired. Please request a new password reset.";
        break;
      case 'InvalidParameterException':
        errorMessage = "Invalid reset code or email address.";
        break;
      case 'CodeMismatchException':
        errorMessage = "Invalid reset code. Please check and try again.";
        break;
      case 'InvalidPasswordException':
        errorMessage = "Password does not meet requirements. Please choose a stronger password.";
        break;
      case 'LimitExceededException':
        errorMessage = "Too many attempts. Please try again later.";
        break;
    }
    
    return {
      type: "password_reset_failure",
      body: errorMessage
    };
  }
}