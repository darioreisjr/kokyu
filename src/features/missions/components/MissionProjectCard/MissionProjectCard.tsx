'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import { themePalette } from '@/design-system/theme/useThemePalette';
import { missionRoutes } from '../../constants/missionRoutes';
import type { MissionProject, MissionProjectProgress } from '../../types';

export interface MissionProjectCardProps {
  project: MissionProject;
  progress: MissionProjectProgress;
  nextActionTitle?: string;
}

const STATUS_LABELS: Record<MissionProject['status'], string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
  archived: 'Arquivado',
};

export function MissionProjectCard({ project, progress, nextActionTitle }: MissionProjectCardProps) {
  return (
    <Card
      variant="outlined"
      component={NextLink}
      href={missionRoutes.projectDetail(project.id)}
      sx={(theme) => ({
        borderRadius: 3,
        borderColor: themePalette(theme).kokyu.border.default,
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      })}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {project.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {STATUS_LABELS[project.status]}
            </Typography>
          </Stack>

          {project.description && (
            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>
          )}

          <Stack spacing={0.5}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {progress.completedCount} de {progress.eligibleCount} concluídas
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {progress.percent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              aria-label={`Progresso do projeto ${project.name}: ${progress.percent}%`}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Stack>

          {nextActionTitle && (
            <Typography variant="caption" color="text.secondary">
              Próxima ação: {nextActionTitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
