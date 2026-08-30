import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('shows the type-specific label for a status', () => {
    render(<StatusChip type="movie" status="backlog" />);
    expect(screen.getByText('Para assistir')).toBeInTheDocument();
  });

  it('shows the generic label when there is no type-specific override', () => {
    render(<StatusChip type="custom" status="paused" />);
    expect(screen.getByText('Pausado')).toBeInTheDocument();
  });

  it('renders a distinct label for each status family', () => {
    render(
      <>
        <StatusChip type="book" status="inProgress" />
        <StatusChip type="book" status="completed" />
      </>,
    );
    expect(screen.getByText('Lendo')).toBeInTheDocument();
    expect(screen.getByText('Lido')).toBeInTheDocument();
  });
});
