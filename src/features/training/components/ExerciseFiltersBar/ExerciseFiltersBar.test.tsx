import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { ExerciseFilterOptions } from '../../utils/exerciseFilters';
import { ExerciseFiltersBar } from './ExerciseFiltersBar';

const equipmentOptions = [
  { value: 'equipment-barra', label: 'Barra' },
  { value: 'equipment-halteres', label: 'Halteres' },
];

function renderBar(filters: ExerciseFilterOptions = {}) {
  const onFiltersChange = vi.fn();
  render(
    <ExerciseFiltersBar
      filters={filters}
      onFiltersChange={onFiltersChange}
      equipmentOptions={equipmentOptions}
    />,
  );
  return { onFiltersChange };
}

describe('ExerciseFiltersBar', () => {
  it('renders the search field and filter selects', () => {
    renderBar();
    expect(screen.getByLabelText('Buscar exercícios')).toBeInTheDocument();
    expect(screen.getByLabelText('Músculo')).toBeInTheDocument();
    expect(screen.getByLabelText('Equipamento')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Somente favoritos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Somente criados por mim' })).toBeInTheDocument();
  });

  it('reports a search change by merging it into the existing filters', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderBar({ muscleGroup: 'chest' });
    await user.type(screen.getByLabelText('Buscar exercícios'), 'a');
    expect(onFiltersChange).toHaveBeenCalledWith({ muscleGroup: 'chest', search: 'a' });
  });

  it('lets the user pick a muscle group from the select', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderBar();
    await user.click(screen.getByLabelText('Músculo'));
    await user.click(await screen.findByRole('option', { name: 'Peito' }));
    expect(onFiltersChange).toHaveBeenCalledWith({ muscleGroup: 'chest' });
  });

  it('toggles the favorites-only quick filter on and off', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderBar();
    await user.click(screen.getByRole('button', { name: 'Somente favoritos' }));
    expect(onFiltersChange).toHaveBeenCalledWith({ favoritesOnly: true, createdByUserOnly: false });
  });

  it('reflects an already-active favorites filter as pressed', () => {
    renderBar({ favoritesOnly: true });
    expect(screen.getByRole('button', { name: 'Somente favoritos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
