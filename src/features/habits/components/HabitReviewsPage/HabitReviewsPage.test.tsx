import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { HabitReviewsPage } from './HabitReviewsPage';

describe('HabitReviewsPage', () => {
  it('renders reviews page title and new review button', () => {
    render(<HabitReviewsPage />);

    expect(screen.getByRole('heading', { name: 'Revisões Periódicas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova revisão' })).toBeInTheDocument();
  });
});
