import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { IntegrationSettings } from './IntegrationSettings';

describe('IntegrationSettings', () => {
  it('shows Google Calendar as not connected, with "Conectar" disabled', () => {
    render(<IntegrationSettings />);

    expect(screen.getByText('Google Calendar')).toBeInTheDocument();
    expect(screen.getByText('Não conectado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Conectar' })).toBeDisabled();
  });
});
