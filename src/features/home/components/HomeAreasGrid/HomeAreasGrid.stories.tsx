import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type {
  GoalHomeProjection,
  HabitHomeProjection,
  HomeProviderResult,
  LeisureHomeProjection,
  MissionHomeProjection,
  NutritionHomeProjection,
  TrainingHomeProjection,
} from '@/shared/home/types';
import { HomeAreasGrid } from './HomeAreasGrid';

const missions: HomeProviderResult<MissionHomeProjection> = {
  sourceType: 'mission',
  status: 'success',
  data: {
    focusToday: { id: 'm1', title: 'Implementar Scheduler', status: 'pending' },
    next: { id: 'm2', title: 'Escrever documentação', status: 'pending' },
    pendingCount: 3,
    completedCount: 2,
    overdue: [],
    waitingFollowUp: [],
  },
};

const habits: HomeProviderResult<HabitHomeProjection> = {
  sourceType: 'habit',
  status: 'success',
  data: {
    scheduledToday: 5,
    completedToday: 3,
    next: { id: 'h1', name: 'Beber água', icon: 'WaterDropRounded', timeOfDay: 'afternoon', isCompleted: false, canQuickComplete: true },
    currentRoutine: null,
    nextRoutine: null,
  },
};

const training: HomeProviderResult<TrainingHomeProjection> = {
  sourceType: 'training',
  status: 'success',
  data: { today: { id: 't1', label: 'Push A', date: '2026-09-04', time: '19:00', status: 'planned' }, next: null, hasActiveSession: false },
};

const nutrition: HomeProviderResult<NutritionHomeProjection> = {
  sourceType: 'nutrition',
  status: 'error',
  data: null,
  error: 'boom',
};

const goals: HomeProviderResult<GoalHomeProjection> = {
  sourceType: 'goal',
  status: 'success',
  data: { inFocus: [{ id: 'g1', title: 'Correr 10km', status: 'onTrack', progressPercent: 62 }], atRisk: [], pendingCheckIns: 0 },
};

const leisure: HomeProviderResult<LeisureHomeProjection> = {
  sourceType: 'leisure',
  status: 'success',
  data: { plannedToday: null, inProgress: null, backlogCount: 8 },
};

const meta = {
  title: 'Home/HomeAreasGrid',
  component: HomeAreasGrid,
  parameters: { layout: 'padded' },
  args: { missions, habits, training, nutrition, goals, leisure, onOpen: () => {} },
} satisfies Meta<typeof HomeAreasGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nutrition deliberately fails here — every other card still renders normally (see spec's "PARTIAL FAILURE"). */
export const Default: Story = {};

export const Loading: Story = { args: { isLoading: true } };
