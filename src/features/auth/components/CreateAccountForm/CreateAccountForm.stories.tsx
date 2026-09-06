import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CreateAccountForm } from './CreateAccountForm';

const meta = {
  title: 'Kokyu Components/CreateAccountForm',
  component: CreateAccountForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CreateAccountForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationErrors: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Criar conta' }));
  },
};

export const Filled: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('E-mail'), 'dario@example.com');
    await userEvent.type(canvas.getByLabelText('Nome'), 'Dario');
    await userEvent.type(canvas.getByLabelText('Sobrenome'), 'Reis');
    await userEvent.type(canvas.getByLabelText('Username'), 'dario_reis');
    await userEvent.type(canvas.getByLabelText('Senha', { exact: true }), 'Abcdefgh123!');
    await userEvent.type(canvas.getByLabelText('Confirmar senha'), 'Abcdefgh123!');
  },
};
