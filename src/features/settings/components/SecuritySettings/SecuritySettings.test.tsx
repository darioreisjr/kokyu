import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { SecuritySettings } from './SecuritySettings';

describe('SecuritySettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('shows 2FA as disabled and Passkeys as prepared, with disabled CTAs — no fake backend', () => {
    render(<SecuritySettings />);

    expect(screen.getByText(/Desativada/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Configurar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Gerenciar passkeys' })).toBeDisabled();
  });

  it('opens the "Alterar senha" dialog and completes a successful password change', async () => {
    const user = userEvent.setup();
    render(<SecuritySettings />);

    await user.click(screen.getByRole('button', { name: 'Alterar senha' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Alterar senha' })).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Senha atual'), 'minha-senha-atual');
    await user.type(within(dialog).getByLabelText('Nova senha'), 'NovaSenha123!');
    await user.type(within(dialog).getByLabelText('Confirmar nova senha'), 'NovaSenha123!');
    await user.click(within(dialog).getByRole('button', { name: 'Alterar senha' }));

    await waitFor(() => expect(screen.getByText('Senha alterada.')).toBeInTheDocument());
  });

  it('shows a validation error when the new password does not meet the policy', async () => {
    const user = userEvent.setup();
    render(<SecuritySettings />);

    await user.click(screen.getByRole('button', { name: 'Alterar senha' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Senha atual'), 'minha-senha-atual');
    await user.type(within(dialog).getByLabelText('Nova senha'), 'fraca');
    await user.click(within(dialog).getByRole('button', { name: 'Alterar senha' }));

    expect(
      await within(dialog).findByText('A senha não atende aos requisitos mínimos'),
    ).toBeInTheDocument();
  });

  it('shows a validation error when the confirmation does not match', async () => {
    const user = userEvent.setup();
    render(<SecuritySettings />);

    await user.click(screen.getByRole('button', { name: 'Alterar senha' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Senha atual'), 'minha-senha-atual');
    await user.type(within(dialog).getByLabelText('Nova senha'), 'NovaSenha123!');
    await user.type(within(dialog).getByLabelText('Confirmar nova senha'), 'Diferente123!');
    await user.click(within(dialog).getByRole('button', { name: 'Alterar senha' }));

    expect(await within(dialog).findByText('As senhas não coincidem')).toBeInTheDocument();
  });
});
