import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuLogo } from '@/design-system/components';
// This illustration is the one place allowed to reach past the semantic
// layer: it exists specifically to *show* a Kokyu color family, not to
// represent a reusable UI state. See docs/design-system.md.
import {
  fuji,
  hinokami,
  neutral,
  tanjiro,
  type ColorScale,
} from '@/design-system/tokens/primitives/colors';
import { darkColorTokens } from '@/design-system/tokens/semantic/colors';

import { RecoveryOrb } from '../RecoveryOrb/RecoveryOrb';

export type AuthVisualVariant = 'login' | 'createAccount' | 'forgotPassword';

export interface AuthVisualPanelProps {
  /** Selects the color family pairing — differentiates screens without a new layout. */
  variant: AuthVisualVariant;
  eyebrow: string;
  headline: string;
  body: string;
  /** @default '1 1 50%' — create-account passes a slightly larger share. */
  flexBasis?: string;
  /** Forwarded to `RecoveryOrb` for the `forgotPassword` variant only — see its own doc comment. */
  reducedMotion?: boolean;
}

const VARIANT_FAMILIES: Record<AuthVisualVariant, { primary: ColorScale; secondary: ColorScale }> =
  {
    // Energy and progress — the login screen's established identity.
    login: { primary: hinokami, secondary: fuji },
    // Evolution and growth, a touch more positive — first breath of a new account.
    createAccount: { primary: tanjiro, secondary: fuji },
    // Same family as login — recovery stays on the sign-in side of the flow.
    forgotPassword: { primary: hinokami, secondary: fuji },
  };

/**
 * Desktop-only decorative half of the auth screens. Purely
 * presentational, server-rendered, no client state — built from
 * gradients and geometric shapes only, no character artwork.
 *
 * Deliberately locked to the dark token set regardless of the active
 * color scheme: this is Kokyu's fixed brand panel, not themable UI —
 * which also means it never needs a theme-callback `sx`, so it can
 * stay a plain Server Component.
 */
export function AuthVisualPanel({
  variant,
  eyebrow,
  headline,
  body,
  flexBasis = '1 1 50%',
  reducedMotion,
}: AuthVisualPanelProps) {
  const { primary, secondary } = VARIANT_FAMILIES[variant];

  return (
    <Box
      component="aside"
      aria-hidden="true"
      sx={{
        position: 'relative',
        display: { xs: 'none', md: 'flex' },
        flex: flexBasis,
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        width: '100%',
        minHeight: '100%',
        padding: 8,
        backgroundColor: darkColorTokens.background.default,
        backgroundImage: `radial-gradient(circle at 15% 20%, ${primary[900]} 0%, transparent 45%),
          radial-gradient(circle at 85% 80%, ${secondary[950]} 0%, transparent 50%)`,
      }}
    >
      {variant === 'forgotPassword' ? (
        <RecoveryOrb color={primary} reducedMotion={reducedMotion} />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            insetInlineEnd: '-10%',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, ${primary[500]} 55%, transparent) 0%, transparent 70%)`,
            filter: 'blur(2px)',
            animation: 'kokyu-breathe 7s ease-in-out infinite',
          }}
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          insetInlineStart: '-8%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, color-mix(in srgb, ${secondary[500]} 50%, transparent) 0%, transparent 70%)`,
          animation: 'kokyu-breathe-slow 9s ease-in-out infinite',
        }}
      />
      <Box
        component="svg"
        viewBox="0 0 200 200"
        aria-hidden="true"
        sx={{
          position: 'absolute',
          insetInlineEnd: '6%',
          bottom: '10%',
          width: 220,
          height: 220,
          opacity: 0.18,
        }}
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke={primary[300]} strokeWidth="1" />
        <circle cx="100" cy="100" r="65" fill="none" stroke={primary[300]} strokeWidth="1" />
        <circle cx="100" cy="100" r="40" fill="none" stroke={primary[300]} strokeWidth="1" />
      </Box>

      <KokyuLogo size="lg" />

      <Stack spacing={2} sx={{ position: 'relative', maxWidth: 440 }}>
        <Typography
          variant="labelMedium"
          sx={{
            color: primary[300],
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="displaySmall" component="p" sx={{ color: neutral[0] }}>
          {headline}
        </Typography>
        <Typography variant="body1" sx={{ color: darkColorTokens.text.secondary }}>
          {body}
        </Typography>
      </Stack>
    </Box>
  );
}
