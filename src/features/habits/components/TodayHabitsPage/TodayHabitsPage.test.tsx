import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { TodayHabitsPage } from './TodayHabitsPage';

describe('TodayHabitsPage', () => {
  it('renders today page title and action buttons', () => {
    render(<TodayHabitsPage />);

    expect(screen.getByRole('heading', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Novo hábito' })).toBeInTheDocument();
  });
});
