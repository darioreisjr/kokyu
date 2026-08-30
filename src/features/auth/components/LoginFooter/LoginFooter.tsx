// Same reason as `LoginFormPanel`: a theme-callback `sx` can't be
// constructed in the Server Component that renders this and then
// handed down as a prop — it has to be built on the client.
'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuLink } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { authText } from '../../constants/authText';

const text = authText.login;

export function LoginFooter() {
  return (
    <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {text.noAccount}
      </Typography>
      <KokyuLink href="/create-account" variant="body2">
        {text.createAccount}
      </KokyuLink>
    </Stack>
  );
}
