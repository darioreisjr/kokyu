import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from './SettingsSection';

const meta = {
  title: 'Kokyu Components/Settings/SettingsSection',
  component: SettingsSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 560 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    title: 'Aparência',
    description: 'Como o Kokyu se parece e se comporta visualmente para você.',
    autosaves: true,
    children: (
      <SettingsGroup>
        <SettingsRow title="Tema" description="Sistema, claro ou escuro." />
        <SettingsRow title="Densidade" description="Compacta, confortável ou espaçosa." />
      </SettingsGroup>
    ),
  },
} satisfies Meta<typeof SettingsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
