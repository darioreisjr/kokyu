import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import type { ExerciseFilterOptions } from '../../utils/exerciseFilters';
import { ExerciseFiltersBar } from './ExerciseFiltersBar';

const equipmentOptions = [
  { value: 'equipment-barra', label: 'Barra' },
  { value: 'equipment-halteres', label: 'Halteres' },
  { value: 'equipment-maquina', label: 'Máquina' },
];

const meta = {
  title: 'Kokyu Treinamento/ExerciseFiltersBar',
  component: ExerciseFiltersBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    filters: {},
    onFiltersChange: () => {},
    equipmentOptions,
  },
} satisfies Meta<typeof ExerciseFiltersBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithMuscleFilter: Story = {
  args: { filters: { muscleGroup: 'chest' } },
};

export const WithQuickFiltersActive: Story = {
  args: { filters: { favoritesOnly: true, createdByUserOnly: true } },
};

/** Interactive — keeps its own state so the controls actually respond in the Storybook canvas. */
export const Interactive: Story = {
  render: (args) => {
    function Wrapper() {
      const [filters, setFilters] = useState<ExerciseFilterOptions>(args.filters);
      return <ExerciseFiltersBar {...args} filters={filters} onFiltersChange={setFilters} />;
    }
    return <Wrapper />;
  },
};
