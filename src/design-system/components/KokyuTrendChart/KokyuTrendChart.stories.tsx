import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuTrendChart } from './KokyuTrendChart';

const meta = {
  title: 'Kokyu Components/KokyuTrendChart',
  component: KokyuTrendChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box sx={{ width: 360 }}>
      <KokyuTrendChart {...args} />
    </Box>
  ),
} satisfies Meta<typeof KokyuTrendChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: '1RM estimado do Supino reto',
    valueFormatter: (value: number) => `${value}kg`,
    points: [
      { label: '01/08', value: 84 },
      { label: '08/08', value: 86 },
      { label: '15/08', value: 88 },
      { label: '22/08', value: 87 },
      { label: '29/08', value: 92 },
    ],
  },
};

export const WithTarget: Story = {
  args: {
    ...Default.args,
    targetValue: 100,
  },
};

export const Empty: Story = {
  args: {
    ariaLabel: '1RM estimado',
    points: [],
  },
};
