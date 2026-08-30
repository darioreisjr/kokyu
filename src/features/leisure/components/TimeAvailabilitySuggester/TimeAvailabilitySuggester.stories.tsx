import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { mockLeisureItems } from '../../mocks/leisureItems.mock';
import { TimeAvailabilitySuggester } from './TimeAvailabilitySuggester';

const meta = {
  title: 'Kokyu Tempo Livre/TimeAvailabilitySuggester',
  component: TimeAvailabilitySuggester,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ width: 480 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    items: mockLeisureItems,
    onStart: fn(),
  },
} satisfies Meta<typeof TimeAvailabilitySuggester>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThirtyMinutes: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '30 min' }));
  },
};

export const OneHour: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '1 hora' }));
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '15 min' }));
  },
};
