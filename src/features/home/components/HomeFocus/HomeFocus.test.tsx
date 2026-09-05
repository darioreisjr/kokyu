import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../../../test/test-utils';
import type { HomePriorityItem } from '@/shared/home/types';
import { HomeFocus } from './HomeFocus';

const priorities: HomePriorityItem[] = [
  { kind: 'mission', id: 'm1', title: 'Missão em foco', status: 'pending', actionHref: '/app/missoes' },
  {
    kind: 'goal',
    id: 'g1',
    title: 'Meta em foco',
    progressPercent: 42,
    nextStepLabel: 'Registrar treino',
    actionHref: '/app/metas',
  },
];

describe('HomeFocus', () => {
  it('renders a mission with a checkbox and a goal with a progress percentage — never the same visual', () => {
    render(<HomeFocus priorities={priorities} onCompleteMission={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Concluir missão Missão em foco' })).toBeInTheDocument();
    expect(screen.getByText('Meta em foco')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('Próximo: Registrar treino')).toBeInTheDocument();
  });

  it('calls onCompleteMission with the mission id when its checkbox is clicked', () => {
    const onCompleteMission = vi.fn();
    render(<HomeFocus priorities={priorities} onCompleteMission={onCompleteMission} onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Concluir missão Missão em foco' }));
    expect(onCompleteMission).toHaveBeenCalledWith('m1');
  });

  it('shows an empty message when there are no priorities', () => {
    render(<HomeFocus priorities={[]} onCompleteMission={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByText('Nada em foco definido para hoje.')).toBeInTheDocument();
  });
});
