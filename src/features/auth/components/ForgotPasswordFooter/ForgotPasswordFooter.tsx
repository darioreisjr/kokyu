// `KokyuLink` (unlike `AuthVisualPanel`'s plain elements) internally
// passes the `next/link` component reference as a prop into MUI's
// `Link` — a Client Component. A Server Component caller can construct
// that element (it has no boundary of its own to force server
// execution), which trips the same "functions can't cross Server →
// Client as a prop" rule `app/providers.tsx` hit for `AdapterDateFns`.
// So this stays a Client Component even though it has no theme-callback
// `sx` of its own, same reason `LoginFooter`/`CreateAccountFooter` do.
'use client';

import Stack from '@mui/material/Stack';

import { KokyuLink } from '@/design-system/components';

import { authText } from '../../constants/authText';

const text = authText.forgotPassword;

export function ForgotPasswordFooter() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'center' }}>
      <KokyuLink href="/login" variant="body2">
        {text.backToLogin}
      </KokyuLink>
    </Stack>
  );
}
