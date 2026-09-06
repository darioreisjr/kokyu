export { AuthLayout } from './components/AuthLayout/AuthLayout';
export { AuthVisualPanel } from './components/AuthVisualPanel/AuthVisualPanel';
export { AuthFormPanel } from './components/AuthFormPanel/AuthFormPanel';
export { AuthTransition } from './components/AuthTransition/AuthTransition';
export { LoginForm } from './components/LoginForm/LoginForm';
export { LoginFooter } from './components/LoginFooter/LoginFooter';
export { CreateAccountForm } from './components/CreateAccountForm/CreateAccountForm';
export { CreateAccountFooter } from './components/CreateAccountFooter/CreateAccountFooter';
export { ForgotPasswordForm } from './components/ForgotPasswordForm/ForgotPasswordForm';
export { ForgotPasswordFooter } from './components/ForgotPasswordFooter/ForgotPasswordFooter';
export { ResetPasswordForm } from './components/ResetPasswordForm/ResetPasswordForm';
export { PasswordRecoverySuccess } from './components/PasswordRecoverySuccess/PasswordRecoverySuccess';
export { authText } from './constants/authText';
export { authService } from './services/authService';
export type { AuthService } from './types/auth.types';

// Shared validation/services deliberately reused by other features
// (e.g. `features/profile`) instead of being duplicated — see each
// source file's own doc comment for why.
export { authConfig } from './constants/authConfig';
export { nameSchema } from './schemas/nameSchema';
export { usernameSchema } from './schemas/usernameSchema';
export { birthDateSchema } from './schemas/birthDateSchema';
export { calculateAge } from './utils/calculateAge';
export { isUsernameFormatValid, USERNAME_PATTERN } from './utils/username';
export { useUsernameAvailability } from './hooks/useUsernameAvailability';
export { createAccountService } from './services/createAccountService';
export type { UsernameAvailability } from './types/createAccount.types';
export { PasswordRequirements } from './components/PasswordRequirements/PasswordRequirements';
export { PasswordStrength } from './components/PasswordStrength/PasswordStrength';
export { meetsAllPasswordRequirements } from './utils/passwordRequirements';
