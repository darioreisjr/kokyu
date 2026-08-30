import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { mockTrainingPreferences } from '../../mocks/trainingPreferences.mock';
import { PlateCalculatorDialog } from './PlateCalculatorDialog';

describe('PlateCalculatorDialog', () => {
  it('starts from the bar weight alone and needs no plates when no target is given', () => {
    render(<PlateCalculatorDialog open onClose={vi.fn()} preferences={mockTrainingPreferences} />);
    expect(screen.getByRole('heading', { name: 'Calculadora de anilhas' })).toBeInTheDocument();
    expect(screen.getByText('Nenhuma anilha necessária.')).toBeInTheDocument();
    expect(screen.getByText('Total: 20kg')).toBeInTheDocument();
  });

  it('breaks a target weight down into plates per side as the user edits the fields', async () => {
    const user = userEvent.setup();
    render(
      <PlateCalculatorDialog
        open
        onClose={vi.fn()}
        preferences={mockTrainingPreferences}
        initialTargetWeightKg={100}
      />,
    );
    expect(screen.getByText('25 + 15')).toBeInTheDocument();
    expect(screen.getByText('Total: 100kg')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Peso desejado (kg)'));
    await user.type(screen.getByLabelText('Peso desejado (kg)'), '101');
    expect(
      screen.getByText(/Total: 100kg \(mais próximo possível — faltam 1kg\)/),
    ).toBeInTheDocument();
  });

  it('closes via the Fechar button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PlateCalculatorDialog open onClose={onClose} preferences={mockTrainingPreferences} />);
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
