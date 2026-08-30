import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { trainingAnalyticsService } from '../../services/trainingAnalyticsService';
import { resetTrainingDb, trainingDb } from '../../services/trainingMockDb';
import { formatWeight } from '../../utils/weightUnit';
import { TrainingProgressPage } from './TrainingProgressPage';

describe('TrainingProgressPage', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('shows the header and stat tiles computed from the seeded training data', async () => {
    render(<TrainingProgressPage />);

    expect(screen.getByRole('heading', { name: 'Progresso', level: 1 })).toBeInTheDocument();

    const summary = await trainingAnalyticsService.getTrainingAnalytics();
    expect(await screen.findByText(String(summary.minutesTrainedThisYear))).toBeInTheDocument();
    expect(screen.getByText(`${summary.weeklyFrequency}x/sem`)).toBeInTheDocument();
    expect(screen.getByText(formatWeight(summary.totalVolumeThisWeekKg, 'kg'))).toBeInTheDocument();

    [
      'Treinos (ano)',
      'Minutos (ano)',
      'Frequência',
      'Sequência',
      'Volume (semana)',
      'Total de treinos',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Consistência semanal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Progressão por exercício' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Volume semanal por músculo' })).toBeInTheDocument();
  });

  it('lets the user pick an exercise and see its progression trend inline', async () => {
    const user = userEvent.setup();
    render(<TrainingProgressPage />);

    await user.click(screen.getByLabelText('Exercício'));
    await user.click(await screen.findByRole('option', { name: 'Supino reto' }));

    expect(await screen.findByText(/1RM estimado:/)).toBeInTheDocument();
  });

  it('shows zeroed stats and an empty muscle-volume message when there is no training history', async () => {
    trainingDb.sessions = [];
    trainingDb.performedSets = [];

    render(<TrainingProgressPage />);

    expect(await screen.findByText('0x/sem')).toBeInTheDocument();
    expect(screen.getByText('Nenhum treino nos últimos 7 dias.')).toBeInTheDocument();
  });
});
