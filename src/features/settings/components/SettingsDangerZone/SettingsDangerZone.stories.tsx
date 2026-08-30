import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuButton } from '@/design-system/components';

import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsDangerZone } from './SettingsDangerZone';

const meta = {
  title: 'Kokyu Components/Settings/SettingsDangerZone',
  component: SettingsDangerZone,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 480 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    description: 'Ações que não podem ser desfeitas.',
    children: (
      <SettingsRow
        title="Excluir conta"
        description="Remove permanentemente sua conta e seus dados."
        control={
          <KokyuButton variant="outlined" color="error" size="small">
            Excluir minha conta
          </KokyuButton>
        }
      />
    ),
  },
} satisfies Meta<typeof SettingsDangerZone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
