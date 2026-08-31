import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import type { HabitArea } from '../types/habit.types';

export interface HabitAreaDefinition {
  id: HabitArea;
  label: string;
  description: string;
  icon: ComponentType<SvgIconProps>;
}

export const habitAreaDefinitions: HabitAreaDefinition[] = [
  {
    id: 'routine',
    label: 'Rotina & Produtividade',
    description: 'Organização do dia, blocos de foco e rotinas diárias.',
    icon: TrackChangesRoundedIcon,
  },
  {
    id: 'work',
    label: 'Trabalho & Foco',
    description: 'Deep work, encerramento do expediente e organização profissional.',
    icon: WorkRoundedIcon,
  },
  {
    id: 'training',
    label: 'Treinamento & Movimento',
    description: 'Atividade física, mobilidade, passos e exercícios.',
    icon: FitnessCenterRoundedIcon,
  },
  {
    id: 'nutrition',
    label: 'Nutrição & Hidratação',
    description: 'Consumo de água, preparo de refeições e alimentação consciente.',
    icon: RestaurantRoundedIcon,
  },
  {
    id: 'habits',
    label: 'Hábitos Gerais',
    description: 'Hábitos fundamentais e práticas consistentes.',
    icon: PsychologyRoundedIcon,
  },
  {
    id: 'leisure',
    label: 'Tempo Livre & Leitura',
    description: 'Leitura de livros, hobbies, descanso e cultura.',
    icon: MenuBookRoundedIcon,
  },
  {
    id: 'personal',
    label: 'Vida Pessoal & Bem-estar',
    description: 'Autocuidado, sono, journaling e presença.',
    icon: PersonRoundedIcon,
  },
  {
    id: 'other',
    label: 'Outros',
    description: 'Hábitos gerais e comportamentos diversos.',
    icon: MoreHorizRoundedIcon,
  },
];

export function getHabitAreaDefinition(area: HabitArea): HabitAreaDefinition {
  return (
    habitAreaDefinitions.find((def) => def.id === area) ?? {
      id: 'other',
      label: 'Outros',
      description: 'Geral',
      icon: MoreHorizRoundedIcon,
    }
  );
}

export function getHabitAreaLabel(area: HabitArea): string {
  return getHabitAreaDefinition(area).label;
}
