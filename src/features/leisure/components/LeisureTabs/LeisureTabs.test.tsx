import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { LeisureTabs } from './LeisureTabs';

let mockPathname = '/app/tempo-livre';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('LeisureTabs', () => {
  it('renders all 8 sections', () => {
    mockPathname = '/app/tempo-livre';
    render(<LeisureTabs />);
    for (const label of [
      'Hoje',
      'Planejamento',
      'Para depois',
      'Biblioteca',
      'Lugares & Passeios',
      'Hobbies',
      'Notas',
      'Histórico',
    ]) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    }
  });

  it('marks "Hoje" as active on the base route', () => {
    mockPathname = '/app/tempo-livre';
    render(<LeisureTabs />);
    expect(screen.getByRole('tab', { name: 'Hoje' })).toHaveAttribute('aria-selected', 'true');
  });

  it('marks "Biblioteca" active on an item detail route, since it sits outside every tab\'s own prefix', () => {
    mockPathname = '/app/tempo-livre/item/movie-1';
    render(<LeisureTabs />);
    expect(screen.getByRole('tab', { name: 'Biblioteca' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Hoje' })).toHaveAttribute('aria-selected', 'false');
  });

  it('links each tab to its own route', () => {
    render(<LeisureTabs />);
    expect(screen.getByRole('tab', { name: 'Planejamento' })).toHaveAttribute(
      'href',
      '/app/tempo-livre/planejamento',
    );
    expect(screen.getByRole('tab', { name: 'Notas' })).toHaveAttribute(
      'href',
      '/app/tempo-livre/notas',
    );
  });
});
