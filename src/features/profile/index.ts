export { ProfilePage } from './components/ProfilePage/ProfilePage';
export { ProfileForm } from './components/ProfileForm/ProfileForm';
export { ProfileSummary } from './components/ProfileSummary/ProfileSummary';
export { ProfileAvatar } from './components/ProfileAvatar/ProfileAvatar';
export { AvatarCropDialog } from './components/AvatarCropDialog/AvatarCropDialog';
export { ProfileIdentityForm } from './components/ProfileIdentityForm/ProfileIdentityForm';
export { ProfilePersonalInfoForm } from './components/ProfilePersonalInfoForm/ProfilePersonalInfoForm';
export { ProfileAccountInfo } from './components/ProfileAccountInfo/ProfileAccountInfo';
export type {
  UserProfile,
  ProfileFormData,
  UpdateProfilePayload,
  ProfileService,
} from './types/profile.types';

// Reused by `features/settings` (Dados → "Exportar meus dados") — same
// cross-feature pattern `features/auth` already exports its schemas
// and services through.
export { profileService } from './services/profileService';
