import type { ReactNode } from 'react';

import { AuthTransition } from '@/features/auth';

/**
 * Shared by `/login` and `/create-account`. Server Component — its
 * only job is handing `children` to `AuthTransition`, the one Client
 * Component that owns the crossfade between the two screens.
 */
export default function AuthRouteGroupLayout({ children }: { children: ReactNode }) {
  return <AuthTransition>{children}</AuthTransition>;
}
