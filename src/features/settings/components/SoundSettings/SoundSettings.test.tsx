import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { SoundSettings } from './SoundSettings';

describe('SoundSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('both sound preferences start off', () => {
    render(<SoundSettings />);
    expect(screen.getByRole('switch', { name: 'Sons da interface' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Som ao concluir' })).not.toBeChecked();
  });

  it('toggles "Sons da interface"', async () => {
    const user = userEvent.setup();
    render(<SoundSettings />);

    const toggle = screen.getByRole('switch', { name: 'Sons da interface' });
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('toggles "Som ao concluir"', async () => {
    const user = userEvent.setup();
    render(<SoundSettings />);

    const toggle = screen.getByRole('switch', { name: 'Som ao concluir' });
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('shows haptic feedback as unavailable in a jsdom environment without navigator.vibrate', () => {
    render(<SoundSettings />);
    expect(
      screen.getByText(
        'Não disponível neste dispositivo — reservado para uso futuro em PWA/mobile.',
      ),
    ).toBeInTheDocument();
  });
});
