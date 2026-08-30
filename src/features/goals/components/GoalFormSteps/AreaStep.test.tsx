import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { goalFormDefaultValues, type GoalFormValues } from '../../schemas/goalSchema';
import { AreaStep } from './AreaStep';

function Harness() {
  const { control, watch } = useForm<GoalFormValues>({ defaultValues: goalFormDefaultValues });
  return (
    <>
      <AreaStep control={control} />
      <output data-testid="area-value">{watch('area')}</output>
    </>
  );
}

describe('AreaStep', () => {
  it('defaults to "Pessoal"', () => {
    render(<Harness />);
    expect(screen.getByRole('radio', { name: 'Pessoal' })).toHaveAttribute('aria-checked', 'true');
  });

  it('selects a different area on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('radio', { name: 'Tempo Livre' }));
    expect(screen.getByRole('radio', { name: 'Tempo Livre' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByTestId('area-value')).toHaveTextContent('leisure');
  });

  it('selects an area via the keyboard', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('radio', { name: 'Trabalho' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('radio', { name: 'Trabalho' })).toHaveAttribute('aria-checked', 'true');
  });
});
