import type { ReactNode } from 'react';

import { AuthenticatedShell } from '@/features/navigation';

/** Shared by every route under `/app` — the authenticated shell (sidebar/drawer + content area). */
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
