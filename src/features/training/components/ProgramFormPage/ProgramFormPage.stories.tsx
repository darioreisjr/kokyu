import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProgramFormPage } from './ProgramFormPage';

const meta = {
  title: 'Kokyu Treinamento/ProgramFormPage',
  component: ProgramFormPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProgramFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: { mode: 'create' },
};

export const Edit: Story = {
  args: { mode: 'edit', programId: 'program-hipertrofia-fundamentos' },
};
