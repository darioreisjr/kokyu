// Theme-callback `sx` can't cross a Server → Client boundary as a
// prop, so this needs to be a Client Component even without state —
// it's what lets the auth pages stay Server Components (and keep
// exporting `metadata`, which client pages can't do).
'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { KokyuLogo } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface AuthFormPanelProps {
  children: ReactNode;
  /** @default '1 1 50%' — create-account passes a slightly smaller share. */
  flexBasis?: string;
}

export function AuthFormPanel({ children, flexBasis = '1 1 50%' }: AuthFormPanelProps) {
  return (
    <Box
      sx={(theme) => ({
        flex: flexBasis,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 4, md: 0 },
        padding: { xs: 3, sm: 6, md: 8 },
        backgroundColor: themePalette(theme).kokyu.background.default,
      })}
    >
      {/* The visual panel already carries the logo at md+; below that
          breakpoint it's hidden, so the mark needs to live here instead. */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <KokyuLogo />
      </Box>
      {children}
    </Box>
  );
}
