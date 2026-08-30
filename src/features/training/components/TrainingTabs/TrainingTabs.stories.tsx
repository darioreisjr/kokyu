import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TrainingTabs } from './TrainingTabs';

const meta = {
  title: 'Kokyu Treinamento/TrainingTabs',
  component: TrainingTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/app/treinamento' } },
  },
} satisfies Meta<typeof TrainingTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Today: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/app/treinamento' } } },
};

export const Routines: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/app/treinamento/treinos' } },
  },
};

export const Recovery: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/app/treinamento/recuperacao' } },
  },
};
