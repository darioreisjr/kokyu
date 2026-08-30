import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RestTimerBar } from './RestTimerBar';

const meta = {
  title: 'Kokyu Treinamento/RestTimerBar',
  component: RestTimerBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onAddSeconds: () => {},
    onSkip: () => {},
  },
} satisfies Meta<typeof RestTimerBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: { restEndAt: new Date(Date.now() + 90_000).toISOString() },
};

/** Once rest ends, the bar renders nothing visible (only a hidden `aria-live` region announcing "Descanso concluído") — never a lingering "00:00" bar. */
export const Completed: Story = {
  args: { restEndAt: new Date(Date.now() - 1000).toISOString() },
};
