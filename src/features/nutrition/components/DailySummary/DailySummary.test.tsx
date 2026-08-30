import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { DailySummary } from './DailySummary';

describe('DailySummary', () => {
  it('shows planned meals and missing ingredients counts', () => {
    render(<DailySummary plannedCount={2} totalSlots={6} missingIngredientsCount={3} />);
    expect(screen.getByText('2 de 6')).toBeInTheDocument();
    expect(screen.getByText('3 itens')).toBeInTheDocument();
  });

  it('uses the singular form for exactly 1 missing ingredient', () => {
    render(<DailySummary plannedCount={0} totalSlots={6} missingIngredientsCount={1} />);
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('shows the next meal with a time when provided', () => {
    render(
      <DailySummary
        plannedCount={1}
        totalSlots={6}
        missingIngredientsCount={0}
        nextMeal={{ label: 'Almoço', time: '12:30' }}
      />,
    );
    expect(screen.getByText('Almoço - 12:30')).toBeInTheDocument();
  });

  it('shows just the next meal label when it has no time', () => {
    render(
      <DailySummary
        plannedCount={1}
        totalSlots={6}
        missingIngredientsCount={0}
        nextMeal={{ label: 'Almoço' }}
      />,
    );
    expect(screen.getByText('Almoço')).toBeInTheDocument();
  });

  it('omits the next-meal stat entirely when there is none', () => {
    render(<DailySummary plannedCount={0} totalSlots={6} missingIngredientsCount={0} />);
    expect(screen.queryByText('Próxima refeição')).not.toBeInTheDocument();
  });
});
