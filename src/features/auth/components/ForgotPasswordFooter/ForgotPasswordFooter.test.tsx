import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { ForgotPasswordFooter } from './ForgotPasswordFooter';

describe('ForgotPasswordFooter', () => {
  it('renders a link back to login', () => {
    render(<ForgotPasswordFooter />);

    const link = screen.getByRole('link', { name: 'Voltar para entrar' });
    expect(link).toHaveAttribute('href', '/login');
  });
});
