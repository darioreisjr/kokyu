export {
  CurrentUserProvider,
  useCurrentUser,
  type CurrentUserContextValue,
  type CurrentUserProviderProps,
} from './providers/CurrentUserProvider';

// Re-exported so consumers never need to reach into `@/lib/api/types`
// directly just to type a `currentUser`/`profile` value — one import
// path for both the provider and its data shape.
export type {
  AuthProviderId,
  CurrentUser,
  CurrentUserAccess,
  Profile,
  ProfileCompletePayload,
  ProfileCompletion,
  ProfileUpdatePayload,
} from '@/lib/api/types';
