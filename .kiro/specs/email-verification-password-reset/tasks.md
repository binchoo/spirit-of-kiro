# Implementation Plan

- [ ] 1. Update server authentication handlers
  - Modify signup.ts to remove auto-confirmation and return pending verification
  - Update signin.ts to handle unverified users
  - Create forgot-password.ts, reset-password.ts, resend-verification.ts, verify-email.ts handlers
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [ ] 2. Update existing Vue authentication components
  - Modify SignUpView to show verification pending state and resend option
  - Update SignInView to add forgot password link and handle unverified users
  - _Requirements: 1.1, 1.2, 1.5, 2.1, 3.1, 5.1_

- [ ] 3. Create new Vue authentication views
  - Build ForgotPasswordView, ResetPasswordView, and EmailVerificationView components
  - Add routes to Vue Router for new views
  - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 3.2, 5.2, 5.3_

- [ ] 4. Update game store and WebSocket handling
  - Add new message type handlers and authentication state management
  - _Requirements: 1.2, 1.4, 2.4, 3.4_