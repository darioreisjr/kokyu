import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { GoalKeyResult } from '../../types';
import { GoalKeyResultsList } from './GoalKeyResultsList';

const keyResults: GoalKeyResult[] = [
  {
    id: 'kr1',
    title: 'Concluir 2 cursos',
    type: 'numeric',
    baseline: 0,
    current: 1,
    target: 2,
    unit: 'units',
    weight: 50,
    status: 'inProgress',
  },
  {
    id: 'kr2',
    title: 'Publicar o app',
    type: 'binary',
    baseline: 0,
    current: 0,
    target: 1,
    unit: 'units',
    weight: 50,
    status: 'notStarted',
  },
];

describe('GoalKeyResultsList', () => {
  it('shows every key result with its weight', () => {
    render(<GoalKeyResultsList keyResults={keyResults} onUpdateCurrent={vi.fn()} />);
    expect(screen.getByText('Concluir 2 cursos')).toBeInTheDocument();
    expect(screen.getByText('Publicar o app')).toBeInTheDocument();
    expect(screen.getAllByText('Peso: 50%')).toHaveLength(2);
  });

  it('only shows an editable value field for numeric key results', () => {
    render(<GoalKeyResultsList keyResults={keyResults} onUpdateCurrent={vi.fn()} />);
    expect(screen.getAllByLabelText('Valor atual')).toHaveLength(1);
  });

  it('calls onUpdateCurrent with the new value for a numeric key result', async () => {
    const user = userEvent.setup();
    const onUpdateCurrent = vi.fn();
    render(<GoalKeyResultsList keyResults={keyResults} onUpdateCurrent={onUpdateCurrent} />);

    const input = screen.getByLabelText('Valor atual');
    await user.clear(input);
    await user.type(input, '2');
    await user.click(screen.getByRole('button', { name: 'Atualizar' }));

    expect(onUpdateCurrent).toHaveBeenCalledWith('kr1', 2);
  });
});
