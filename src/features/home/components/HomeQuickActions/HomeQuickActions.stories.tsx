import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomeQuickAction } from '@/shared/home/types';
import { HomeQuickActions } from './HomeQuickActions';

const actions: HomeQuickAction[] = [
  { id: 'new-mission', label: 'Nova Missão', icon: 'AssignmentRounded', href: '/app/missoes' },
  { id: 'log-habit', label: 'Registrar Hábito', icon: 'AutorenewRounded', href: '/app/habitos' },
  { id: 'plan-training', label: 'Planejar Treino', icon: 'FitnessCenterRounded', href: '/app/treinamento' },
  { id: 'add-meal', label: 'Adicionar Refeição', icon: 'RestaurantRounded', href: '/app/nutricao' },
  { id: 'save-for-later', label: 'Guardar para Depois', icon: 'MovieRounded', href: '/app/tempo-livre' },
  { id: 'new-goal', label: 'Nova Meta', icon: 'TrackChangesRounded', href: '/app/metas' },
  { id: 'new-entry', label: 'Novo Compromisso', icon: 'EventRounded', href: '/app/ritmo-diario' },
];

const meta = {
  title: 'Home/HomeQuickActions',
  component: HomeQuickActions,
  args: { actions, onSelect: () => {} },
} satisfies Meta<typeof HomeQuickActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
