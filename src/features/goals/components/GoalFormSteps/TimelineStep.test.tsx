import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { goalFormDefaultValues, type GoalFormValues } from '../../schemas/goalSchema';
import { TimelineStep } from './TimelineStep';

function Harness() {
  const { control, watch } = useForm<GoalFormValues>({
    defaultValues: { ...goalFormDefaultValues, startDate: '2026-01-01' },
  });
  return (
    <>
      <TimelineStep control={control} />
      <output data-testid="target-date">{watch('targetDate')}</output>
    </>
  );
}

describe('TimelineStep', () => {
  it('defaults to "Sem prazo" checked and no date field shown', () => {
    render(<Harness />);
    expect(screen.getByRole('checkbox', { name: 'Sem prazo' })).toBeChecked();
    expect(screen.queryByRole('group', { name: 'Prazo' })).not.toBeInTheDocument();
  });

  it('reveals the deadline field once "Sem prazo" is unchecked', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('checkbox', { name: 'Sem prazo' }));
    expect(screen.getByRole('group', { name: 'Prazo' })).toBeInTheDocument();
    expect(screen.getByTestId('target-date')).not.toHaveTextContent('');
  });

  it('shows the start date field', () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: 'Data inicial' })).toBeInTheDocument();
  });
});
