import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { LeisureItemDialog } from './LeisureItemDialog';

describe('LeisureItemDialog', () => {
  it('shows "Novo item" and defaults the type to Filme', () => {
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Novo item' })).toBeInTheDocument();
  });

  it('rejects saving with an empty title', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe um título')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a movie with the default type', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText('Título'), 'Duna');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Duna', type: 'movie' }));
  });

  it('saves a tag typed without Enter, lower-cased (regression: tags were silently dropped)', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText('Título'), 'Duna');
    await user.type(screen.getByLabelText('Tags (opcional)'), 'Ficção Científica');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ tags: ['ficção científica'] }));
  });

  it('suggests the context tags', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={vi.fn()} />);

    await user.click(screen.getByLabelText('Tags (opcional)'));

    expect(await screen.findByRole('option', { name: 'em-casa' })).toBeInTheDocument();
  });

  it('shows author/pages fields only for a book', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByLabelText('Autor')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Livro' }));

    expect(screen.getByLabelText('Autor')).toBeInTheDocument();
    expect(screen.getByLabelText('Páginas')).toBeInTheDocument();
  });

  it('shows category/address/city fields only for a place', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={vi.fn()} />);

    await user.click(screen.getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Lugar' }));

    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Endereço (opcional)')).toBeInTheDocument();
  });

  it('locks the type when lockedType is given', () => {
    render(<LeisureItemDialog open lockedType="hobby" onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByLabelText('Tipo')).toHaveAttribute('aria-disabled', 'true');
  });

  it('offers the estimatedDuration field only when duration is fixed', async () => {
    const user = userEvent.setup();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByLabelText('Duração (min)')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Duração'));
    await user.click(screen.getByRole('option', { name: 'Fixa' }));
    expect(screen.getByLabelText('Duração (min)')).toBeInTheDocument();
  });

  it('includes a pasted cover image link in the saved payload', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<LeisureItemDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText('Título'), 'Duna');
    await user.type(screen.getByLabelText('Link da imagem (opcional)'), 'https://x.test/duna.jpg');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: 'https://x.test/duna.jpg' }),
    );
  });

  it('closes via Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LeisureItemDialog open onClose={onClose} onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('saves when given the API’s nulls as default values (regression: Organizar did nothing)', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const fromApi = {
      title: 'Duna: Parte Dois',
      description: null,
      sourceUrl: null,
    } as unknown as {
      title: string;
    };
    render(<LeisureItemDialog open defaultValues={fromApi} onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Duna: Parte Dois' }));
  });
});
