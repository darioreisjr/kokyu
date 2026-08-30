import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { NavigationItemConfig } from '../NavigationItem/NavigationItem';
import { NavigationDrawer } from './NavigationDrawer';

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
];

const meta = {
  title: 'Kokyu Components/MobileNavigation',
  component: NavigationDrawer,
  tags: ['autodocs'],
  args: {
    items,
    bottomItems,
    pathname: '/app',
    open: false,
    onClose: fn(),
    onLogout: fn(),
  },
  globals: { viewport: { value: 'mobile' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NavigationDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  args: { open: true },
};
