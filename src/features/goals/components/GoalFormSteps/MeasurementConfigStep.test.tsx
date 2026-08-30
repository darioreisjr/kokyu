import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { goalFormDefaultValues, type GoalFormValues } from '../../schemas/goalSchema';
import type { GoalKeyResult, GoalMilestone, GoalType } from '../../types';
import { MeasurementConfigStep } from './MeasurementConfigStep';

function Harness({
  type,
  onMilestonesChange = vi.fn(),
  onKeyResultsChange = vi.fn(),
}: {
  type: GoalType;
  onMilestonesChange?: (m: GoalMilestone[]) => void;
  onKeyResultsChange?: (k: GoalKeyResult[]) => void;
}) {
  const { control, register } = useForm<GoalFormValues>({
    defaultValues: { ...goalFormDefaultValues, type },
  });
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [keyResults, setKeyResults] = useState<GoalKeyResult[]>([]);
  return (
    <MeasurementConfigStep
      type={type}
      control={control}
      register={register}
      milestones={milestones}
      onMilestonesChange={(next) => {
        setMilestones(next);
        onMilestonesChange(next);
      }}
      keyResults={keyResults}
      onKeyResultsChange={(next) => {
        setKeyResults(next);
        onKeyResultsChange(next);
      }}
    />
  );
}

describe('MeasurementConfigStep — numeric/consistency/average', () => {
  it('shows direction, unit, baseline/current/target for a numeric goal', () => {
    render(<Harness type="numeric" />);
    expect(screen.getByLabelText('Direção')).toBeInTheDocument();
    expect(screen.getByLabelText('Unidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor inicial (baseline)')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor atual')).toBeInTheDocument();
    expect(screen.getByLabelText('Alvo')).toBeInTheDocument();
    expect(screen.getByLabelText(/Permitir superar o alvo/)).toBeInTheDocument();
  });

  it('hides "Direção" but shows "Período" for a consistency goal', () => {
    render(<Harness type="consistency" />);
    expect(screen.queryByLabelText('Direção')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Período (dias)')).toBeInTheDocument();
  });

  it('shows "Período" for an average goal', () => {
    render(<Harness type="average" />);
    expect(screen.getByLabelText('Período (dias)')).toBeInTheDocument();
  });
});

describe('MeasurementConfigStep — binary', () => {
  it('shows no measurement fields, just an explanatory note', () => {
    render(<Harness type="binary" />);
    expect(screen.queryByLabelText('Alvo')).not.toBeInTheDocument();
    expect(screen.getByText(/não precisa de número/)).toBeInTheDocument();
  });
});

describe('MeasurementConfigStep — milestone', () => {
  it('adds and removes a milestone', async () => {
    const user = userEvent.setup();
    const onMilestonesChange = vi.fn();
    render(<Harness type="milestone" onMilestonesChange={onMilestonesChange} />);

    await user.type(screen.getByLabelText('Novo marco'), 'Definir o MVP');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onMilestonesChange).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Definir o MVP', completed: false }),
    ]);
    expect(await screen.findByText('Definir o MVP')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Remover marco/ }));
    expect(onMilestonesChange).toHaveBeenLastCalledWith([]);
  });

  it('never adds a blank milestone', async () => {
    const user = userEvent.setup();
    const onMilestonesChange = vi.fn();
    render(<Harness type="milestone" onMilestonesChange={onMilestonesChange} />);
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onMilestonesChange).not.toHaveBeenCalled();
  });

  it('adds a milestone on Enter', async () => {
    const user = userEvent.setup();
    const onMilestonesChange = vi.fn();
    render(<Harness type="milestone" onMilestonesChange={onMilestonesChange} />);
    await user.type(screen.getByLabelText('Novo marco'), 'Publicar{Enter}');
    expect(onMilestonesChange).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Publicar' }),
    ]);
  });
});

describe('MeasurementConfigStep — keyResult', () => {
  it('adds and removes a key result', async () => {
    const user = userEvent.setup();
    const onKeyResultsChange = vi.fn();
    render(<Harness type="keyResult" onKeyResultsChange={onKeyResultsChange} />);

    await user.type(screen.getByLabelText('Novo resultado'), 'Concluir 2 cursos');
    await user.type(screen.getByLabelText('Alvo'), '2');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onKeyResultsChange).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Concluir 2 cursos', target: 2 }),
    ]);
    expect(await screen.findByText(/Concluir 2 cursos/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Remover resultado/ }));
    expect(onKeyResultsChange).toHaveBeenLastCalledWith([]);
  });

  it('never adds a key result without both a title and a target', async () => {
    const user = userEvent.setup();
    const onKeyResultsChange = vi.fn();
    render(<Harness type="keyResult" onKeyResultsChange={onKeyResultsChange} />);
    await user.type(screen.getByLabelText('Novo resultado'), 'Sem alvo');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onKeyResultsChange).not.toHaveBeenCalled();
  });
});
