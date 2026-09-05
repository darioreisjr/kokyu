import Chip from '@mui/material/Chip';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

import { getMissionPriorityDefinition, missionImportanceLabels } from '../../constants/missionPriorities';
import type { MissionImportance, MissionPriority as MissionPriorityValue } from '../../types';

export interface MissionPriorityBadgeProps {
  priority: MissionPriorityValue;
  importance?: MissionImportance;
  size?: 'small' | 'medium';
}

/** Never color-only (WCAG) — always pairs an icon and a text label with the color. */
function priorityIcon(priority: MissionPriorityValue) {
  if (priority === 'critical') return <WhatshotRoundedIcon fontSize="small" />;
  if (priority === 'high') return <PriorityHighRoundedIcon fontSize="small" />;
  if (priority === 'none') return <RemoveRoundedIcon fontSize="small" />;
  return <FlagRoundedIcon fontSize="small" />;
}

export function MissionPriorityBadge({ priority, importance, size = 'small' }: MissionPriorityBadgeProps) {
  const definition = getMissionPriorityDefinition(priority);
  const label = importance ? `${definition.label} · ${missionImportanceLabels[importance]}` : definition.label;

  if (priority === 'none' && !importance) return null;

  return (
    <Chip
      icon={priorityIcon(priority)}
      label={label}
      size={size}
      color={definition.color}
      variant={definition.color === 'default' ? 'outlined' : 'filled'}
      aria-label={`Prioridade: ${label}`}
    />
  );
}
