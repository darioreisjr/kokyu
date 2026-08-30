import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { getGoalTypeOptionDefinition } from '../../constants/goalTypeOptions';
import { MeasurementTypeStep } from './MeasurementTypeStep';

describe('MeasurementTypeStep', () => {
  it('marks the selected option as checked', () => {
    render(<MeasurementTypeStep selectedId="number" onSelect={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /Número/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Etapas/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onSelect with the full option definition on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MeasurementTypeStep selectedId="number" onSelect={onSelect} />);
    await user.click(screen.getByRole('radio', { name: /Etapas/ }));
    expect(onSelect).toHaveBeenCalledWith(getGoalTypeOptionDefinition('steps'));
  });

  it('selects an option via the keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MeasurementTypeStep selectedId="number" onSelect={onSelect} />);
    screen.getByRole('radio', { name: /Resultados/ }).focus();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith(getGoalTypeOptionDefinition('keyResult'));
  });
});
