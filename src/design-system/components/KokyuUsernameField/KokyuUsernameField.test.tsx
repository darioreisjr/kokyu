import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuUsernameField } from './KokyuUsernameField';

describe('KokyuUsernameField', () => {
  it('renders the label and the visual "@" prefix', () => {
    render(<KokyuUsernameField label="Username" />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByText('@')).toBeInTheDocument();
  });

  it('lets the user type a value', async () => {
    const user = userEvent.setup();
    render(<KokyuUsernameField label="Username" />);

    const input = screen.getByLabelText('Username');
    await user.type(input, 'dario_reis');

    expect(input).toHaveValue('dario_reis');
  });

  it('shows a progress indicator while checking availability', () => {
    // Decorative (`aria-hidden`): the accessible signal for "checking"
    // is the paired helper text `CreateAccountForm` supplies, not this
    // icon — so it has to be queried with `hidden: true` here.
    render(<KokyuUsernameField label="Username" status="loading" />);
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('shows no progress indicator when idle', () => {
    render(<KokyuUsernameField label="Username" status="idle" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
