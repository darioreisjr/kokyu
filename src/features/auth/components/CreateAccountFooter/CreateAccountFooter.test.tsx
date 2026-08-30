import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { CreateAccountFooter } from './CreateAccountFooter';

describe('CreateAccountFooter', () => {
  it('renders a link back to login', () => {
    render(<CreateAccountFooter />);

    const link = screen.getByRole('link', { name: 'Entrar' });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('renders the "already have an account" prompt', () => {
    render(<CreateAccountFooter />);
    expect(screen.getByText('Já possui uma conta?')).toBeInTheDocument();
  });
});
