import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuDivider } from './KokyuDivider';

const meta = {
  title: 'Kokyu Components/KokyuDivider',
  component: KokyuDivider,
  tags: ['autodocs'],
  render: (args) => (
    <Box sx={{ width: 320 }}>
      <KokyuDivider {...args} />
    </Box>
  ),
} satisfies Meta<typeof KokyuDivider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithLabel: Story = {
  args: { children: 'ou continue com' },
};

export const Plain: Story = {};
