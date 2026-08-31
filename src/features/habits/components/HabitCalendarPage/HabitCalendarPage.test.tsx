import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { HabitCalendarPage } from './HabitCalendarPage';

describe('HabitCalendarPage', () => {
  it('renders calendar title and navigation buttons', () => {
    render(<HabitCalendarPage />);

    expect(screen.getByRole('heading', { name: 'Calendário de Hábitos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeInTheDocument();
  });
});
