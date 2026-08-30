import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { NavigationItemConfig } from '../NavigationItem/NavigationItem';
import { KokyuAppShell } from './KokyuAppShell';

const items: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon: HomeRoundedIcon },
  { id: 'missoes', label: 'Missões', href: '/app/missoes', icon: AssignmentRoundedIcon },
  {
    id: 'treinamento',
    label: 'Treinamento',
    href: '/app/treinamento',
    icon: FitnessCenterRoundedIcon,
  },
];

const bottomItems: NavigationItemConfig[] = [
  { id: 'perfil', label: 'Perfil', href: '/app/perfil', icon: PersonRoundedIcon },
  {
    id: 'configuracoes',
    label: 'Configurações',
    href: '/app/configuracoes',
    icon: SettingsRoundedIcon,
  },
];

const meta = {
  title: 'Kokyu Components/KokyuAppShell',
  component: KokyuAppShell,
  tags: ['autodocs'],
  args: {
    items,
    bottomItems,
    onLogout: fn(),
    children: (
      <Typography variant="displaySmall" component="h1">
        Respiração
      </Typography>
    ),
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/app' } },
  },
} satisfies Meta<typeof KokyuAppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
