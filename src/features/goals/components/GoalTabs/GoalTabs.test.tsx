import { describe, expect, it, vi } from 'vitest';

const { mockPathname } = vi.hoisted(() => ({ mockPathname: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

import { render, screen } from '../../../../../test/test-utils';
import { GoalTabs } from './GoalTabs';

describe('GoalTabs', () => {
  it('highlights "Visão geral" on the overview route', () => {
    mockPathname.mockReturnValue('/app/metas');
    render(<GoalTabs />);
    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('highlights "Em andamento" on that route', () => {
    mockPathname.mockReturnValue('/app/metas/em-andamento');
    render(<GoalTabs />);
    expect(screen.getByRole('tab', { name: 'Em andamento' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('falls back to "Em andamento" on a goal detail route', () => {
    mockPathname.mockReturnValue('/app/metas/goal-read-20-books');
    render(<GoalTabs />);
    expect(screen.getByRole('tab', { name: 'Em andamento' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('falls back to "Em andamento" on the creation route', () => {
    mockPathname.mockReturnValue('/app/metas/nova');
    render(<GoalTabs />);
    expect(screen.getByRole('tab', { name: 'Em andamento' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('renders every tab as a link to its own route', () => {
    mockPathname.mockReturnValue('/app/metas');
    render(<GoalTabs />);
    expect(screen.getByRole('tab', { name: 'Planejamento' })).toHaveAttribute(
      'href',
      '/app/metas/planejamento',
    );
    expect(screen.getByRole('tab', { name: 'Histórico' })).toHaveAttribute(
      'href',
      '/app/metas/historico',
    );
  });
});
