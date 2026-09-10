import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { leisurePlanService } from '../../services/leisurePlanService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import type { LeisurePlanEntry } from '../../types/leisurePlan.types';
import { PlanEntryFormPage } from './PlanEntryFormPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function buildEntry(overrides: Partial<LeisurePlanEntry> = {}): LeisurePlanEntry {
  return {
    id: 'plan-violao-hoje',
    leisureItemId: 'hobby-violao',
    title: 'Violão',
    date: '2030-01-01',
    occurrenceDate: '2030-01-01',
    startTime: '19:00',
    duration: 45,
    completed: false,
    createdAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PlanEntryFormPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('shows "Planejar atividade" in create mode', () => {
    render(<PlanEntryFormPage mode="create" />);
    expect(screen.getByRole('heading', { name: 'Planejar atividade' })).toBeInTheDocument();
  });

  it('shows "Editar planejamento" in edit mode, prefilled with the entry', () => {
    render(<PlanEntryFormPage mode="edit" initialEntry={buildEntry()} />);
    expect(screen.getByRole('heading', { name: 'Editar planejamento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Violão');
  });

  it('rejects saving with no title or date', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" />);

    await user.clear(screen.getByLabelText('Título'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe um título')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('creates a new entry and navigates back to the planner', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" defaultDate="2030-06-10" />);

    await user.type(screen.getByLabelText('Título'), 'Ler O Hobbit');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner));
    const entries = await leisurePlanService.getLeisurePlan('2030-06-10', '2030-06-10');
    expect(entries.some((entry) => entry.title === 'Ler O Hobbit')).toBe(true);
  });

  it('updates an existing entry and navigates back to the planner', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="edit" initialEntry={buildEntry()} />);
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Violão'));

    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'Violão (aula avançada)');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner));
    const updated = await leisurePlanService.getPlanEntry('plan-violao-hoje');
    expect(updated.title).toBe('Violão (aula avançada)');
  });

  it('saves an entry whose optional fields came back as `null` from the API, unchanged', async () => {
    // The real backend sends `null` (a nullable DB column), never
    // `undefined`, for an unset startTime/endTime/duration/notes - the
    // frontend type says `string | undefined`, but the runtime value can
    // still be `null`. Saving without touching any field must not trip
    // the form's `.optional()` (not `.nullable()`) zod schema.
    const user = userEvent.setup();
    const entryWithNulls = buildEntry({
      startTime: null,
      endTime: null,
      duration: null,
      notes: null,
    } as unknown as Partial<LeisurePlanEntry>);
    render(<PlanEntryFormPage mode="edit" initialEntry={entryWithNulls} />);
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Violão'));

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner));
    expect(screen.queryByText(/Invalid input/i)).not.toBeInTheDocument();
  });

  it('navigates back to the planner via Cancelar', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner);
  });
});
