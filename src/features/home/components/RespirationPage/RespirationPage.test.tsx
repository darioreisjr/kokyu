import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../../../../test/test-utils';
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

    await waitFor(() => expect(screen.getByText('Missões')).toBeInTheDocument());
    expect(screen.getByText('Hábitos')).toBeInTheDocument();
    expect(screen.getByText('Treinamento')).toBeInTheDocument();
    expect(screen.getByText('Nutrição')).toBeInTheDocument();
    expect(screen.getByText('Metas')).toBeInTheDocument();
    expect(screen.getByText('Tempo Livre')).toBeInTheDocument();
  });

  it('opens the personalization dialog', async () => {
    render(<RespirationPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Agora' })).toBeInTheDocument());

    fireEvent.click(screen.getByText('Personalizar Respiração'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Seções')).toBeInTheDocument();
  });
});
