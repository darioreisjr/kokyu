import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { themePalette } from '@/design-system/theme/useThemePalette';
import type { MissionActivity, MissionActivityType } from '../../types';

const ACTIVITY_LABELS: Record<MissionActivityType, string> = {
  created: 'Missão criada',
  updated: 'Missão atualizada',
  planned: 'Planejada',
  scheduled: 'Agendada',
  rescheduled: 'Reagendada',
  started: 'Iniciada',
  completed: 'Concluída',
  reopened: 'Reaberta',
  waiting: 'Marcada como aguardando',
  blocked: 'Bloqueada',
  unblocked: 'Desbloqueada',
  priorityChanged: 'Prioridade alterada',
  deadlineChanged: 'Prazo alterado',
  projectChanged: 'Projeto alterado',
  cancelled: 'Cancelada',
  archived: 'Arquivada',
};

export interface MissionActivityTimelineProps {
  activity: MissionActivity[];
}

/** Append-only rendering — reopening never hides the earlier `completed` entry (spec "REABRIR"). */
export function MissionActivityTimeline({ activity }: MissionActivityTimelineProps) {
  if (activity.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhum histórico registrado ainda.
      </Typography>
    );
  }

  return (
    <Stack component="ol" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {activity.map((event) => (
        <Stack
          key={event.id}
          component="li"
          direction="row"
          spacing={1.5}
          sx={(theme) => ({ borderLeft: `2px solid ${themePalette(theme).kokyu.border.default}`, pl: 1.5 })}
        >
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {ACTIVITY_LABELS[event.type]}
            </Typography>
            {event.detail && (
              <Typography variant="caption" color="text.secondary">
                {event.detail}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {format(new Date(event.createdAt), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
