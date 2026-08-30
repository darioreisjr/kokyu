import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { QuickCaptureDialog } from './QuickCaptureDialog';

describe('QuickCaptureDialog', () => {
  it('saves with just a title, type left as "Ainda não sei"', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<QuickCaptureDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText('Título'), 'Restaurante que o Bruno indicou');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Restaurante que o Bruno indicou', type: '' }),
    );
  });

  it('shows a validation error for an empty title', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<QuickCaptureDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe um título')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('lets a type be chosen explicitly', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<QuickCaptureDialog open onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText('Título'), 'Duna');
    await user.click(screen.getByLabelText('Tipo (opcional)'));
    await user.click(screen.getByRole('option', { name: 'Filme' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Duna', type: 'movie' }));
  });

  it('closes via Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<QuickCaptureDialog open onClose={onClose} onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
