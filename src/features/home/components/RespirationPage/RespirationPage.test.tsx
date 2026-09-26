import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetGoalDb } from '@/features/goals/services/goalMockDb';
import { resetHabitDb } from '@/features/habits/services/habitMockDb';
import { resetLeisureDb } from '@/features/leisure/services/leisureMockDb';
import { resetNutritionDb } from '@/features/nutrition/services/nutritionMockDb';
import { resetTrainingDb } from '@/features/training/services/trainingMockDb';
import { resetScheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import { RespirationPage } from './RespirationPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {} }),
}));

describe('RespirationPage', () => {
  beforeEach(() => {
    resetScheduleDb();
    resetHabitDb();
    resetTrainingDb();
    resetNutritionDb();
    resetGoalDb();
    resetLeisureDb();
  });

  it('renders the core sections once the snapshot loads', async () => {
    render(<RespirationPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Agora' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Próximo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Em foco' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Áreas de hoje' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Respiração', level: 1 })).toBeInTheDocument();
  });

  it('shows a compact card for every domain area', async () => {
    render(<RespirationPage />);

    // Scoped to the areas grid: "Agora"/"Próximo" can also show an area's
    // name (e.g. a meal labelled "Nutrição") depending on the time of day.
    const areas = await screen.findByRole('region', { name: 'Áreas de hoje' });
    await waitFor(() => expect(within(areas).getByText('Missões')).toBeInTheDocument());
    expect(within(areas).getByText('Hábitos')).toBeInTheDocument();
    expect(within(areas).getByText('Treinamento')).toBeInTheDocument();
    expect(within(areas).getByText('Nutrição')).toBeInTheDocument();
    expect(within(areas).getByText('Metas')).toBeInTheDocument();
    expect(within(areas).getByText('Tempo Livre')).toBeInTheDocument();
  });

  it('opens the personalization dialog', async () => {
    render(<RespirationPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Agora' })).toBeInTheDocument());

    fireEvent.click(screen.getByText('Personalizar Respiração'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Seções')).toBeInTheDocument();
  });
});
