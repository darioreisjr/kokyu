import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { MuscleRecoveryEstimate } from '../../types';
import { MuscleRecoveryCard } from './MuscleRecoveryCard';

describe('MuscleRecoveryCard', () => {
  it('shows the muscle group name and a qualitative label for a recently trained muscle', () => {
    const estimate: MuscleRecoveryEstimate = {
      muscleGroup: 'chest',
      label: 'recentlyTrained',
      estimatedRecoveryPercent: 20,
      hoursSinceTrained: 5,
    };
    render(<MuscleRecoveryCard estimate={estimate} />);
    expect(screen.getByText('Peito')).toBeInTheDocument();
    expect(screen.getByText('Treinado recentemente')).toBeInTheDocument();
  });

  it('shows "Descanso intermediário" for a partially rested muscle', () => {
    const estimate: MuscleRecoveryEstimate = {
      muscleGroup: 'back',
      label: 'partiallyRested',
      estimatedRecoveryPercent: 55,
      hoursSinceTrained: 30,
    };
    render(<MuscleRecoveryCard estimate={estimate} />);
    expect(screen.getByText('Descanso intermediário')).toBeInTheDocument();
  });

  it('shows "Mais descansado" for a well-rested muscle never framed as an exact clinical measurement', () => {
    const estimate: MuscleRecoveryEstimate = {
      muscleGroup: 'quads',
      label: 'wellRested',
      estimatedRecoveryPercent: 100,
    };
    render(<MuscleRecoveryCard estimate={estimate} />);
    expect(screen.getByText('Mais descansado')).toBeInTheDocument();
    expect(screen.getByText('Estimativa de recuperação: 100%')).toBeInTheDocument();
  });
});
