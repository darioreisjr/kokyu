import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { FreeTimeSlot } from '@/shared/scheduling/types';
import { HomeFreeTimeCard } from './HomeFreeTimeCard';

const freeSlot: FreeTimeSlot = { id: 'slot1', date: new Date().toISOString().split('T')[0]!, startAt: '14:00', endAt: '14:45', duration: 45 };

const meta = {
  title: 'Home/HomeFreeTimeCard',
  component: HomeFreeTimeCard,
  args: { onSelectCandidate: async () => {}, onOpenFullList: () => {} },
} satisfies Meta<typeof HomeFreeTimeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Suggestions come from the real `getCandidatesForAvailableTime` — whatever fits 45 minutes in the seeded mock data today. */
export const WithFreeSlot: Story = { args: { freeSlot } };

/** Hidden entirely — no current free block (see spec's "ADAPTIVE HOME"). */
export const NoFreeSlot: Story = { args: { freeSlot: null } };
