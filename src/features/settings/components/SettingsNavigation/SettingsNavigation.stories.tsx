import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { settingsCategories } from '../../constants/settingsCategories';
import { SettingsNavigation } from './SettingsNavigation';

const meta = {
  title: 'Kokyu Components/Settings/SettingsNavigation',
  component: SettingsNavigation,
  tags: ['autodocs'],
  render: (args) => {
    function Interactive() {
      const [active, setActive] = useState(args.activeCategory);
      return (
        <Box sx={{ width: 280 }}>
          <SettingsNavigation
            categories={args.categories}
            activeCategory={active}
            onSelectCategory={setActive}
          />
        </Box>
      );
    }
    return <Interactive />;
  },
  args: {
    categories: settingsCategories,
    activeCategory: 'aparencia',
    onSelectCategory: () => {},
  },
} satisfies Meta<typeof SettingsNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
