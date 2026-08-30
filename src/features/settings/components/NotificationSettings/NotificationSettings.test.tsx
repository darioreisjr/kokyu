import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { NotificationSettings } from './NotificationSettings';

describe('NotificationSettings', () => {
  // Each test mounts a fresh `PreferencesProvider`, but they all share
  // the same real jsdom `window.localStorage` within this file — an
  // earlier test's persisted change would otherwise leak into the
  // next one's initial load.
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('master toggle starts on, with channels and categories enabled', () => {
    render(<NotificationSettings />);

    expect(screen.getByRole('switch', { name: 'Notificações' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Notificações no aplicativo' })).toBeEnabled();
    expect(screen.getByRole('switch', { name: 'Prazos de missões' })).toBeEnabled();
  });

  it('turning the master toggle off disables channels and categories without changing their own values', async () => {
    const user = userEvent.setup();
    render(<NotificationSettings />);

    const inApp = screen.getByRole('switch', { name: 'Notificações no aplicativo' });
    const missionDeadlines = screen.getByRole('switch', { name: 'Prazos de missões' });
    expect(inApp).toBeChecked();
    expect(missionDeadlines).toBeChecked();

    await user.click(screen.getByRole('switch', { name: 'Notificações' }));

    expect(screen.getByRole('switch', { name: 'Notificações no aplicativo' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Notificações no aplicativo' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Prazos de missões' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Prazos de missões' })).toBeChecked();
  });

  it('re-enabling the master toggle restores the previously-preserved selections', async () => {
    const user = userEvent.setup();
    render(<NotificationSettings />);

    await user.click(screen.getByRole('switch', { name: 'Notificações no aplicativo' }));
    expect(screen.getByRole('switch', { name: 'Notificações no aplicativo' })).not.toBeChecked();

    await user.click(screen.getByRole('switch', { name: 'Notificações' }));
    await user.click(screen.getByRole('switch', { name: 'Notificações' }));

    expect(screen.getByRole('switch', { name: 'Notificações no aplicativo' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Notificações no aplicativo' })).toBeEnabled();
  });

  it('"Horário silencioso" enables its De/Até fields only once turned on', async () => {
    const user = userEvent.setup();
    render(<NotificationSettings />);

    expect(screen.getByLabelText('De')).toBeDisabled();
    expect(screen.getByLabelText('Até')).toBeDisabled();

    await user.click(screen.getByRole('switch', { name: 'Horário silencioso' }));

    expect(screen.getByLabelText('De')).toBeEnabled();
    expect(screen.getByLabelText('Até')).toBeEnabled();
  });
});
