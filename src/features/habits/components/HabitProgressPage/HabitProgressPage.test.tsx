import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { HabitProgressPage } from './HabitProgressPage';

describe('HabitProgressPage', () => {
  it('renders progress page title, consistency score, and weekly rhythm', async () => {
    render(<HabitProgressPage />);

    expect(
      await screen.findByRole('heading', { name: 'Progresso & Análise de Consistência' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Consistência Geral (30d)')).toBeInTheDocument();
    expect(await screen.findByText('Ritmo Semanal')).toBeInTheDocument();
  });
});
