import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  visual: ReactNode;
  form: ReactNode;
  /**
   * Mirrors the split for create-account — `[visual][form]` becomes
   * `[form][visual]` — using `flexDirection: row-reverse` rather than
   * swapping JSX order, so the DOM/component structure (and the
   * shared `AuthVisualPanel`/`AuthFormPanel` themselves) stay
   * identical between the two screens; only the CSS direction differs.
   */
  reversed?: boolean;
}

/**
 * Server Component. The split container both `/login` and
 * `/create-account` compose — nothing about backgrounds, gradients,
 * containers, grid or spacing is duplicated between them.
 */
export function AuthLayout({ visual, form, reversed = false }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: reversed ? 'row-reverse' : 'row' },
        minHeight: '100dvh',
      }}
    >
      {visual}
      {form}
    </Box>
  );
}
