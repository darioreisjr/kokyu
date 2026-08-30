import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AuthFormPanel } from './AuthFormPanel';

describe('AuthFormPanel', () => {
  it('renders its children', () => {
    render(
      <AuthFormPanel>
        <div>Conteúdo</div>
      </AuthFormPanel>,
    );

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('renders the Kokyu wordmark for the mobile-only logo slot', () => {
    render(
      <AuthFormPanel>
        <div>Conteúdo</div>
      </AuthFormPanel>,
    );

    expect(screen.getByText('KOKYU')).toBeInTheDocument();
  });
});
