import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GoalProgressBar } from './GoalProgressBar';

const meta = {
  title: 'Kokyu Metas/GoalProgressBar',
  component: GoalProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ width: 280 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof GoalProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Numeric: Story = { args: { current: 8, target: 20, percent: 40, unit: 'books' } };
export const Decrease: Story = { args: { current: 80, target: 60, percent: 50, unit: 'minutes' } };
export const Overachieved: Story = {
  args: {
    current: 22,
    target: 20,
    percent: 100,
    unit: 'books',
    label: 'Progresso: 22 de 20 livros, 110%.',
  },
};
export const KeyResults: Story = {
  args: {
    current: 50,
    target: 100,
    percent: 50,
    unit: 'units',
    label: '1 de 2 resultados concluídos (50%).',
  },
};
export const Milestones: Story = {
  args: {
    current: 2,
    target: 4,
    percent: 50,
    unit: 'units',
    label: '2 de 4 marcos concluídos (50%).',
  },
};
