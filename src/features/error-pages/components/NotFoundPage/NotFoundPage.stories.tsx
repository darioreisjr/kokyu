import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NotFoundPage } from './NotFoundPage';

const meta = {
  title: 'Kokyu Pages/NotFoundPage',
  component: NotFoundPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotFoundPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};

export const ReducedMotion: Story = {
  globals: { viewport: { value: 'desktop' } },
  args: {
    // `motion`'s `useReducedMotion()` caches its first `matchMedia`
    // read for the whole session, so flipping the OS preference
    // between stories in the same Storybook tab isn't reliable —
    // this prop forces the reduced state deterministically instead.
    reducedMotion: true,
  },
};
