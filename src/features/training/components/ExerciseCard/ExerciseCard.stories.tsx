import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { Exercise } from '../../types';
import { ExerciseCard } from './ExerciseCard';

const baseExercise: Exercise = {
  id: 'exercise-supino-reto',
  name: 'Supino reto',
  slug: 'supino-reto',
  exerciseType: 'strength',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['triceps', 'shoulders'],
  equipmentIds: ['equipment-barra', 'equipment-banco'],
  trackingType: 'weightReps',
  createdByUser: false,
  favorite: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const meta = {
  title: 'Kokyu Treinamento/ExerciseCard',
  component: ExerciseCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ExerciseCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Strength: Story = {
  args: { exercise: baseExercise, equipmentNames: ['Barra', 'Banco'] },
};

export const Bodyweight: Story = {
  args: {
    exercise: {
      ...baseExercise,
      id: 'exercise-flexao-de-braco',
      name: 'Flexão de braço',
      exerciseType: 'bodyweight',
      equipmentIds: ['equipment-peso-corporal'],
      trackingType: 'reps',
    },
    equipmentNames: ['Peso corporal'],
  },
};

export const Cardio: Story = {
  args: {
    exercise: {
      ...baseExercise,
      id: 'exercise-esteira',
      name: 'Esteira',
      exerciseType: 'cardio',
      primaryMuscles: ['quads', 'calves'],
      secondaryMuscles: [],
      equipmentIds: ['equipment-esteira'],
      trackingType: 'distanceTime',
    },
    equipmentNames: ['Esteira'],
  },
};

export const Favorite: Story = {
  args: {
    exercise: { ...baseExercise, favorite: true },
    equipmentNames: ['Barra', 'Banco'],
    onToggleFavorite: () => {},
  },
};
