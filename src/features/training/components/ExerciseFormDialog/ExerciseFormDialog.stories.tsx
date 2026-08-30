import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExerciseFormDialog } from './ExerciseFormDialog';

const equipmentOptions = [
  { value: 'equipment-barra', label: 'Barra' },
  { value: 'equipment-halteres', label: 'Halteres' },
  { value: 'equipment-maquina', label: 'Máquina' },
];

const meta = {
  title: 'Kokyu Treinamento/ExerciseFormDialog',
  component: ExerciseFormDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: () => {},
    onCreated: () => {},
    equipmentOptions,
  },
} satisfies Meta<typeof ExerciseFormDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = { args: { open: false } };
