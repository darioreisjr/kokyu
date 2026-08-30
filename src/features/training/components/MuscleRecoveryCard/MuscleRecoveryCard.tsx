'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { muscleGroupLabels } from '../../constants/muscleGroups';
import { recoveryLabels } from '../../constants/recoveryLabels';
import type { MuscleRecoveryEstimate } from '../../types';

export interface MuscleRecoveryCardProps {
  estimate: MuscleRecoveryEstimate;
}

/** Always "estimativa de recuperação", never a diagnostic percentage presented as fact. */
export function MuscleRecoveryCard({ estimate }: MuscleRecoveryCardProps) {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 1.5,
      })}
    >
      <Stack spacing={0.25}>
        <Typography variant="labelMedium">{muscleGroupLabels[estimate.muscleGroup]}</Typography>
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          {recoveryLabels[estimate.label]}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Estimativa de recuperação: {estimate.estimatedRecoveryPercent}%
        </Typography>
      </Stack>
    </Box>
  );
}
