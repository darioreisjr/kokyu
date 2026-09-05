import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomePriorityItem } from '@/shared/home/types';
import { HomeFocus } from './HomeFocus';

const missionPriority: HomePriorityItem = {
  kind: 'mission',
  id: 'm1',
  title: 'Implementar arquitetura do Scheduler',
  status: 'pending',
  actionHref: '/app/missoes',
};

const priorities: HomePriorityItem[] = [
  missionPriority,
  {
    kind: 'goal',
    id: 'g1',
    title: 'Correr 10km',
    progressPercent: 62,
    nextStepLabel: 'Correr 8km sem parar',
    actionHref: '/app/metas',
  },
];

const meta = {
  title: 'Home/HomeFocus',
  component: HomeFocus,
  args: { onCompleteMission: () => {}, onNavigate: () => {} },
} satisfies Meta<typeof HomeFocus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissionAndGoal: Story = { args: { priorities } };
export const CompletedMission: Story = {
  args: { priorities: [{ ...missionPriority, status: 'completed' }] },
};
export const Empty: Story = { args: { priorities: [] } };
export const Loading: Story = { args: { priorities: [], isLoading: true } };
