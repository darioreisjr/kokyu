import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import type { RoutineFilterOptions } from '../../utils/routineFilters';
import { RoutineFiltersBar } from './RoutineFiltersBar';

const locationOptions = [
  { value: 'location-academia', label: 'Academia' },
  { value: 'location-casa', label: 'Casa' },
];

const meta = {
  title: 'Kokyu Treinamento/RoutineFiltersBar',
  component: RoutineFiltersBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    filters: {},
    onFiltersChange: () => {},
    locationOptions,
  },
} satisfies Meta<typeof RoutineFiltersBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithMuscleFilter: Story = {
  args: { filters: { muscleGroup: 'chest' } },
};

export const FavoritesOnly: Story = {
  args: { filters: { favoritesOnly: true } },
};

/** Interactive — keeps its own state so the controls actually respond in the Storybook canvas. */
export const Interactive: Story = {
  render: (args) => {
    function Wrapper() {
      const [filters, setFilters] = useState<RoutineFilterOptions>(args.filters);
      return <RoutineFiltersBar {...args} filters={filters} onFiltersChange={setFilters} />;
    }
    return <Wrapper />;
  },
};
