import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { authService } from '../../../auth';
import { SessionCheckError } from './SessionCheckError';

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock('../../../auth', () => ({
  authService: {
    signOut: vi.fn(async () => undefined),
  },
}));

const mockedSignOut = vi.mocked(authService.signOut);

describe('SessionCheckError', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockedSignOut.mockClear();
  });

  it('shows a clear error message and never renders app content', () => {
    render(<SessionCheckError />);

    expect(screen.getByText('Não foi possível verificar sua sessão')).toBeInTheDocument();
  });

  it('retries by refreshing the current route, without navigating anywhere', async () => {
    const user = userEvent.setup();
    render(<SessionCheckError />);

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('signs out through authService and navigates to /login — the one action that actually breaks the loop', async () => {
    const user = userEvent.setup();
    render(<SessionCheckError />);

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(mockedSignOut).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });
});
