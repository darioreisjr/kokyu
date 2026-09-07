import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { AppShellUser } from '../KokyuAppShell/AppShellUser';
import type { NavigationItemConfig } from '../NavigationItem/NavigationItem';
import { Sidebar } from './Sidebar';

const sampleUser: AppShellUser = { name: 'Dario Reis', initials: 'DR', avatarUrl: null };

const items: NavigationItemConfig[] = [
  { id: 'respiracao', label: 'Respiração', href: '/app', icon: HomeRoundedIcon },
  { id: 'missoes', label: 'Missões', href: '/app/missoes', icon: AssignmentRoundedIcon },
  {
    id: 'ritmo-diario',
    label: 'Ritmo Diário',
    href: '/app/ritmo-diario',
    icon: CalendarMonthRoundedIcon,
  },
  {
    id: 'treinamento',
    label: 'Treinamento',
    href: '/app/treinamento',
    icon: FitnessCenterRoundedIcon,
  },
  { id: 'habitos', label: 'Hábitos', href: '/app/habitos', icon: AutorenewRoundedIcon },
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
  title: 'Kokyu Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  args: {
    items,
    bottomItems,
    pathname: '/app/treinamento',
    collapsed: false,
    onToggleCollapse: fn(),
    onLogout: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true },
};

export const WithUser: Story = {
  args: { user: sampleUser },
};

export const CollapsedWithUser: Story = {
  args: { collapsed: true, user: sampleUser },
};
