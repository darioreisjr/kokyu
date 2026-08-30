import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { authService } from '../../../auth';
import { AuthenticatedShell } from './AuthenticatedShell';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('../../../auth', () => ({
  authService: {
    signOut: vi.fn(async () => undefined),
  },
}));

const mockedSignOut = vi.mocked(authService.signOut);

describe('AuthenticatedShell', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockedSignOut.mockClear();
  });

  it('renders the menu and the page content together', () => {
    render(
      <AuthenticatedShell>
        <div>Conteúdo da página</div>
      </AuthenticatedShell>,
    );

    expect(screen.getByRole('link', { name: 'Respiração' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  it('signs out through authService and navigates to /login when "Sair" is used', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedShell>
        <div>Conteúdo</div>
      </AuthenticatedShell>,
    );

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(mockedSignOut).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });
});
