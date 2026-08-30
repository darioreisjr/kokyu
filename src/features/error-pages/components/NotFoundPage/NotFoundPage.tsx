import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { container } from '@/design-system/tokens/primitives/containers';

import { notFoundText } from '../../constants/notFoundText';
import { NotFoundAnimation } from '../NotFoundAnimation/NotFoundAnimation';

export interface NotFoundPageProps {
  /** Forwarded to `NotFoundAnimation` — see its own doc comment. */
  reducedMotion?: boolean;
}

/**
 * Server Component — pure composition. The page background already
 * comes from `CssBaseline` (theme `background.default`), so this
 * needs no theme-aware `sx` of its own and can stay off the client
 * bundle; only `NotFoundAnimation` below it needs `'use client'`.
 */
export function NotFoundPage({ reducedMotion }: NotFoundPageProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 3, sm: 6 },
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{ maxWidth: container.sm, display: 'flex', justifyContent: 'center' }}
      >
        <NotFoundAnimation
          code={notFoundText.code}
          title={notFoundText.title}
          description={notFoundText.description}
          hint={notFoundText.hint}
          ctaLabel={notFoundText.cta}
          ctaHref="/"
          reducedMotion={reducedMotion}
        />
      </Container>
    </Box>
  );
}
