import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomeAttentionItem } from '@/shared/home/types';
import { HomeAttention } from './HomeAttention';

const conflict: HomeAttentionItem = {
  id: 'a1',
  sourceType: 'dailyRhythm',
  severity: 'important',
  title: 'Conflito na agenda',
  description: 'Dois compromissos se sobrepõem às 14:00.',
  actionLabel: 'Ver agenda',
  actionHref: '/app/ritmo-diario',
  createdAt: '2026-09-04T10:00:00Z',
};

const goalAtRisk: HomeAttentionItem = {
  id: 'a2',
  sourceType: 'goal',
  severity: 'attention',
  title: 'Meta "Correr 10km" precisa de atenção',
  actionLabel: 'Ver meta',
  actionHref: '/app/metas',
  createdAt: '2026-09-04T10:00:00Z',
};

const missionOverdue: HomeAttentionItem = {
  id: 'a3',
  sourceType: 'mission',
  severity: 'attention',
  title: '"Revisar proposta do cliente" está atrasada',
  actionLabel: 'Ver missões',
  actionHref: '/app/missoes',
  createdAt: '2026-09-04T10:00:00Z',
};

const pantry: HomeAttentionItem = {
  id: 'a4',
  sourceType: 'nutrition',
  severity: 'info',
  title: '2 itens da despensa vencem em breve',
  actionLabel: 'Ver despensa',
  actionHref: '/app/nutricao',
  createdAt: '2026-09-04T10:00:00Z',
};

const meta = {
  title: 'Home/HomeAttention',
  component: HomeAttention,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeAttention>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithConflicts: Story = { args: { items: [conflict] } };
export const MixedSeverities: Story = { args: { items: [conflict, missionOverdue, goalAtRisk, pantry] } };
export const Empty: Story = { args: { items: [] } };
