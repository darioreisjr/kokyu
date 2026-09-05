import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { KokyuButton } from '@/design-system/components';
import type { MissionProject, MissionProjectProgress } from '../../types';

export interface MissionProjectHeaderProps {
  project: MissionProject;
  progress: MissionProjectProgress;
  nextActionTitle?: string;
  onComplete?: () => void;
  onArchive?: () => void;
}

export function MissionProjectHeader({ project, progress, nextActionTitle, onComplete, onArchive }: MissionProjectHeaderProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {project.name}
          </Typography>
          {project.description && (
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          {project.status !== 'completed' && (
            <KokyuButton variant="outlined" onClick={onComplete}>
              Concluir projeto
            </KokyuButton>
          )}
          {project.status !== 'archived' && (
            <KokyuButton variant="outlined" onClick={onArchive}>
              Arquivar
            </KokyuButton>
          )}
        </Stack>
      </Stack>

      <Stack spacing={0.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {progress.completedCount} de {progress.eligibleCount} missões concluídas
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {progress.percent}%
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress.percent} sx={{ height: 8, borderRadius: 1 }} />
      </Stack>

      {nextActionTitle && (
        <Typography variant="body2" color="text.secondary">
          Próxima ação sugerida: <strong>{nextActionTitle}</strong>
        </Typography>
      )}
    </Stack>
  );
}
