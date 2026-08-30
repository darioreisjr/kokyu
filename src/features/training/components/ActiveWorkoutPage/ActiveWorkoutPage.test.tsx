import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import {
  TrainingSessionProvider,
  useTrainingSession,
} from '../../providers/TrainingSessionProvider';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { ActiveWorkoutPage } from './ActiveWorkoutPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {} }),
}));

/** Starts a free session before the page under test ever renders, then reports its id so the test can pass the matching `sessionId` prop. */
function FreeSessionStarter({ onStarted }: { onStarted: (sessionId: string) => void }) {
  const { startFreeSession } = useTrainingSession();
  return (
    <button
      type="button"
      onClick={() => {
        const sessionId = startFreeSession();
        onStarted(sessionId);
      }}
    >
      start-free-session
    </button>
  );
}

describe('ActiveWorkoutPage', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('lets the user add the first exercise to an empty free workout instead of showing "no session"', async () => {
    const user = userEvent.setup();
    let sessionId = '';

    function Harness() {
      const [id, setId] = useState<string | null>(null);
      return (
        <TrainingSessionProvider>
          <FreeSessionStarter
            onStarted={(newId) => {
              sessionId = newId;
              setId(newId);
            }}
          />
          {id ? <ActiveWorkoutPage sessionId={id} /> : null}
        </TrainingSessionProvider>
      );
    }

    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'start-free-session' }));

    await waitFor(() =>
      expect(screen.getByText('Nenhum exercício adicionado ainda.')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Nenhum treino em andamento.')).not.toBeInTheDocument();
    expect(sessionId).not.toBe('');

    await user.click(screen.getByRole('button', { name: 'Adicionar exercício' }));
    await user.click(screen.getByLabelText('Buscar exercício'));
    await user.type(screen.getByLabelText('Buscar exercício'), 'Supino reto');
    await user.click(screen.getByRole('button', { name: /Supino reto/ }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Supino reto' })).toBeInTheDocument(),
    );
  });
});
