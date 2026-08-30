'use client';

import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';

import { muscleGroupLabels } from '../../constants/muscleGroups';
import { useMuscleVolumeBreakdown } from '../../hooks/useMuscleVolumeBreakdown';

/** Direct sets per muscle group over the trailing 7 days — data only, never labeled "ideal"/"excessivo" (per the spec's own explicit instruction). */
export function MuscleVolumeHeatmap() {
  const { entries } = useMuscleVolumeBreakdown(7);
  const maxSets = Math.max(1, ...entries.map((entry) => entry.directSets));

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge" component="h2">
        Volume semanal por músculo
      </Typography>
      {entries.length === 0 ? (
        <Typography
          variant="body2"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Nenhum treino nos últimos 7 dias.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {entries.map((entry) => (
            <Stack key={entry.muscleGroup} spacing={0.25}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">{muscleGroupLabels[entry.muscleGroup]}</Typography>
                <Typography
                  variant="labelSmall"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {entry.directSets} séries diretas
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(entry.directSets / maxSets) * 100}
                aria-hidden="true"
                sx={{ borderRadius: 1, height: 6 }}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
