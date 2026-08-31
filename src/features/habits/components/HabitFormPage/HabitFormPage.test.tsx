import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/app/habitos/novo',
}));

import { render, screen } from '../../../../../test/test-utils';
import { HabitFormPage } from './HabitFormPage';

describe('HabitFormPage', () => {
  it('renders Step 1 and advances steps on "Continuar"', async () => {
    const user = userEvent.setup();
    render(<HabitFormPage />);

    expect(screen.getByRole('heading', { name: 'Novo Hábito' })).toBeInTheDocument();
    expect(screen.getByText('O que você quer tornar consistente?')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Nome do hábito');
    await user.type(nameInput, 'Meditar 10 minutos');

    const nextBtn = screen.getByRole('button', { name: 'Continuar' });
    await user.click(nextBtn);

    // Step 2
    expect(screen.getByText('O que você quer fazer com este hábito?')).toBeInTheDocument();
  });
});
