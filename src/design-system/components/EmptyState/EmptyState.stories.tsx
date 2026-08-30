import InventoryRoundedIcon from '@mui/icons-material/Inventory2Rounded';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuButton } from '../KokyuButton/KokyuButton';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Kokyu Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  render: (args) => (
    <Box sx={{ width: 420 }}>
      <EmptyState {...args} />
    </Box>
  ),
  args: {
    title: 'Despensa vazia',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const WithDescription: Story = {
  args: {
    description: 'Adicione o que você já tem em casa.',
  },
};

export const WithIconAndAction: Story = {
  args: {
    icon: InventoryRoundedIcon,
    description: 'Adicione o que você já tem em casa.',
    action: <KokyuButton variant="contained">Adicionar item</KokyuButton>,
  },
};
