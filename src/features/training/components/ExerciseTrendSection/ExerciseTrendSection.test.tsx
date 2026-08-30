import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { trainingAnalyticsService } from '../../services/trainingAnalyticsService';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { formatWeight } from '../../utils/weightUnit';
import { ExerciseTrendSection } from './ExerciseTrendSection';

describe('ExerciseTrendSection', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('asks the user to pick an exercise before showing any chart', () => {
    render(<ExerciseTrendSection weightUnit="kg" />);
    expect(screen.getByText('Selecione um exercício para ver sua evolução.')).toBeInTheDocument();
  });

  it('shows the estimated 1RM trend caption once an exercise with completed sessions is selected', async () => {
    const user = userEvent.setup();
    render(<ExerciseTrendSection weightUnit="kg" />);

    await user.click(screen.getByLabelText('Exercício'));
    await user.click(await screen.findByRole('option', { name: 'Supino reto' }));

    const trend = await trainingAnalyticsService.getExerciseTrend('exercise-supino-reto');
    const first = trend[0]!;
    const last = trend[trend.length - 1]!;
    const expectedCaption = `1RM estimado: de ${formatWeight(first.value, 'kg')} em ${new Date(first.date).toLocaleDateString('pt-BR')} para ${formatWeight(last.value, 'kg')} em ${new Date(last.date).toLocaleDateString('pt-BR')}.`;

    expect(await screen.findByText(expectedCaption)).toBeInTheDocument();
  });

  it("falls back to the chart's own empty message for an exercise never performed in a completed session", async () => {
    const user = userEvent.setup();
    render(<ExerciseTrendSection weightUnit="kg" />);

    await user.click(screen.getByLabelText('Exercício'));
    await user.click(await screen.findByRole('option', { name: 'Crucifixo com halteres' }));

    expect(await screen.findByText('Sem dados suficientes ainda.')).toBeInTheDocument();
  });
});
