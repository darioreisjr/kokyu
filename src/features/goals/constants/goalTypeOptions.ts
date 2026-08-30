import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EqualizerRoundedIcon from '@mui/icons-material/EqualizerRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ComponentType } from 'react';

import type { GoalType, GoalUnit } from '../types';

export type GoalTypeOptionId =
  'number' | 'completion' | 'steps' | 'consistency' | 'average' | 'percentage' | 'keyResult';

export interface GoalTypeOptionDefinition {
  id: GoalTypeOptionId;
  label: string;
  description: string;
  resultingType: GoalType;
  icon: ComponentType<SvgIconProps>;
  presetUnit?: GoalUnit;
}

/**
 * Etapa 3 da criação — "Como vamos medir?". "Número" e "Porcentagem" resultam ambos em
 * `type: 'numeric'` (só a unidade padrão muda); "Resultados" é oferecido separadamente, com
 * linguagem simples em vez de "OKR" (ver a spec: "não obrigar usuário comum a conhecer OKR").
 */
export const goalTypeOptionDefinitions: GoalTypeOptionDefinition[] = [
  {
    id: 'number',
    label: 'Número',
    description: 'Um valor que sobe até (ou desce até) uma meta — livros lidos, km percorridos.',
    resultingType: 'numeric',
    icon: TrendingUpRoundedIcon,
  },
  {
    id: 'completion',
    label: 'Conclusão',
    description: 'Feito ou não feito — sem meio-termo.',
    resultingType: 'binary',
    icon: CheckCircleRoundedIcon,
  },
  {
    id: 'steps',
    label: 'Etapas',
    description: 'Dividida em marcos importantes.',
    resultingType: 'milestone',
    icon: FlagRoundedIcon,
  },
  {
    id: 'consistency',
    label: 'Consistência',
    description: 'Repetir algo com regularidade — vezes por semana, por exemplo.',
    resultingType: 'consistency',
    icon: RepeatRoundedIcon,
  },
  {
    id: 'average',
    label: 'Média',
    description: 'Uma média a manter ao longo do tempo — minutos por dia, por exemplo.',
    resultingType: 'average',
    icon: EqualizerRoundedIcon,
  },
  {
    id: 'percentage',
    label: 'Porcentagem',
    description: 'Um percentual a atingir — 90% de consistência, por exemplo.',
    resultingType: 'numeric',
    icon: PercentRoundedIcon,
    presetUnit: 'percentage',
  },
  {
    id: 'keyResult',
    label: 'Resultados',
    description:
      'Para metas maiores: divida em alguns resultados concretos, cada um com sua própria medida.',
    resultingType: 'keyResult',
    icon: ChecklistRoundedIcon,
  },
];

export function getGoalTypeOptionDefinition(id: GoalTypeOptionId): GoalTypeOptionDefinition {
  return (
    goalTypeOptionDefinitions.find((definition) => definition.id === id) ??
    goalTypeOptionDefinitions[0]!
  );
}
