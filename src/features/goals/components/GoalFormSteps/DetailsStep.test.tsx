import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { goalFormDefaultValues, type GoalFormValues } from '../../schemas/goalSchema';
import { DetailsStep } from './DetailsStep';

function Harness({ defaultValues }: { defaultValues?: Partial<GoalFormValues> } = {}) {
  const { control, register, watch } = useForm<GoalFormValues>({
    defaultValues: { ...goalFormDefaultValues, ...defaultValues },
  });
  return <DetailsStep control={control} register={register} watch={watch} />;
}

describe('DetailsStep', () => {
  it('changes the priority', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText('Prioridade'));
    await user.click(await screen.findByRole('option', { name: 'Foco atual' }));
    expect(screen.getByLabelText('Prioridade')).toHaveTextContent('Foco atual');
  });

  it('changes the check-in reminder frequency', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText('Lembrete de check-in'));
    await user.click(await screen.findByRole('option', { name: 'Semanal' }));
    expect(screen.getByLabelText('Lembrete de check-in')).toHaveTextContent('Semanal');
  });

  it('adds a tag on Enter and removes it via the chip', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const tagField = screen.getByLabelText('Tags (opcional)');
    await user.type(tagField, 'leitura{Enter}');
    expect(screen.getByText('leitura')).toBeInTheDocument();
    expect(tagField).toHaveValue('');

    await user.click(screen.getByTestId('CloseRoundedIcon'));
    expect(screen.queryByText('leitura')).not.toBeInTheDocument();
  });

  it('never adds a duplicate tag', async () => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{ tags: ['leitura'] }} />);
    await user.type(screen.getByLabelText('Tags (opcional)'), 'leitura{Enter}');
    expect(screen.getAllByText('leitura')).toHaveLength(1);
  });

  it('fills motivation and success criteria', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText(/Por que isso importa/), 'Quero evoluir');
    await user.type(screen.getByLabelText(/Como você saberá/), 'Vou concluir 20 livros');
    expect(screen.getByLabelText(/Por que isso importa/)).toHaveValue('Quero evoluir');
  });

  it('shows more quality hints as more fields are filled', () => {
    const { unmount } = render(<Harness />);
    const initialHints = screen.queryAllByText(/·/).length;
    expect(initialHints).toBe(0);
    unmount();

    render(
      <Harness
        defaultValues={{
          title: 'Ler 20 livros',
          targetDate: '2026-12-31',
          motivation: 'Porque sim',
          targetValue: 20,
        }}
      />,
    );
    expect(screen.getAllByText(/·/).length).toBeGreaterThan(initialHints);
  });
});
