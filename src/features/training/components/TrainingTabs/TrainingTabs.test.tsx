import { describe, expect, it, vi } from 'vitest';

const { mockPathname } = vi.hoisted(() => ({ mockPathname: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

import { render, screen } from '../../../../../test/test-utils';
import { TrainingTabs } from './TrainingTabs';

describe('TrainingTabs', () => {
  it('highlights "Hoje" on the today route', () => {
    mockPathname.mockReturnValue('/app/treinamento');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Hoje' })).toHaveAttribute('aria-selected', 'true');
  });

  it('highlights "Calendário" on that route', () => {
    mockPathname.mockReturnValue('/app/treinamento/calendario');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Calendário' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('highlights "Meus treinos" on a routine detail route', () => {
    mockPathname.mockReturnValue('/app/treinamento/treinos/routine-push-a');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Meus treinos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('highlights "Programas" on that route', () => {
    mockPathname.mockReturnValue('/app/treinamento/programas');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Programas' })).toHaveAttribute('aria-selected', 'true');
  });

  it('highlights "Exercícios" on that route', () => {
    mockPathname.mockReturnValue('/app/treinamento/exercicios');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Exercícios' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('highlights "Progresso" on that route', () => {
    mockPathname.mockReturnValue('/app/treinamento/progresso');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Progresso' })).toHaveAttribute('aria-selected', 'true');
  });

  it('highlights "Histórico" on that route', () => {
    mockPathname.mockReturnValue('/app/treinamento/historico');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Histórico' })).toHaveAttribute('aria-selected', 'true');
  });

  it('highlights "Recuperação" on that route', () => {
    mockPathname.mockReturnValue('/app/treinamento/recuperacao');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Recuperação' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('renders every tab as a link to its own route', () => {
    mockPathname.mockReturnValue('/app/treinamento');
    render(<TrainingTabs />);
    expect(screen.getByRole('tab', { name: 'Meus treinos' })).toHaveAttribute(
      'href',
      '/app/treinamento/treinos',
    );
    expect(screen.getByRole('tab', { name: 'Recuperação' })).toHaveAttribute(
      'href',
      '/app/treinamento/recuperacao',
    );
  });

  it('renders nothing on an active-session route', () => {
    mockPathname.mockReturnValue('/app/treinamento/sessao/session-push-a-1');
    const { container } = render(<TrainingTabs />);
    expect(container).toBeEmptyDOMElement();
  });
});
