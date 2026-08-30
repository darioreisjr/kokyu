import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { muscleGroupLabels } from '../../constants/muscleGroups';
import { trainingAnalyticsService } from '../../services/trainingAnalyticsService';
import { resetTrainingDb, trainingDb } from '../../services/trainingMockDb';
import { MuscleVolumeHeatmap } from './MuscleVolumeHeatmap';

describe('MuscleVolumeHeatmap', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('lists each trained muscle group with its direct-set count over the trailing 7 days', async () => {
    render(<MuscleVolumeHeatmap />);

    const entries = await trainingAnalyticsService.getMuscleVolumeBreakdown(7);
    expect(entries.length).toBeGreaterThan(0);

    const topEntry = entries[0]!;
    expect(await screen.findByText(muscleGroupLabels[topEntry.muscleGroup])).toBeInTheDocument();
    expect(screen.getByText(`${topEntry.directSets} séries diretas`)).toBeInTheDocument();
  });

  it('shows an empty message when nothing was trained in the last 7 days', async () => {
    trainingDb.sessions = [];
    render(<MuscleVolumeHeatmap />);
    expect(await screen.findByText('Nenhum treino nos últimos 7 dias.')).toBeInTheDocument();
  });
});
