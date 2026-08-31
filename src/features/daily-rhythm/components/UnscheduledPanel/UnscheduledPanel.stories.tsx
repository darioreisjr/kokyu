import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UnscheduledPanel } from './UnscheduledPanel';

const meta = {
  title: 'Daily Rhythm/UnscheduledPanel',
  component: UnscheduledPanel,
} satisfies Meta<typeof UnscheduledPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        id: 'u-1',
        sourceType: 'mission',
        sourceId: 'm-1',
        title: 'Revisar documentação técnica',
        date: '2026-08-31',
        duration: 45,
        status: 'planned',
        createdAt: '2026-08-31T00:00:00Z',
        updatedAt: '2026-08-31T00:00:00Z',
      },
      {
        id: 'u-2',
        sourceType: 'habit',
        sourceId: 'h-1',
        title: 'Ler 20 páginas',
        date: '2026-08-31',
        duration: 30,
        status: 'planned',
        createdAt: '2026-08-31T00:00:00Z',
        updatedAt: '2026-08-31T00:00:00Z',
      },
    ],
    onScheduleItem: () => {},
  },
};

export const Empty: Story = {
  args: {
    items: [],
    onScheduleItem: () => {},
  },
};

