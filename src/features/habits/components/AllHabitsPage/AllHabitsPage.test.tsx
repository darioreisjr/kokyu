import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { AllHabitsPage } from './AllHabitsPage';

describe('AllHabitsPage', () => {
  it('renders all habits title, filters, and new habit action', () => {
    render(<AllHabitsPage />);

    expect(screen.getByRole('heading', { name: 'Todos os Hábitos' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar hábitos...')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Novo hábito' })).toBeInTheDocument();
  });
});
