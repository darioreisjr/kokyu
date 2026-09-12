import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { PlanEntryDialog } from './PlanEntryDialog';

describe('PlanEntryDialog', () => {
  it('shows "Planejar atividade" for a fresh entry', () => {
    render(<PlanEntryDialog open onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Planejar atividade' })).toBeInTheDocument();
  });

  it('shows "Editar planejamento" in edit mode', () => {
    render(
      <PlanEntryDialog
        open
        mode="edit"
        defaultValues={{
          title: 'Violão',
          date: '2030-01-01',
          startTime: '19:00',
          endTime: '19:45',
          duration: 45,
        }}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Editar planejamento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Violão');
  });

  it('still shows "Planejar atividade" in create mode even with a prefilled title (e.g. from an item\'s own "Planejar")', () => {
    render(
      <PlanEntryDialog
        open
        defaultValues={{ title: 'Interestelar' }}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Planejar atividade' })).toBeInTheDocument();
  });

  it('rejects saving with no title or date', async () => {
    render(<PlanEntryDialog open onClose={vi.fn()} onSave={vi.fn()} />);

    expect(await screen.findByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('keeps Salvar disabled until every required field is filled, then enables it', async () => {
    const user = userEvent.setup();
    render(
      <PlanEntryDialog
        open
        defaultValues={{ date: '2030-06-10' }}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.type(screen.getByLabelText('Título'), 'Ler O Hobbit');
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '19:00' } });
    fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '20:00' } });
    await user.type(screen.getByLabelText('Duração em minutos'), '60');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
  });

  it('saves a valid entry', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <PlanEntryDialog
        open
        defaultValues={{
          title: 'Ler O Hobbit',
          date: '2030-06-10',
          startTime: '19:00',
          endTime: '20:00',
          duration: 60,
        }}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Ler O Hobbit'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ler O Hobbit', date: '2030-06-10' }),
    );
  });

  it('closes via Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PlanEntryDialog open onClose={onClose} onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
