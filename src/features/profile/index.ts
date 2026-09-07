export { ProfilePage } from './components/ProfilePage/ProfilePage';
export { ProfileForm } from './components/ProfileForm/ProfileForm';
export { ProfileSummary } from './components/ProfileSummary/ProfileSummary';
export { ProfileAvatar } from './components/ProfileAvatar/ProfileAvatar';
export { AvatarCropDialog } from './components/AvatarCropDialog/AvatarCropDialog';
export { ProfileIdentityForm } from './components/ProfileIdentityForm/ProfileIdentityForm';
export { ProfilePersonalInfoForm } from './components/ProfilePersonalInfoForm/ProfilePersonalInfoForm';
export { ProfileAccountInfo } from './components/ProfileAccountInfo/ProfileAccountInfo';
export type { UserProfile, ProfileFormData, ProfileService } from './types/profile.types';

// Reused by `features/settings` (Dados → "Exportar meus dados") — same
// cross-feature pattern `features/auth` already exports its schemas
// and services through.
export { profileService, mapCurrentUserToProfile, mapFormDataToPayload } from './services/profileService';

// Reused by `features/onboarding` — same avatar staging/crop/upload
// flow (`useAvatarEditor` + `ProfileAvatar`/`AvatarCropDialog` above +
// `uploadAvatar`/`removeAvatarUpload`) applies verbatim to the optional
// avatar step during onboarding, so it's exposed here rather than
// forked. Same cross-feature pattern this barrel already establishes
// (`features/settings` → `profileService`), just consumed the other
// direction.
export { useAvatarEditor, type UseAvatarEditorResult } from './hooks/useAvatarEditor';
export { useHasMounted } from './hooks/useHasMounted';
export { uploadAvatar, removeAvatarUpload } from './services/avatarUploadService';
export { countries, DEFAULT_COUNTRY_CODE, type Country } from './constants/countries';
export { profileConfig } from './constants/profileConfig';
