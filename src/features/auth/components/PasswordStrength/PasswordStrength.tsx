'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { borderRadius } from '@/design-system/tokens/primitives/borders';
import { duration, easing } from '@/design-system/tokens/primitives/motion';

import { authText } from '../../constants/authText';
import {
  getPasswordStrength,
  type PasswordStrength as PasswordStrengthLevel,
} from '../../utils/passwordStrength';

export interface PasswordStrengthProps {
  password: string;
}

const LEVELS: PasswordStrengthLevel[] = ['weak', 'medium', 'strong'];

function strengthColor(theme: Theme, strength: PasswordStrengthLevel) {
  const palette = themePalette(theme).kokyu.feedback;
  return { weak: palette.error, medium: palette.warning, strong: palette.success }[strength];
}

/**
 * A simple, honest strength meter — three segments plus a label. It
 * never claims a "strong" password is safe; it only summarizes how
 * much of `PasswordRequirements` is satisfied. Renders nothing until
 * the user has typed something (an empty field isn't "weak", it's unset).
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const activeIndex = LEVELS.indexOf(strength);

  return (
    <Stack spacing={0.75} aria-live="polite">
      <Stack direction="row" spacing={0.75}>
        {LEVELS.map((level, index) => (
          <Box
            key={level}
            sx={(theme) => ({
              height: 4,
              flex: 1,
              borderRadius: borderRadius.full,
              backgroundColor:
                index <= activeIndex
                  ? strengthColor(theme, strength)
                  : themePalette(theme).kokyu.border.subtle,
              transition: `background-color ${duration.normal} ${easing.standard}`,
            })}
          />
        ))}
      </Stack>
      <Typography variant="labelSmall" sx={(theme) => ({ color: strengthColor(theme, strength) })}>
        {authText.passwordStrength.label}: {authText.passwordStrength[strength]}
      </Typography>
    </Stack>
  );
}
