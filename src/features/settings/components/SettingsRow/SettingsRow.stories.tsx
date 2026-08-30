import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsSelect } from '../SettingsSelect/SettingsSelect';
import { SettingsToggle } from '../SettingsToggle/SettingsToggle';
import { SettingsRow } from './SettingsRow';

const meta = {
  title: 'Kokyu Components/Settings/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 480 }}>
        <SettingsGroup>
          <Story />
        </SettingsGroup>
      </Box>
    ),
  ],
  args: {
    title: 'Título da preferência',
  },
} satisfies Meta<typeof SettingsRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: PaletteRoundedIcon,
  },
};

export const Toggle: Story = {
  render: (args) => {
    function ToggleRow() {
      const [checked, setChecked] = useState(true);
      return (
        <SettingsRow
          {...args}
          control={<SettingsToggle label={args.title} checked={checked} onChange={setChecked} />}
        />
      );
    }
    return <ToggleRow />;
  },
  args: {
    title: 'Sons da interface',
    description: 'Sons curtos para ações como concluir ou avançar.',
  },
};

export const Select: Story = {
  render: (args) => {
    function SelectRow() {
      const [value, setValue] = useState('pt-BR');
      return (
        <SettingsRow
          {...args}
          control={
            <SettingsSelect
              label={args.title}
              hideLabel
              value={value}
              options={[
                { value: 'pt-BR', label: 'Português (Brasil)' },
                { value: 'en-US', label: 'English (US)' },
              ]}
              onChange={setValue}
            />
          }
        />
      );
    }
    return <SelectRow />;
  },
  args: {
    title: 'Idioma',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Página inicial',
    description: 'Ignorada enquanto "Continuar de onde parei" estiver ativo.',
    disabled: true,
    control: (
      <SettingsSelect
        label="Página inicial"
        hideLabel
        value="respiracao"
        options={[{ value: 'respiracao', label: 'Respiração' }]}
        disabled
        onChange={() => {}}
      />
    ),
  },
};

export const Description: Story = {
  args: {
    title: 'Fuso horário',
    description: 'Exemplo: America/Sao_Paulo',
  },
};
