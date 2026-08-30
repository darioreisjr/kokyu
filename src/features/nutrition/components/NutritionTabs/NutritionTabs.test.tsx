import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { NutritionTabs } from './NutritionTabs';

let mockPathname = '/app/nutricao';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('NutritionTabs', () => {
  it('renders all 5 sections', () => {
    mockPathname = '/app/nutricao';
    render(<NutritionTabs />);
    expect(screen.getByRole('tab', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Planejamento' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Despensa' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Compras' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Receitas' })).toBeInTheDocument();
  });

  it('marks "Hoje" as active on the base route', () => {
    mockPathname = '/app/nutricao';
    render(<NutritionTabs />);
    expect(screen.getByRole('tab', { name: 'Hoje' })).toHaveAttribute('aria-selected', 'true');
  });

  it('marks "Receitas" active on a nested recipe detail route (prefix match)', () => {
    mockPathname = '/app/nutricao/receitas/recipe-1';
    render(<NutritionTabs />);
    expect(screen.getByRole('tab', { name: 'Receitas' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Hoje' })).toHaveAttribute('aria-selected', 'false');
  });

  it('links each tab to its own route', () => {
    mockPathname = '/app/nutricao/planejamento';
    render(<NutritionTabs />);
    expect(screen.getByRole('tab', { name: 'Planejamento' })).toHaveAttribute(
      'href',
      '/app/nutricao/planejamento',
    );
    expect(screen.getByRole('tab', { name: 'Despensa' })).toHaveAttribute(
      'href',
      '/app/nutricao/despensa',
    );
  });
});
