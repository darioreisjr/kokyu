import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/../test/test-utils';
import { DailyPlanningDialog } from './DailyPlanningDialog';

describe('DailyPlanningDialog', () => {
  it('renders planning wizard and allows advancing steps', async () => {
    const onClose = vi.fn();
    render(
      <DailyPlanningDialog
        open={true}
        onClose={onClose}
        targetDate="2026-08-31"
      />,
    );

    expect(screen.getByText(/Planejar o Dia/)).toBeInTheDocument();
    expect(await screen.findByText('Definir Prioridades')).toBeInTheDocument();

    const advanceBtn = screen.getByRole('button', { name: 'Próximo' });
    fireEvent.click(advanceBtn);

    expect(await screen.findByText('Ajustar Alocações')).toBeInTheDocument();
  });
});

