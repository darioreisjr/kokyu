'use client';

import { useReducedMotion } from 'motion/react';
import { createContext, useContext, type ReactNode } from 'react';

export type MotionPreferenceMode = 'system' | 'reduce' | 'normal';

const MotionPreferenceContext = createContext<MotionPreferenceMode>('system');

export interface MotionPreferenceProviderProps {
  /** Settings → Acessibilidade → "Reduzir movimento". @default 'system' */
  mode?: MotionPreferenceMode;
  children: ReactNode;
}

export function MotionPreferenceProvider({
  mode = 'system',
  children,
}: MotionPreferenceProviderProps) {
  return (
    <MotionPreferenceContext.Provider value={mode}>{children}</MotionPreferenceContext.Provider>
  );
}

/**
 * Combines the OS-level `prefers-reduced-motion` (via Motion's own
 * `useReducedMotion()`) with Kokyu's in-app "Reduzir movimento"
 * preference: `reduce` always wins, `normal` is an explicit
 * accessibility-page override (the user chose this *here*, not
 * incidentally), `system` just follows the OS.
 *
 * `override`, when given, wins outright over both — preserves each
 * animated component's existing Storybook-determinism escape hatch
 * (`useReducedMotion()` caches its first `matchMedia` read for the
 * whole session, so flipping it between stories isn't reliable).
 * Drop-in replacement for the `reducedMotion ?? systemPrefersReducedMotion`
 * pattern already used by `AuthTransition`, `RecoveryOrb`, etc.
 */
export function useEffectiveReducedMotion(override?: boolean): boolean {
  const systemPrefersReduced = useReducedMotion();
  const mode = useContext(MotionPreferenceContext);

  if (override !== undefined) return override;
  if (mode === 'reduce') return true;
  if (mode === 'normal') return false;
  return Boolean(systemPrefersReduced);
}
