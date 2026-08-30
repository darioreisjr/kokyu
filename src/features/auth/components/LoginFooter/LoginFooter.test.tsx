import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { LoginFooter } from './LoginFooter';

describe('LoginFooter', () => {
  it('renders a link to account creation', () => {
    render(<LoginFooter />);

    const link = screen.getByRole('link', { name: 'Criar conta' });
    expect(link).toHaveAttribute('href', '/create-account');
  });

  it('renders the "no account yet" prompt', () => {
    render(<LoginFooter />);
    expect(screen.getByText('Ainda não tem uma conta?')).toBeInTheDocument();
  });
});
