import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { AccountSettings } from './AccountSettings';

vi.mock('@/features/profile/services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(async () => ({
      id: 'mock-user',
      firstName: 'Dario',
      lastName: 'Reis',
      username: 'darioreis',
      bio: '',
      birthDate: new Date(2000, 0, 1),
      country: 'BR',
      region: 'SP',
      city: 'São Paulo',
      avatarUrl: null,
      email: 'dario@email.com',
    })),
  },
}));

describe('AccountSettings', () => {
  it('links "Gerenciar perfil" to /app/perfil', () => {
    render(<AccountSettings />);
    expect(screen.getByRole('link', { name: 'Gerenciar perfil' })).toHaveAttribute(
      'href',
      '/app/perfil',
    );
  });

  it('shows the account email once loaded', async () => {
    render(<AccountSettings />);
    await waitFor(() => expect(screen.getByText('dario@email.com')).toBeInTheDocument());
  });

  it('keeps the delete-account confirm button disabled until "EXCLUIR" is typed exactly', async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    const dialog = await screen.findByRole('dialog');
    const confirmationField = within(dialog).getByLabelText('Digite EXCLUIR para confirmar');
    const confirmButton = within(dialog).getByRole('button', { name: 'Excluir minha conta' });
    expect(confirmButton).toBeDisabled();

    await user.type(confirmationField, 'excluir');
    expect(confirmButton).toBeDisabled();

    await user.clear(confirmationField);
    await user.type(confirmationField, 'EXCLUIR');
    expect(confirmButton).toBeEnabled();
  });

  it('reports deletion as unavailable instead of pretending it happened', async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await user.click(within(dialog).getByRole('button', { name: 'Excluir minha conta' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'Exclusão de conta indisponível — o Kokyu ainda não tem um backend para isso.',
        ),
      ).toBeInTheDocument(),
    );
  });
});
