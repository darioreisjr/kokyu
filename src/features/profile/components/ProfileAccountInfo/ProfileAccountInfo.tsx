'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuTextField } from '@/design-system/components';

export interface ProfileAccountInfoProps {
  email: string;
}

/**
 * Account-level, read-only info. Email editing needs its own security
 * flow (re-verification) and belongs to a future Configurações/
 * Segurança da conta screen — not this page. No email-verification
 * badge either: nothing in the auth mock tracks that today, and
 * inventing a status here would just be a fake signal.
 */
export function ProfileAccountInfo({ email }: ProfileAccountInfoProps) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" component="h2">
        Conta
      </Typography>
      <KokyuTextField
        label="E-mail"
        value={email}
        disabled
        helperText="E-mail da conta"
        slotProps={{ input: { readOnly: true } }}
      />
    </Stack>
  );
}
