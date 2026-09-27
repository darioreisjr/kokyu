import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiValidationError, VALIDATION_ERROR_MESSAGE } from '../../../../../test/apiErrors';
import { render, screen, waitFor } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { leisureItemService } from '../../services/leisureItemService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { HobbyFormPage } from './HobbyFormPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HobbyFormPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('is a page, not a dialog, with the type locked to Hobby', () => {
    render(<HobbyFormPage />);

    expect(screen.getByRole('heading', { name: 'Novo hobby', level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Tipo')).toHaveTextContent('Hobby');
  });

  it('creates the hobby and goes back to the Hobbies list', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(leisureItemService, 'createLeisureItem');
    render(<HobbyFormPage />);

    await user.type(screen.getByLabelText('Título'), 'Jardinagem');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.hobbies));
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'hobby', title: 'Jardinagem' }),
    );
    expect(screen.getByText('Hobby salvo.')).toBeInTheDocument();
    createSpy.mockRestore();
  });

  it('saves a link pasted as Markdown with the cleaned URL (reported bug)', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(leisureItemService, 'createLeisureItem');
    render(<HobbyFormPage />);

    await user.type(screen.getByLabelText('Título'), 'Astrofotografia Básica');
    const link = screen.getByLabelText('Link (opcional)');
    await user.click(link);
    await user.paste('https://www.astrobin.com](https://www.astrobin.com)');
    await user.tab();
    expect(link).toHaveValue('https://www.astrobin.com');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.hobbies));
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ sourceUrl: 'https://www.astrobin.com' }),
    );
    createSpy.mockRestore();
  });

  it('blocks an invalid link in the form instead of sending it', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(leisureItemService, 'createLeisureItem');
    render(<HobbyFormPage />);

    await user.type(screen.getByLabelText('Título'), 'Astrofotografia');
    await user.type(screen.getByLabelText('Link (opcional)'), 'astrobin');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Informe um link válido, começando com https://'),
    ).toBeInTheDocument();
    expect(createSpy).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it('shows a pt-BR error and stays on the page with the typed data when the API rejects', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .spyOn(leisureItemService, 'createLeisureItem')
      .mockRejectedValueOnce(apiValidationError());
    render(<HobbyFormPage />);

    await user.type(screen.getByLabelText('Título'), 'Jardinagem');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Título')).toHaveValue('Jardinagem');
    createSpy.mockRestore();
  });

  it('goes back to the Hobbies list on Cancelar without saving', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(leisureItemService, 'createLeisureItem');
    render(<HobbyFormPage />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.hobbies);
    expect(createSpy).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });
});
