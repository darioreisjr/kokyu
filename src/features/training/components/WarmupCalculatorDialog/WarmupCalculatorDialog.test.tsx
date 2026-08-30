import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { WarmupCalculatorDialog } from './WarmupCalculatorDialog';

describe('WarmupCalculatorDialog', () => {
  it('defaults to a 60kg×8 working set and shows a 3-step warmup ramp', () => {
    render(<WarmupCalculatorDialog open onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Calculadora de aquecimento' })).toBeInTheDocument();
    expect(screen.getByText('24kg × 8 (40%)')).toBeInTheDocument();
    expect(screen.getByText('39kg × 6 (65%)')).toBeInTheDocument();
    expect(screen.getByText('54kg × 3 (90%)')).toBeInTheDocument();
  });

  it('recomputes the ramp when the user edits the working weight/reps', async () => {
    const user = userEvent.setup();
    render(
      <WarmupCalculatorDialog
        open
        onClose={vi.fn()}
        initialWorkingWeightKg={100}
        initialWorkingReps={5}
      />,
    );
    await user.clear(screen.getByLabelText('Peso de trabalho (kg)'));
    await user.type(screen.getByLabelText('Peso de trabalho (kg)'), '40');
    await user.clear(screen.getByLabelText('Repetições de trabalho'));
    await user.type(screen.getByLabelText('Repetições de trabalho'), '10');
    expect(screen.getByText('16kg × 8 (40%)')).toBeInTheDocument();
    expect(screen.getByText('26kg × 6 (65%)')).toBeInTheDocument();
    expect(screen.getByText('36kg × 3 (90%)')).toBeInTheDocument();
  });

  it('closes via the Fechar button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WarmupCalculatorDialog open onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
