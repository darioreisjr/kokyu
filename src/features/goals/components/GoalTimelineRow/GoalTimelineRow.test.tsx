import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { Goal } from '../../types';
import { GoalTimelineRow } from './GoalTimelineRow';

const goalWithMilestones: Goal = {
  id: 'goal-1',
  title: 'Construir meu app',
  area: 'personal',
  type: 'milestone',
  status: 'onTrack',
  systemStatus: 'onTrack',
  priority: 'medium',
  measurement: { type: 'milestone' },
  progressMode: 'manual',
  startDate: '2026-01-01',
  targetDate: '2026-12-01',
  milestones: [
    { id: 'm1', title: 'Definir o MVP', completed: true, order: 0, targetDate: '2026-04-01' },
    { id: 'm2', title: 'Publicar', completed: false, order: 1, targetDate: '2026-12-01' },
  ],
  tags: [],
  checkInFrequency: 'none',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const goalWithNoDeadline: Goal = {
  ...goalWithMilestones,
  id: 'goal-2',
  targetDate: undefined,
  milestones: [],
};

describe('GoalTimelineRow', () => {
  it('links to the goal detail route and shows start/target dates', () => {
    render(<GoalTimelineRow goal={goalWithMilestones} />);
    expect(screen.getByRole('link', { name: 'Construir meu app' })).toHaveAttribute(
      'href',
      '/app/metas/goal-1',
    );
    expect(screen.getByText(/1 de jan de 2026/)).toBeInTheDocument();
  });

  it('shows "sem prazo" when the goal has no target date', () => {
    render(<GoalTimelineRow goal={goalWithNoDeadline} />);
    expect(screen.getByText(/sem prazo/)).toBeInTheDocument();
  });
});
