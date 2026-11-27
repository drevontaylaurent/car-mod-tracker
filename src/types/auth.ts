export interface AuthFormState {
  success: boolean;
  error?: string;
  message?: string;
}

export interface PasswordRecoveryFormState extends AuthFormState {
  recoverySessionInvalid?: boolean;
  signOutFailed?: boolean;
}
