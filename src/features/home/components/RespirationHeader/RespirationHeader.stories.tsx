import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RespirationHeader } from './RespirationHeader';

const meta = {
  title: 'Home/RespirationHeader',
  component: RespirationHeader,
  args: { dateLabel: 'Sexta-feira, 4 de setembro', firstName: 'Dario', lastName: 'Reis', avatarUrl: null },
} satisfies Meta<typeof RespirationHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Morning: Story = { args: { dayMoment: 'morning' } };
export const Afternoon: Story = { args: { dayMoment: 'afternoon' } };
export const Evening: Story = { args: { dayMoment: 'evening' } };
export const WithoutName: Story = { args: { dayMoment: 'morning', firstName: null, lastName: null } };
export const Hidden: Story = { args: { dayMoment: 'morning', showGreeting: false } };
