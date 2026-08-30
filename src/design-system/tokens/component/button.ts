import { borderRadius } from '../primitives/borders';
import { fontWeight } from '../primitives/typography';

export const buttonTokens = {
  height: {
    sm: '36px',
    md: '48px',
    lg: '56px',
  },
  paddingX: {
    sm: '16px',
    md: '24px',
    lg: '32px',
  },
  radius: borderRadius.lg,
  fontWeight: fontWeight.semibold,
} as const;
