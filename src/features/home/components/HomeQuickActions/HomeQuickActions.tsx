import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ComponentType } from 'react';
import type { HomeQuickAction } from '@/shared/home/types';

export interface HomeQuickActionsProps {
  actions: HomeQuickAction[];
  onSelect: (action: HomeQuickAction) => void;
}

const ICONS: Record<string, ComponentType<{ fontSize?: 'small' }>> = {
  AssignmentRounded: AssignmentRoundedIcon,
  AutorenewRounded: AutorenewRoundedIcon,
  FitnessCenterRounded: FitnessCenterRoundedIcon,
  RestaurantRounded: RestaurantRoundedIcon,
  MovieRounded: MovieRoundedIcon,
  TrackChangesRounded: TrackChangesRoundedIcon,
  EventRounded: EventRoundedIcon,
};

/**
 * "Adicionar" — each chip opens the source feature's own creation flow
 * (via `onSelect`/navigation); no logic is duplicated here (see spec's
 * "Não implementar lógica duplicada").
 */
export function HomeQuickActions({ actions, onSelect }: HomeQuickActionsProps) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge" component="h2">
        Adicionar
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {actions.map((action) => {
          const Icon = ICONS[action.icon];
          return (
            <Chip
              key={action.id}
              icon={Icon ? <Icon fontSize="small" /> : undefined}
              label={action.label}
              onClick={() => onSelect(action)}
              variant="outlined"
              clickable
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
