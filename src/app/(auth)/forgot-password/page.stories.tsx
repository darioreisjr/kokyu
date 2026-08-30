import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ForgotPasswordPage from './page';

const meta = {
  title: 'Kokyu Pages/ForgotPasswordPage',
  component: ForgotPasswordPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Success: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('E-mail'), 'usuario@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar instruções' }));
    await canvas.findByRole('heading', { name: 'Verifique seu e-mail' });
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};

export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
};

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const ReducedMotion: Story = {
  globals: { viewport: { value: 'desktop' } },
  args: {
    // `motion`'s `useReducedMotion()` caches its first `matchMedia`
    // read for the whole session, so flipping the OS preference
    // between stories in the same Storybook tab isn't reliable —
    // this prop forces the reduced state deterministically instead
    // (same technique as `NotFoundPage`'s `ReducedMotion` story).
    reducedMotion: true,
  },
};
