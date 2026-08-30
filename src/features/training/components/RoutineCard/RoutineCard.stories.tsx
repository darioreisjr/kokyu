import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { mockRoutinePushA } from '../../mocks/routines.mock';
import { RoutineCard } from './RoutineCard';

const meta = {
  title: 'Kokyu Treinamento/RoutineCard',
  component: RoutineCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RoutineCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { routine: mockRoutinePushA },
};

export const Favorite: Story = {
  args: { routine: { ...mockRoutinePushA, favorite: true }, onToggleFavorite: () => {} },
};

export const Archived: Story = {
  args: { routine: { ...mockRoutinePushA, archived: true } },
};
