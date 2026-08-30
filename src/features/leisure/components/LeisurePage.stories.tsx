import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { HistoryPage } from './HistoryPage/HistoryPage';
import { HobbiesPage } from './HobbiesPage/HobbiesPage';
import { LaterPage } from './LaterPage/LaterPage';
import { LibraryPage } from './LibraryPage/LibraryPage';
import { NotesPage } from './NotesPage/NotesPage';
import { PlacesPage } from './PlacesPage/PlacesPage';
import { PlannerPage } from './PlannerPage/PlannerPage';
import { TodayPage } from './TodayPage/TodayPage';

/**
 * One story file covering every top-level Tempo Livre screen — each
 * variant renders a different page component against the same shared
 * mock data, the same way `?section=` variants would for a single
 * page with internal routing.
 */
const meta = {
  title: 'Kokyu Tempo Livre/LeisurePage',
  component: TodayPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TodayPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Today: Story = {};

export const Planner: Story = {
  render: () => <PlannerPage />,
};

export const Later: Story = {
  render: () => <LaterPage />,
};

export const Library: Story = {
  render: () => <LibraryPage />,
};

export const Places: Story = {
  render: () => <PlacesPage />,
};

export const Hobbies: Story = {
  render: () => <HobbiesPage />,
};

export const Notes: Story = {
  render: () => <NotesPage />,
};

export const History: Story = {
  render: () => <HistoryPage />,
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
