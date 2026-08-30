import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { RoutineFilterOptions } from '../../utils/routineFilters';
import { RoutineFiltersBar } from './RoutineFiltersBar';

const locationOptions = [
  { value: 'location-academia', label: 'Academia' },
  { value: 'location-casa', label: 'Casa' },
];

function renderBar(filters: RoutineFilterOptions = {}) {
  const onFiltersChange = vi.fn();
  render(
    <RoutineFiltersBar
      filters={filters}
      onFiltersChange={onFiltersChange}
      locationOptions={locationOptions}
    />,
  );
  return { onFiltersChange };
}

describe('RoutineFiltersBar', () => {
  it('renders the search field and filter controls', () => {
    renderBar();
    expect(screen.getByLabelText('Buscar treinos')).toBeInTheDocument();
    expect(screen.getByLabelText('Músculo')).toBeInTheDocument();
    expect(screen.getByLabelText('Local')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Somente favoritos' })).toBeInTheDocument();
  });

  it('reports a search change by merging it into the existing filters', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderBar({ muscleGroup: 'chest' });
    await user.type(screen.getByLabelText('Buscar treinos'), 'a');
    expect(onFiltersChange).toHaveBeenCalledWith({ muscleGroup: 'chest', search: 'a' });
  });

  it('lets the user pick a location from the select', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderBar();
    await user.click(screen.getByLabelText('Local'));
    await user.click(await screen.findByRole('option', { name: 'Casa' }));
    expect(onFiltersChange).toHaveBeenCalledWith({ locationId: 'location-casa' });
  });

  it('toggles the favorites-only filter on and off', async () => {
    const user = userEvent.setup();
    const { onFiltersChange } = renderBar();
    await user.click(screen.getByRole('button', { name: 'Somente favoritos' }));
    expect(onFiltersChange).toHaveBeenCalledWith({ favoritesOnly: true });
  });

  it('reflects an already-active favorites filter as pressed', () => {
    renderBar({ favoritesOnly: true });
    expect(screen.getByRole('button', { name: 'Somente favoritos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
