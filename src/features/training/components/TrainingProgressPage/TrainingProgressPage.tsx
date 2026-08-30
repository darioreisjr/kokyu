'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { useTrainingAnalytics } from '../../hooks/useTrainingAnalytics';
import { useTrainingPreferences } from '../../hooks/useTrainingPreferences';
import { useWeeklyConsistency } from '../../hooks/useWeeklyConsistency';
import { formatWeight } from '../../utils/weightUnit';
import { ExerciseTrendSection } from '../ExerciseTrendSection/ExerciseTrendSection';
import { MuscleVolumeHeatmap } from '../MuscleVolumeHeatmap/MuscleVolumeHeatmap';
import { PersonalRecordTable } from '../PersonalRecordTable/PersonalRecordTable';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 2,
      })}
    >
      <Typography
        variant="labelSmall"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
      >
        {label}
      </Typography>
      <Typography variant="displaySmall" component="p">
        {value}
      </Typography>
    </Box>
  );
}

export function TrainingProgressPage() {
  const { status, summary } = useTrainingAnalytics();
  const { preferences } = useTrainingPreferences();
  const { weeks } = useWeeklyConsistency(8);
  const weightUnit = preferences?.weightUnit ?? 'kg';

  return (
    <Stack spacing={4}>
      <Stack spacing={0.5}>
        <Typography variant="displaySmall" component="h1">
          Progresso
        </Typography>
        <Typography
          variant="body1"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
        >
          Estou evoluindo?
        </Typography>
      </Stack>

      {status === 'loading' || !summary ? (
        <Skeleton variant="rounded" height={160} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(6, 1fr)',
            },
            gap: 1.5,
          }}
        >
          <StatTile label="Treinos (ano)" value={String(summary.sessionsCompletedThisYear)} />
          <StatTile label="Minutos (ano)" value={String(summary.minutesTrainedThisYear)} />
          <StatTile label="Frequência" value={`${summary.weeklyFrequency}x/sem`} />
          <StatTile label="Sequência" value={`${summary.currentStreakWeeks} sem`} />
          <StatTile
            label="Volume (semana)"
            value={formatWeight(summary.totalVolumeThisWeekKg, weightUnit)}
          />
          <StatTile label="Total de treinos" value={String(summary.totalSessions)} />
        </Box>
      )}

      <Stack spacing={1}>
        <Typography variant="labelLarge" component="h2">
          Consistência semanal
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-end', height: 48 }}>
          {weeks.map((week) => (
            <Tooltip
              key={week.weekStart}
              title={`${week.sessionsCompleted} treinos na semana de ${new Date(week.weekStart).toLocaleDateString('pt-BR')}`}
            >
              <Box
                sx={(theme) => ({
                  width: 20,
                  height: Math.max(4, week.sessionsCompleted * 10),
                  backgroundColor: themePalette(theme).kokyu.action.primary,
                  borderRadius: 0.5,
                })}
              />
            </Tooltip>
          ))}
        </Stack>
      </Stack>

      <ExerciseTrendSection weightUnit={weightUnit} />
      <MuscleVolumeHeatmap />
      <PersonalRecordTable weightUnit={weightUnit} />
    </Stack>
  );
}
