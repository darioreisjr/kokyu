import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuPasswordField } from './KokyuPasswordField';

describe('KokyuPasswordField', () => {
  it('hides the password by default', () => {
    render(<KokyuPasswordField label="Senha" />);
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('reveals the password when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<KokyuPasswordField label="Senha" />);

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeInTheDocument();
  });

  it('hides the password again when toggled a second time', async () => {
    const user = userEvent.setup();
    render(<KokyuPasswordField label="Senha" />);

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('toggles visibility from the keyboard', async () => {
    const user = userEvent.setup();
    render(<KokyuPasswordField label="Senha" />);

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
  });

  it('surfaces validation error state and message', () => {
    render(<KokyuPasswordField label="Senha" error helperText="Informe sua senha" />);
    expect(screen.getByText('Informe sua senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInvalid();
  });
});
