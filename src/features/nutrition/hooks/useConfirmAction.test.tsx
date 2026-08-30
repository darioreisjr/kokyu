import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PreferencesProvider,
  usePreferences,
} from '@/features/settings/providers/PreferencesProvider';

import { useConfirmAction } from './useConfirmAction';

function useConfirmActionWithHydration() {
  const { isHydrated } = usePreferences();
  const confirmAction = useConfirmAction();
  return { ...confirmAction, isHydrated };
}

describe('useConfirmAction', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('holds the request as pending and only runs onConfirm once confirmed (default: confirm important actions is on)', async () => {
    const { result } = renderHook(() => useConfirmActionWithHydration(), {
      wrapper: PreferencesProvider,
    });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    const onConfirm = vi.fn();
    act(() => {
      result.current.request({
        title: 'Remover item?',
        description: 'Isso não pode ser desfeito.',
        onConfirm,
      });
    });

    expect(result.current.pending?.title).toBe('Remover item?');
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => {
      result.current.confirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBeNull();
  });

  it('clears the pending request without calling onConfirm when cancelled', async () => {
    const { result } = renderHook(() => useConfirmActionWithHydration(), {
      wrapper: PreferencesProvider,
    });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    const onConfirm = vi.fn();

    act(() => {
      result.current.request({
        title: 'Remover item?',
        description: 'Isso não pode ser desfeito.',
        onConfirm,
      });
    });
    expect(result.current.pending).not.toBeNull();

    act(() => {
      result.current.cancel();
    });

    expect(result.current.pending).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('runs onConfirm immediately with no dialog when "confirmar ações importantes" is off', async () => {
    window.localStorage.setItem(
      'kokyu:preferences',
      JSON.stringify({ version: 1, data: { general: { confirmImportantActions: false } } }),
    );
    const { result } = renderHook(() => useConfirmActionWithHydration(), {
      wrapper: PreferencesProvider,
    });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    const onConfirm = vi.fn();
    act(() => {
      result.current.request({
        title: 'Remover item?',
        description: 'Isso não pode ser desfeito.',
        onConfirm,
      });
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBeNull();
  });
});
