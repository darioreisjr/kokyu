import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MissionQuickCapture } from './MissionQuickCapture';

const meta = {
  title: 'Missions/MissionQuickCapture',
  component: MissionQuickCapture,
} satisfies Meta<typeof MissionQuickCapture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { onCapture: () => {} } };

export const Filled: Story = {
  args: { onCapture: () => {}, initialTitle: 'Enviar relatório sexta' },
};

export const Keyboard: Story = {
  args: { onCapture: () => {}, initialTitle: 'Comprar ingresso', autoFocus: true },
};
