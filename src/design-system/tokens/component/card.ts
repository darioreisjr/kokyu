import { borderRadius } from '../primitives/borders';
import { semanticShadow } from '../primitives/shadows';
import { spacing } from '../primitives/spacing';

export const cardTokens = {
  radius: borderRadius.xl,
  padding: spacing[8],
  shadow: semanticShadow.card,
} as const;
