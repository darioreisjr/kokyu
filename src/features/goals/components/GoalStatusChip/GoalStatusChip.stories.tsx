import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { GoalStatus } from '../../types';
import { GoalStatusChip } from './GoalStatusChip';

const meta = {
  title: 'Kokyu Metas/GoalStatusChip',
  component: GoalStatusChip,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GoalStatusChip>;

export default meta;

type Story = StoryObj<typeof meta>;

const allStatuses: GoalStatus[] = [
  'notStarted',
  'onTrack',
  'attention',
  'atRisk',
  'completed',
  'paused',
  'abandoned',
  'archived',
];

export const NotStarted: Story = { args: { status: 'notStarted' } };
export const OnTrack: Story = { args: { status: 'onTrack' } };
export const Attention: Story = { args: { status: 'attention' } };
export const AtRisk: Story = { args: { status: 'atRisk' } };
export const Completed: Story = { args: { status: 'completed' } };
export const Paused: Story = { args: { status: 'paused' } };
export const Abandoned: Story = { args: { status: 'abandoned' } };
export const Archived: Story = { args: { status: 'archived' } };

export const AllStates: Story = {
  args: { status: 'onTrack' },
  render: () => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {allStatuses.map((status) => (
        <GoalStatusChip key={status} status={status} />
      ))}
    </Stack>
  ),
};
