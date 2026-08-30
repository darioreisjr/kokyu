import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuPasswordField } from './KokyuPasswordField';

const meta = {
  title: 'Kokyu Components/KokyuPasswordField',
  component: KokyuPasswordField,
  tags: ['autodocs'],
  args: {
    label: 'Senha',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof KokyuPasswordField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  args: { defaultValue: 'super-secret' },
};

export const Visible: Story = {
  render: (args) => <KokyuPasswordField {...args} />,
  args: { defaultValue: 'super-secret' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar senha' }));
  },
};

export const Error: Story = {
  args: { error: true, helperText: 'Informe sua senha' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'super-secret' },
};
