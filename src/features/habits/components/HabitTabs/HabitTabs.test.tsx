import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPathname } = vi.hoisted(() => ({ mockPathname: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

import { render, screen } from '../../../../../test/test-utils';
import { HabitTabs } from './HabitTabs';

describe('HabitTabs', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/app/habitos');
  });

  it('renders all 7 habit sub-navigation tabs', () => {
    render(<HabitTabs />);

    expect(screen.getByRole('tab', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Rotinas' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Todos os hábitos' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Calendário' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Progresso' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Revisões' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Arquivados' })).toBeInTheDocument();
  });

  it('hides tabs in routine player focus mode (/executar)', () => {
    mockPathname.mockReturnValue('/app/habitos/rotinas/r-1/executar');
    const { container } = render(<HabitTabs />);
    expect(container.firstChild).toBeNull();
  });
});
