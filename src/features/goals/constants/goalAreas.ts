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

import type { GoalArea } from '../types';

export interface GoalAreaDefinition {
  id: GoalArea;
  label: string;
  description: string;
  icon: ComponentType<SvgIconProps>;
}

/**
 * The single source of truth for area label/icon/description — icons are reused from
 * `features/navigation/config/navigationItems.ts` wherever a Kokyu module already owns that
 * concept, per the spec's own "reutilizar os ícones já utilizados no menu principal".
 */
export const goalAreaDefinitions: GoalAreaDefinition[] = [
  {
    id: 'work',
    label: 'Trabalho',
    description: 'Carreira, projetos e Missões.',
    icon: AssignmentRoundedIcon,
  },
  {
    id: 'routine',
    label: 'Rotina',
    description: 'Organização do dia a dia e Ritmo Diário.',
    icon: CalendarMonthRoundedIcon,
  },
  {
    id: 'training',
    label: 'Treinamento',
    description: 'Condicionamento físico e treinos.',
    icon: FitnessCenterRoundedIcon,
  },
  {
    id: 'nutrition',
    label: 'Nutrição',
    description: 'Alimentação e planejamento de refeições.',
    icon: RestaurantRoundedIcon,
  },
  {
    id: 'habits',
    label: 'Hábitos',
    description: 'Repetição e consistência.',
    icon: AutorenewRoundedIcon,
  },
  {
    id: 'leisure',
    label: 'Tempo Livre',
    description: 'O que você quer aproveitar, assistir ou jogar.',
    icon: MovieRoundedIcon,
  },
  {
    id: 'personal',
    label: 'Pessoal',
    description: 'Desenvolvimento pessoal e bem-estar.',
    icon: PersonRoundedIcon,
  },
  {
    id: 'other',
    label: 'Outra',
    description: 'Não se encaixa nas áreas acima.',
    icon: MoreHorizRoundedIcon,
  },
];

export function getGoalAreaDefinition(area: GoalArea): GoalAreaDefinition {
  return (
    goalAreaDefinitions.find((definition) => definition.id === area) ??
    goalAreaDefinitions[goalAreaDefinitions.length - 1]!
  );
}

export function getGoalAreaLabel(area: GoalArea): string {
  return getGoalAreaDefinition(area).label;
}
