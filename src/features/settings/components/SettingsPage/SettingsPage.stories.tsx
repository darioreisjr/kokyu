import { ThemeProvider } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { createKokyuTheme } from '@/design-system/theme';

import { SettingsPage } from './SettingsPage';

const meta = {
  title: 'Kokyu Pages/SettingsPage',
  component: SettingsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/app/configuracoes', query: {} },
    },
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const General: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/app/configuracoes', query: { section: 'geral' } } },
  },
};

export const Appearance: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/app/configuracoes', query: { section: 'aparencia' } } },
  },
};

export const Notifications: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/app/configuracoes', query: { section: 'notificacoes' } } },
  },
};

export const Accessibility: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/app/configuracoes', query: { section: 'acessibilidade' } },
    },
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

// Dark/Light force the color-scheme attribute the same way
// `InitColorSchemeScript` does app-wide — `[data-dark]`/`[data-light]`
// are plain attribute selectors MUI's CSS-variables generator emits,
// so setting them on any wrapping element (not just `<html>`) scopes
// every `--mui-palette-*` variable underneath it correctly.
export const Dark: Story = {
  decorators: [
    (Story) => (
      <div data-dark="">
        <Story />
      </div>
    ),
  ],
};

export const Light: Story = {
  decorators: [
    (Story) => (
      <div data-light="">
        <Story />
      </div>
    ),
  ],
};

// "Contraste" changes theme *tokens*, not just the color scheme, so
// this needs a real nested theme rather than an attribute override.
export const HighContrast: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={createKokyuTheme('hinokami', 'high')}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
