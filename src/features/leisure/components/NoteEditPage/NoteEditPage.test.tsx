import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { NoteEditPage } from './NoteEditPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('NoteEditPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads the note by id and prefills the edit form', async () => {
    render(<NoteEditPage noteId="note-recomendacao-joao" />);

    expect(await screen.findByRole('heading', { name: 'Editar nota' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título (opcional)')).toHaveValue('Recomendação do João');
  });

  it('shows an error state when the note cannot be found', async () => {
    render(<NoteEditPage noteId="missing-note" />);

    expect(
      await screen.findByText('Não foi possível carregar esta nota agora. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
