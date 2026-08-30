import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render } from '../../../../test/test-utils';
import { defaultPreferences } from '../constants/defaultPreferences';
import { PreferencesProvider, usePreferences } from './PreferencesProvider';

/** Exposes just enough of the context to assert against and to drive a change. */
function PreferencesProbe() {
  const { preferences, isHydrated, updateSection, resetPreferences } = usePreferences();
  return (
    <div>
      <span data-testid="hydrated">{String(isHydrated)}</span>
      <span data-testid="theme">{preferences.appearance.theme}</span>
      <span data-testid="day-starts-at">{preferences.routine.dayStartsAt}</span>
      <button onClick={() => updateSection('appearance', { theme: 'dark' })}>Escuro</button>
      <button onClick={() => resetPreferences()}>Restaurar</button>
    </div>
  );
}

/** A real `Storage` implementation, backed by a plain object instead of jsdom's own — satisfies the "mocked, not real localStorage" requirement while still behaving like the real API. */
function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe('PreferencesProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('uses defaultPreferences when nothing is stored', async () => {
    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));
    expect(screen.getByTestId('theme')).toHaveTextContent(defaultPreferences.appearance.theme);
    expect(screen.getByTestId('day-starts-at')).toHaveTextContent(
      defaultPreferences.routine.dayStartsAt,
    );
  });

  it('persists a change and a fresh provider mount still reflects it, against a mocked Storage', async () => {
    const mockStorage = createMockStorage();
    vi.stubGlobal('localStorage', mockStorage);

    const user = userEvent.setup();
    const first = render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));

    await user.click(screen.getByRole('button', { name: 'Escuro' }));
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark'));
    expect(mockStorage.getItem('kokyu:preferences')).toContain('"dark"');

    first.unmount();

    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('falls back to defaults instead of crashing when stored JSON is corrupted', async () => {
    window.localStorage.setItem('kokyu:preferences', '{not valid json');

    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));
    expect(screen.getByTestId('theme')).toHaveTextContent(defaultPreferences.appearance.theme);
  });

  it('falls back to defaults when the stored schema version does not match', async () => {
    window.localStorage.setItem(
      'kokyu:preferences',
      JSON.stringify({ version: 999, data: { appearance: { theme: 'dark' } } }),
    );

    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));
    expect(screen.getByTestId('theme')).toHaveTextContent(defaultPreferences.appearance.theme);
  });

  it('resetPreferences reverts a change back to defaults and clears storage', async () => {
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));

    await user.click(screen.getByRole('button', { name: 'Escuro' }));
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark'));

    await user.click(screen.getByRole('button', { name: 'Restaurar' }));
    await waitFor(() =>
      expect(screen.getByTestId('theme')).toHaveTextContent(defaultPreferences.appearance.theme),
    );
    expect(window.localStorage.getItem('kokyu:preferences')).toBeNull();
  });
});
