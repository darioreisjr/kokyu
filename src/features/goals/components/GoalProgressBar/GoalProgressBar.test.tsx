import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { GoalProgressBar } from './GoalProgressBar';

describe('GoalProgressBar', () => {
  it('renders the generated accessible caption when no override label is given', () => {
    render(<GoalProgressBar current={8} target={20} percent={40} unit="books" />);
    expect(screen.getByText('Progresso: 8 de 20 livros, 40%.')).toBeInTheDocument();
  });

  it('renders an override label when given', () => {
    render(
      <GoalProgressBar
        current={2}
        target={4}
        percent={50}
        unit="units"
        label="2 de 4 marcos concluídos (50%)."
      />,
    );
    expect(screen.getByText('2 de 4 marcos concluídos (50%).')).toBeInTheDocument();
  });

  it('hides the visual bar from assistive tech since the text carries the same meaning', () => {
    render(<GoalProgressBar current={8} target={20} percent={40} unit="books" />);
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
