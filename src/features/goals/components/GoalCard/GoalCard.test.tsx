import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { Goal } from '../../types';
import { GoalCard } from './GoalCard';

const numericGoal: Goal = {
  id: 'goal-1',
  title: 'Ler 20 livros este ano',
  area: 'leisure',
  type: 'numeric',
  status: 'onTrack',
  systemStatus: 'onTrack',
  priority: 'focus',
  measurement: {
    type: 'numeric',
    direction: 'increase',
    unit: 'books',
    baseline: 0,
    currentValue: 8,
    targetValue: 20,
  },
  progressMode: 'automatic',
  source: { module: 'leisure', metricId: 'leisure.booksCompleted' },
  startDate: '2026-01-01',
  targetDate: '2026-12-31',
  tags: [],
  checkInFrequency: 'monthly',
  createdAt: '2026-01-02T10:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
};

const milestoneGoal: Goal = {
  id: 'goal-2',
  title: 'Construir meu app',
  area: 'personal',
  type: 'milestone',
  status: 'onTrack',
  systemStatus: 'onTrack',
  priority: 'medium',
  measurement: { type: 'milestone' },
  progressMode: 'manual',
  startDate: '2026-01-01',
  milestones: [
    { id: 'm1', title: 'Definir o MVP', completed: true, order: 0 },
    { id: 'm2', title: 'Publicar', completed: false, order: 1 },
  ],
  tags: [],
  checkInFrequency: 'none',
  createdAt: '2026-01-02T10:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
};

describe('GoalCard', () => {
  it('links to the goal detail route', () => {
    render(
      <GoalCard
        goal={numericGoal}
        progress={{ current: 8, target: 20, percent: 40, rawPercent: 40 }}
      />,
    );
    expect(screen.getByRole('link', { name: /Ler 20 livros este ano/ })).toHaveAttribute(
      'href',
      '/app/metas/goal-1',
    );
  });

  it('shows the accessible progress caption with unit and percent', () => {
    render(
      <GoalCard
        goal={numericGoal}
        progress={{ current: 8, target: 20, percent: 40, rawPercent: 40 }}
      />,
    );
    expect(screen.getByText('Progresso: 8 de 20 livros, 40%.')).toBeInTheDocument();
  });

  it('shows the automatic-update indicator for an automatic goal', () => {
    render(
      <GoalCard
        goal={numericGoal}
        progress={{ current: 8, target: 20, percent: 40, rawPercent: 40 }}
      />,
    );
    expect(screen.getByText('Atualização automática')).toBeInTheDocument();
  });

  it('shows the manual-update indicator for a manual goal', () => {
    render(
      <GoalCard
        goal={milestoneGoal}
        progress={{ current: 1, target: 2, percent: 50, rawPercent: 50 }}
      />,
    );
    expect(screen.getByText('Atualização manual')).toBeInTheDocument();
  });

  it('shows the next incomplete milestone', () => {
    render(
      <GoalCard
        goal={milestoneGoal}
        progress={{ current: 1, target: 2, percent: 50, rawPercent: 50 }}
      />,
    );
    expect(screen.getByText('Próximo: Publicar')).toBeInTheDocument();
  });

  it('shows a milestone-goal caption in terms of milestones, not units', () => {
    render(
      <GoalCard
        goal={milestoneGoal}
        progress={{ current: 1, target: 2, percent: 50, rawPercent: 50 }}
      />,
    );
    expect(screen.getByText('1 de 2 marcos concluídos (50%).')).toBeInTheDocument();
  });
});
