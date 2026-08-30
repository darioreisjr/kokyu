import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { PasswordRequirements } from './PasswordRequirements';

describe('PasswordRequirements', () => {
  it('renders every requirement label', () => {
    render(<PasswordRequirements password="" />);

    expect(screen.getByText('8 ou mais caracteres')).toBeInTheDocument();
    expect(screen.getByText('Uma letra maiúscula')).toBeInTheDocument();
    expect(screen.getByText('Uma letra minúscula')).toBeInTheDocument();
    expect(screen.getByText('Um número')).toBeInTheDocument();
    expect(screen.getByText('Um caractere especial')).toBeInTheDocument();
  });

  it('marks a met requirement as such for assistive technology, not color alone', () => {
    render(<PasswordRequirements password="a" />);

    const lowercaseItem = screen.getByText('Uma letra minúscula').closest('li');
    expect(lowercaseItem).toHaveTextContent('atendido');

    const uppercaseItem = screen.getByText('Uma letra maiúscula').closest('li');
    expect(uppercaseItem).toHaveTextContent('pendente');
  });

  it('marks every requirement met for a fully valid password', () => {
    render(<PasswordRequirements password="Abcdefg1!" />);

    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item).toHaveTextContent('atendido');
    }
  });
});
