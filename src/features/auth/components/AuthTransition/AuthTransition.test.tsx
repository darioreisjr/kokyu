import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AuthTransition } from './AuthTransition';

vi.mock('next/navigation', () => ({
  usePathname: () => '/login',
}));

describe('AuthTransition', () => {
  it('renders its children', () => {
    render(
      <AuthTransition>
        <div>Conteúdo da página</div>
      </AuthTransition>,
    );

    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });
});
