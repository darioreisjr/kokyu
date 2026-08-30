import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { ProfileAccountInfo } from './ProfileAccountInfo';

describe('ProfileAccountInfo', () => {
  it('shows the email as read-only', () => {
    render(<ProfileAccountInfo email="dario@email.com" />);

    const emailField = screen.getByLabelText('E-mail');
    expect(emailField).toHaveValue('dario@email.com');
    expect(emailField).toHaveAttribute('readonly');
    expect(emailField).toBeDisabled();
  });

  it('labels it as the account email', () => {
    render(<ProfileAccountInfo email="dario@email.com" />);
    expect(screen.getByText('E-mail da conta')).toBeInTheDocument();
  });
});
