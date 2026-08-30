import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { ConfirmActionDialog } from './ConfirmActionDialog';

describe('ConfirmActionDialog', () => {
  it('renders nothing open when there is no pending request', () => {
    render(<ConfirmActionDialog request={null} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the request title/description and a default confirm label', () => {
    render(
      <ConfirmActionDialog
        request={{
          title: 'Excluir item?',
          description: 'Isso não pode ser desfeito.',
          onConfirm: vi.fn(),
        }}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Excluir item?')).toBeInTheDocument();
    expect(screen.getByText('Isso não pode ser desfeito.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('uses a custom confirm label when given one', () => {
    render(
      <ConfirmActionDialog
        request={{
          title: 'Excluir?',
          description: '...',
          confirmLabel: 'Excluir',
          onConfirm: vi.fn(),
        }}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('calls onConfirm/onCancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmActionDialog
        request={{ title: 'X', description: 'Y', onConfirm: vi.fn() }}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    screen.getByRole('button', { name: 'Confirmar' }).click();
    expect(onConfirm).toHaveBeenCalled();
    screen.getByRole('button', { name: 'Cancelar' }).click();
    expect(onCancel).toHaveBeenCalled();
  });
});
