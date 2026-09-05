import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';

import type { MissionArea } from '../types';

export interface MissionAreaDefinition {
  id: MissionArea;
  label: string;
  icon: ComponentType<SvgIconProps>;
}

/** Same area vocabulary as `goalAreaDefinitions`/`HabitAreaIcon` — see `MissionArea`'s doc comment for why it isn't a shared import. */
export const missionAreaDefinitions: MissionAreaDefinition[] = [
  { id: 'work', label: 'Trabalho', icon: AssignmentRoundedIcon },
  { id: 'routine', label: 'Rotina', icon: CalendarMonthRoundedIcon },
  { id: 'training', label: 'Treinamento', icon: FitnessCenterRoundedIcon },
  { id: 'nutrition', label: 'Nutrição', icon: RestaurantRoundedIcon },
  { id: 'habits', label: 'Hábitos', icon: AutorenewRoundedIcon },
  { id: 'leisure', label: 'Tempo Livre', icon: MovieRoundedIcon },
  { id: 'personal', label: 'Pessoal', icon: PersonRoundedIcon },
  { id: 'other', label: 'Outra', icon: MoreHorizRoundedIcon },
];

export function getMissionAreaDefinition(area: MissionArea): MissionAreaDefinition {
  return (
    missionAreaDefinitions.find((definition) => definition.id === area) ??
    missionAreaDefinitions[missionAreaDefinitions.length - 1]!
  );
}

export function getMissionAreaLabel(area: MissionArea): string {
  return getMissionAreaDefinition(area).label;
}
