import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { SettingsPage } from './SettingsPage';

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

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to "Geral" with no ?section= param', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Geral', level: 2 })).toBeInTheDocument();
  });

  it('renders the category from ?section=', () => {
    mockSearchParams = new URLSearchParams('section=aparencia');
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Aparência', level: 2 })).toBeInTheDocument();
  });

  it('selecting a category in the navigation pushes ?section= for it', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const nav = screen.getByRole('navigation', { name: 'Categorias de configurações' });
    await user.click(within(nav).getByText('Rotina'));

    expect(mockPush).toHaveBeenCalledWith('/app/configuracoes?section=rotina', { scroll: false });
  });

  it('shows the search box', () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText('Buscar configurações')).toBeInTheDocument();
  });

  it('searching and selecting a result navigates to its section and anchor', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const search = screen.getByLabelText('Buscar configurações');
    await user.type(search, 'contraste');
    const option = await screen.findByRole('option', { name: 'Contraste' });
    await user.click(option);

    expect(mockPush).toHaveBeenCalledWith(
      '/app/configuracoes?section=aparencia#setting-aparencia-contraste',
      { scroll: false },
    );
  });

  it('the mobile back button returns to the base route', async () => {
    mockSearchParams = new URLSearchParams('section=aparencia');
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Voltar para as categorias' }));
    expect(mockPush).toHaveBeenCalledWith('/app/configuracoes', { scroll: false });
  });

  it('loads the account email once the "Conta" category is shown', async () => {
    mockSearchParams = new URLSearchParams('section=conta');
    render(<SettingsPage />);
    await waitFor(() => expect(screen.getByText('dario@email.com')).toBeInTheDocument());
  });
});
