import { describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { SessionsSettings } from './SessionsSettings';

describe('SessionsSettings', () => {
  it('shows the current session and a device label detected from the user agent', async () => {
    render(<SessionsSettings />);

    expect(screen.getByText('Sessão atual · Ativa agora')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/em /)).toBeInTheDocument());
  });

  it('keeps "Sair de todos os dispositivos" disabled — no backend to actually sign out remote sessions', () => {
    render(<SessionsSettings />);
    expect(screen.getByRole('button', { name: 'Sair de todos os dispositivos' })).toBeDisabled();
  });
});
