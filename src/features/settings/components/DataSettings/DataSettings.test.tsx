import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { DataSettings } from './DataSettings';

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

describe('DataSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // jsdom doesn't implement object URLs — stubbed so the export flow
    // (real `Blob` + `<a download>` click) can run without throwing.
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('exports data and shows a success confirmation', async () => {
    const user = userEvent.setup();
    render(<DataSettings />);

    await user.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() =>
      expect(screen.getByText('Seus dados foram exportados.')).toBeInTheDocument(),
    );
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('never includes a password/token field in the exported payload', async () => {
    const createObjectURL = vi.fn((_obj: Blob) => 'blob:mock');
    URL.createObjectURL = createObjectURL;

    const user = userEvent.setup();
    render(<DataSettings />);
    await user.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
    const blob = createObjectURL.mock.calls[0]?.[0];
    if (!blob) throw new Error('expected createObjectURL to have been called with a Blob');
    const text = await blob.text();
    expect(text).not.toMatch(/password|token|secret|cookie|session/i);
    expect(text).toContain('"preferences"');
    expect(text).toContain('"profile"');
  });

  it('cancelling "Restaurar configurações" leaves the dialog without confirming', async () => {
    const user = userEvent.setup();
    render(<DataSettings />);

    await user.click(screen.getByRole('button', { name: 'Restaurar' }));
    expect(screen.getByRole('heading', { name: 'Restaurar configurações?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    // The dialog's exit transition unmounts it asynchronously.
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Restaurar configurações?' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('Configurações restauradas.')).not.toBeInTheDocument();
  });

  it('confirming "Restaurar configurações" shows a success confirmation', async () => {
    const user = userEvent.setup();
    render(<DataSettings />);

    await user.click(screen.getByRole('button', { name: 'Restaurar' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Restaurar' }));

    await waitFor(() => expect(screen.getByText('Configurações restauradas.')).toBeInTheDocument());
  });
});
