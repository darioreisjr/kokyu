import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { GoalStatusChip } from './GoalStatusChip';

describe('GoalStatusChip', () => {
  it('renders the pt-BR label for each status', () => {
    render(<GoalStatusChip status="atRisk" />);
    expect(screen.getByText('Em risco')).toBeInTheDocument();
  });

  it('never uses punitive language', () => {
    render(<GoalStatusChip status="abandoned" />);
    expect(screen.queryByText(/falhou/i)).not.toBeInTheDocument();
    expect(screen.getByText('Encerrada')).toBeInTheDocument();
  });
});
