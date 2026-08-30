import type { SvgIconProps } from '@mui/material/SvgIcon';

import { getGoalAreaDefinition } from '../../constants/goalAreas';
import type { GoalArea } from '../../types';

export interface GoalAreaIconProps extends SvgIconProps {
  area: GoalArea;
}

/** Reuses the same icon `features/navigation` already shows for that area's module — never a second, goals-only icon set. */
export function GoalAreaIcon({ area, ...props }: GoalAreaIconProps) {
  const Icon = getGoalAreaDefinition(area).icon;
  return <Icon aria-hidden="true" {...props} />;
}
