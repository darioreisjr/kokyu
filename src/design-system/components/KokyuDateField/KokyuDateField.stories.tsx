import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { KokyuDateField, type KokyuDateFieldProps } from './KokyuDateField';

/** `KokyuDateField` is controlled — this wrapper gives each story its own local state. */
function ControlledDateField(props: Omit<KokyuDateFieldProps, 'onChange'>) {
  const [value, setValue] = useState<Date | null>(props.value);
  return <KokyuDateField {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Kokyu Components/KokyuDateField',
  component: KokyuDateField,
  tags: ['autodocs'],
  render: (args) => <ControlledDateField {...args} />,
  args: {
    label: 'Data de nascimento',
    value: null,
    onChange: () => undefined,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof KokyuDateField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { value: new Date(2000, 7, 28) },
};

export const Error: Story = {
  args: {
    error: true,
    helperText: 'Você precisa ter pelo menos 18 anos para criar uma conta',
  },
};
