import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { KokyuAvatar } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { HomeDayMoment } from '../../services/homeDayService';

export interface RespirationHeaderProps {
  dateLabel: string;
  dayMoment: HomeDayMoment;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  showGreeting?: boolean;
}

const GREETING_BY_MOMENT: Record<HomeDayMoment, string> = {
  morning: 'Boa manhã',
  afternoon: 'Boa tarde',
  evening: 'Boa noite',
  night: 'Boa noite',
};

/**
 * Temporal greeting + date + Kokyu's discreet microcopy — never an
 * artificial motivational phrase (see spec's "MICROCOPY KOKYU"). The
 * name is a nice-to-have when the Profile is already loaded, never a
 * blocking dependency for the header to render.
 */
export function RespirationHeader({
  dateLabel,
  dayMoment,
  firstName,
  lastName,
  avatarUrl,
  showGreeting = true,
}: RespirationHeaderProps) {
  if (!showGreeting) return null;

  const greeting = GREETING_BY_MOMENT[dayMoment];
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;
  const initials = firstName ? `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase() : undefined;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 3, md: 4 } }}
    >
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          {/*
            The "breath indicator" — a purely decorative, very subtle nod to the
            product's name, not a biometric reading of the user's own breathing
            (see spec's "BREATH INDICATOR"/"NÃO É SENSOR BIOMÉTRICO"). Reuses the
            same `kokyu-breathe-slow` keyframes the login screen's visual panel
            already defines in `globals.css` — plain CSS `animation`, so it
            collapses under `prefers-reduced-motion` for free, no extra JS check.
          */}
          <Box
            aria-hidden="true"
            sx={(theme) => ({
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: themePalette(theme).kokyu.action.primary,
              animation: 'kokyu-breathe-slow 8s ease-in-out infinite',
            })}
          />
          {/* Not an `h1` — the page's real (visually-hidden) `h1` is "Respiração" itself, rendered once by `RespirationPage`; see spec's "HEADING STRUCTURE". */}
          <Typography variant="displaySmall" component="p">
            {greetingText}
          </Typography>
        </Stack>
        <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
          {dateLabel}
        </Typography>
        <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}>
          Veja onde está seu ritmo agora.
        </Typography>
      </Stack>

      {firstName ? <KokyuAvatar src={avatarUrl} initials={initials} size="md" /> : null}
    </Stack>
  );
}
