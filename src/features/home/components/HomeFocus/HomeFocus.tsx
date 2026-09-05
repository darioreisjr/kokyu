'use client';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomePriorityItem } from '@/shared/home/types';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { HomeSectionCard } from '../HomeSectionCard/HomeSectionCard';

export interface HomeFocusProps {
  priorities: HomePriorityItem[];
  isLoading?: boolean;
  onCompleteMission: (id: string) => void;
  onNavigate: (href: string) => void;
}

/**
 * "Em foco" — Missions and Goals never share one visual: a Mission gets
 * a checkbox (it's done or it isn't), a Goal gets a progress bar (see
 * spec's "NÃO MISTURAR").
 */
export function HomeFocus({ priorities, isLoading = false, onCompleteMission, onNavigate }: HomeFocusProps) {
  return (
    <HomeSectionCard>
      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
        Em foco
      </Typography>

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={40} />
        </Stack>
      ) : priorities.length === 0 ? (
        <Typography variant="body1" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}>
          Nada em foco definido para hoje.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {priorities.map((priority) =>
            priority.kind === 'mission' ? (
              <Stack
                key={`mission-${priority.id}`}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <IconButton
                  size="small"
                  aria-label={`Concluir missão ${priority.title}`}
                  onClick={() => onCompleteMission(priority.id)}
                  disabled={priority.status === 'completed'}
                >
                  {priority.status === 'completed' ? (
                    <CheckCircleRoundedIcon color="success" fontSize="small" />
                  ) : (
                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                  )}
                </IconButton>
                <Typography
                  variant="body1"
                  onClick={() => onNavigate(priority.actionHref)}
                  sx={{
                    cursor: 'pointer',
                    textDecoration: priority.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {priority.title}
                </Typography>
              </Stack>
            ) : (
              <Stack key={`goal-${priority.id}`} spacing={0.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography
                    variant="body1"
                    onClick={() => onNavigate(priority.actionHref)}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  >
                    {priority.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    {priority.progressPercent}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, priority.progressPercent)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                {priority.nextStepLabel ? (
                  <Typography
                    variant="caption"
                    sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                  >
                    Próximo: {priority.nextStepLabel}
                  </Typography>
                ) : null}
              </Stack>
            ),
          )}
        </Stack>
      )}
    </HomeSectionCard>
  );
}
