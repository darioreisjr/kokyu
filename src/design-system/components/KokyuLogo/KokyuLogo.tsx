import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// The mark's gradient is a brand illustration, not a themable UI
// state, so — like `LoginVisualPanel` — it reaches past the semantic
// layer straight to the primitive Hinokami/Fuji tones it represents.
import { fuji, hinokami } from '../../tokens/primitives/colors';

export interface KokyuLogoProps {
  /** Visual size of the mark. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Renders the mark alone, without the "KOKYU" wordmark. */
  markOnly?: boolean;
  className?: string;
}

const DIMENSIONS: Record<NonNullable<KokyuLogoProps['size']>, { mark: number; text: string }> = {
  sm: { mark: 24, text: '1.125rem' },
  md: { mark: 32, text: '1.5rem' },
  lg: { mark: 44, text: '2rem' },
};

/**
 * Original abstract mark: a breathing circle with a single flowing
 * gap, evoking Kokyu's namesake — breath and continuous motion.
 * No official Demon Slayer imagery is referenced or reproduced.
 */
export function KokyuLogo({ size = 'md', markOnly = false, className }: KokyuLogoProps) {
  const { mark, text } = DIMENSIONS[size];

  return (
    <Stack direction="row" spacing={1.5} className={className} sx={{ alignItems: 'center' }}>
      <Box
        component="svg"
        viewBox="0 0 40 40"
        width={mark}
        height={mark}
        aria-hidden="true"
        sx={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id="kokyu-logo-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor={hinokami[400]} />
            <stop offset="100%" stopColor={fuji[500]} />
          </linearGradient>
        </defs>
        <path
          d="M20 3
             a17 17 0 1 1 -12.02 5.01"
          fill="none"
          stroke="url(#kokyu-logo-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="5" fill="url(#kokyu-logo-gradient)" />
      </Box>
      {!markOnly && (
        <Typography
          component="span"
          sx={{
            fontFamily: 'var(--font-kokyu-display)',
            fontWeight: 800,
            fontSize: text,
            letterSpacing: '0.06em',
            lineHeight: 1,
          }}
        >
          KOKYU
        </Typography>
      )}
    </Stack>
  );
}
