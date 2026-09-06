import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { PasswordStrength } from './PasswordStrength';

describe('PasswordStrength', () => {
  it('renders nothing for an empty password', () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('labels a weak password', () => {
    render(<PasswordStrength password="abc" />);
    expect(screen.getByText(/Fraca/)).toBeInTheDocument();
  });

  it('labels a medium password', () => {
    render(<PasswordStrength password="abcdefghijkl1" />);
    expect(screen.getByText(/Média/)).toBeInTheDocument();
  });

  it('labels a strong password', () => {
    render(<PasswordStrength password="Abcdefgh123!" />);
    expect(screen.getByText(/Forte/)).toBeInTheDocument();
  });
});
