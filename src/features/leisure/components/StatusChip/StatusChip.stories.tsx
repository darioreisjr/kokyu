import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusChip } from './StatusChip';

const meta = {
  title: 'Kokyu Tempo Livre/StatusChip',
  component: StatusChip,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { type: 'movie', status: 'backlog' },
} satisfies Meta<typeof StatusChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      <StatusChip type="book" status="backlog" />
      <StatusChip type="book" status="inProgress" />
      <StatusChip type="book" status="paused" />
      <StatusChip type="book" status="completed" />
      <StatusChip type="book" status="abandoned" />
    </Stack>
  ),
};
