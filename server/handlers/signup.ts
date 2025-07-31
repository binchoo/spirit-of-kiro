import { SignupMessage, ConnectionState } from '../types';
import { COGNITO_CONFIG } from '../config';
import { 
  SignUpCommand,
  CognitoIdentityProviderClient 
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
});

interface SignupResponse {
  type: string;
  body?: any;
}

export default async function handleSignup(state: ConnectionState, data: SignupMessage): Promise<SignupResponse> {
  const { username, password } = data.body;

  if (!username) {
    return {
      type: "signup_failure",
      body: "`username` is required"
    };
  }

  if (!password) {
    return {
      type: "signup_failure",
      body: "`password` is required"
    };
  }

  try {
    // Sign up the user without auto-confirmation
    const signUpCommand = new SignUpCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: username
        },
        {
          Name: 'preferred_username',
          Value: username
        }
      ]
    });

    const signUpResult = await cognitoClient.send(signUpCommand);

    // Return pending verification status instead of auto-confirming
    return {
      type: "signup_pending_verification",
      body: { 
        username,
        userId: signUpResult.UserSub,
        message: "Please check your email for a verification link to complete your account setup."
      }
    };
  } catch (error: any) {
    return {
      type: "signup_failure",
      body: error.message
    };
  }
}
