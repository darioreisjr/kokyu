import { fireEvent } from '@testing-library/react';
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
    endTime: '19:45',
    duration: 45,
    completed: false,
    archived: false,
    createdAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Fills every field the form now requires (all but Notas) via the real inputs. */
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Título'), 'Ler O Hobbit');
  fireEvent.change(screen.getByLabelText('Início'), { target: { value: '19:00' } });
  fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '20:00' } });
  await user.type(screen.getByLabelText('Duração em minutos'), '60');
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

  it('keeps Salvar disabled until every required field is filled, then enables it', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" defaultDate="2030-06-10" />);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await fillRequiredFields(user);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
  });

  it('rejects saving with no title or date', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" />);

    // Título starts empty in create mode — type then clear it so an actual
    // change fires (onChange revalidation), rather than a no-op clear.
    await user.type(screen.getByLabelText('Título'), 'x');
    await user.clear(screen.getByLabelText('Título'));

    expect(await screen.findByText('Informe um título')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('creates a new entry and navigates back to the planner', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" defaultDate="2030-06-10" />);

    await fillRequiredFields(user);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
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
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner));
    const updated = await leisurePlanService.getPlanEntry('plan-violao-hoje');
    expect(updated.title).toBe('Violão (aula avançada)');
  });

  it('saves an entry whose notes came back as `null` from the API, once a real change is made', async () => {
    // The real backend sends `null` (a nullable DB column), never
    // `undefined`, for an unset notes - the frontend type says
    // `string | undefined`, but the runtime value can still be `null`.
    // A small edit (below) must not trip the form's `.optional()` (not
    // `.nullable()`) zod schema. `notes` is the only field this still
    // applies to — startTime/endTime/duration are required now, covered
    // by the "legacy entry" test below instead.
    const user = userEvent.setup();
    const entryWithNullNotes = buildEntry({ notes: null } as unknown as Partial<LeisurePlanEntry>);
    render(<PlanEntryFormPage mode="edit" initialEntry={entryWithNullNotes} />);
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Violão'));

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await user.type(screen.getByLabelText('Título'), ' (aula avançada)');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner));
    expect(screen.queryByText(/Invalid input/i)).not.toBeInTheDocument();
  });

  it('disables Salvar for a legacy entry missing required fields, until they are filled in', async () => {
    const user = userEvent.setup();
    const legacyEntry = buildEntry({
      startTime: null,
      endTime: null,
      duration: null,
    } as unknown as Partial<LeisurePlanEntry>);
    render(<PlanEntryFormPage mode="edit" initialEntry={legacyEntry} />);
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Violão'));

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '19:00' } });
    fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '19:45' } });
    await user.type(screen.getByLabelText('Duração em minutos'), '45');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
  });

  it('navigates back to the planner via Cancelar', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="create" />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner);
  });

  it('keeps Salvar disabled in edit mode until something actually changes', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="edit" initialEntry={buildEntry()} />);
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Violão'));

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.type(screen.getByLabelText('Notas (opcional)'), 'Praticar escalas.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
  });

  it('does not show an Arquivar button in create mode', () => {
    render(<PlanEntryFormPage mode="create" />);
    expect(screen.queryByRole('button', { name: 'Arquivar' })).not.toBeInTheDocument();
  });

  it('archives the entry and navigates back to the planner', async () => {
    const user = userEvent.setup();
    render(<PlanEntryFormPage mode="edit" initialEntry={buildEntry()} />);
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue('Violão'));

    await user.click(screen.getByRole('button', { name: 'Arquivar' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(leisureRoutes.planner));
    const archived = await leisurePlanService.getArchivedPlanEntries();
    expect(archived.map((entry) => entry.id)).toContain('plan-violao-hoje');
  });
});
