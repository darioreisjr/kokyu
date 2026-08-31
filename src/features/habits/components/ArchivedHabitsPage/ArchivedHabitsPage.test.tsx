import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import { ArchivedHabitsPage } from './ArchivedHabitsPage';

describe('ArchivedHabitsPage', () => {
  it('renders archived page title', () => {
    render(<ArchivedHabitsPage />);

    expect(screen.getByRole('heading', { name: 'Hábitos Arquivados' })).toBeInTheDocument();
  });
});
