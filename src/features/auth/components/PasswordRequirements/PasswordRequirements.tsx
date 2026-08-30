'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { getMetPasswordRequirements, passwordRequirements } from '../../utils/passwordRequirements';

/** Standard "visually hidden, still announced by screen readers" recipe. */
const visuallyHidden: SxProps<Theme> = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface PasswordRequirementsProps {
  password: string;
}

/**
 * Live checklist for the password policy. Met/unmet state is never
 * color-only: the icon shape changes too, and a visually-hidden
 * suffix (“atendido”/“pendente”) makes it available to screen readers
 * without duplicating the visible label.
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const metIds = new Set(getMetPasswordRequirements(password).map((requirement) => requirement.id));

  return (
    <Stack
      component="ul"
      spacing={0.75}
      aria-label="Requisitos de senha"
      sx={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {passwordRequirements.map((requirement) => {
        const isMet = metIds.has(requirement.id);
        return (
          <Stack
            key={requirement.id}
            component="li"
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            {isMet ? (
              <CheckCircleRoundedIcon
                fontSize="small"
                aria-hidden="true"
                sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.success })}
              />
            ) : (
              <RadioButtonUncheckedRoundedIcon
                fontSize="small"
                aria-hidden="true"
                sx={(theme) => ({ color: themePalette(theme).kokyu.text.disabled })}
              />
            )}
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: isMet
                  ? themePalette(theme).kokyu.text.primary
                  : themePalette(theme).kokyu.text.secondary,
              })}
            >
              {requirement.label}
              <Box component="span" sx={visuallyHidden}>
                {isMet ? ', atendido' : ', pendente'}
              </Box>
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
