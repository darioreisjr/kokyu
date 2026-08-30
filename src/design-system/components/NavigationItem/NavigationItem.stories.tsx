import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { darkColorTokens } from '../../tokens/semantic/colors';
import { NavigationItem } from './NavigationItem';

const meta = {
  title: 'Kokyu Components/NavigationItem',
  component: NavigationItem,
  tags: ['autodocs'],
  args: {
    icon: HomeRoundedIcon,
    label: 'Respiração',
    href: '/app',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 260,
          padding: 2,
          backgroundColor: darkColorTokens.background.default,
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof NavigationItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

/** Hover isn't a prop — this documents it by starting the pointer over the item. */
export const Hover: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('link', { name: 'Respiração' }));
  },
};

export const Collapsed: Story = {
  args: { collapsed: true },
};

export const LogoutAction: Story = {
  args: { href: undefined, label: 'Sair', onClick: () => {} },
};
