import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RoutineFormPage } from './RoutineFormPage';

const meta = {
  title: 'Kokyu Treinamento/RoutineFormPage',
  component: RoutineFormPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RoutineFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = { args: { mode: 'create' } };

export const Edit: Story = { args: { mode: 'edit', routineId: 'routine-push-a' } };
