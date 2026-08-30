'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalContribution } from '../../services/goalContributionsService';

export interface GoalContributionsListProps {
  contributions: GoalContribution[];
}

/** "O que está contribuindo" — um módulo pode contribuir sem ser a fonte oficial da métrica (ver `goalContributionsService`); nunca usado para recalcular o progresso da meta. */
export function GoalContributionsList({ contributions }: GoalContributionsListProps) {
  if (contributions.length === 0) return null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge">O que está contribuindo</Typography>
      <Stack spacing={1}>
        {contributions.map((contribution) => (
          <Stack
            key={contribution.entityType}
            direction="row"
            spacing={1}
            sx={(theme) => ({
              justifyContent: 'space-between',
              padding: 1.5,
              borderRadius: 1.5,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Typography variant="body2">{contribution.label}</Typography>
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {contribution.summary}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
