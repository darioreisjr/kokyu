'use client';

import { AnimatePresence, motion, type Variants } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { useEffectiveReducedMotion } from '@/design-system/providers/MotionPreferenceProvider';
import { pageTransitionMotion } from '@/design-system/tokens/semantic/motion';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';

type AuthFlow = 'sign-in' | 'sign-up';
type TransitionKind = 'swap' | 'micro';

/**
 * Which "flow" each auth route belongs to. `/login` and
 * `/forgot-password` share a side (`sign-in`) and get the subtle
 * `micro` transition; anything crossing into `sign-up` gets the
 * whole-screen `swap`. Extend both maps if another route joins `(auth)`.
 */
const FLOW_OF: Record<string, AuthFlow> = {
  '/login': 'sign-in',
  '/forgot-password': 'sign-in',
  '/create-account': 'sign-up',
};

/** Which way each route "arrives from" for the `swap` transition only. */
const ENTRY_DIRECTION: Record<string, 1 | -1> = {
  '/login': -1,
  '/forgot-password': -1,
  '/create-account': 1,
};

const SWAP_SLIDE_PERCENT = 6;
/** Deliberately smaller than `SWAP_SLIDE_PERCENT` — "discreta", per spec. */
const MICRO_SLIDE_PERCENT = 3;

/** Generous upper bound on how many paints `focusNewHeading` will keep re-asserting focus for. */
const FOCUS_RETRY_FRAME_BUDGET = 15;

function focusNewHeading() {
  // Called from `onExitComplete`, which only fires once the outgoing
  // page's node is already gone — by then `#auth-heading` unambiguously
  // resolves to the *new* page (both pages briefly share that id while
  // they overlap mid-crossfade, so querying any earlier would risk
  // grabbing the element that's leaving). It also simply never fires
  // on first load, since nothing exited yet — no extra guard needed.
  //
  // A single deferred `.focus()` call measured flaky in practice (~1 in
  // 3 runs still landed on <body>), and so did retrying after a fixed
  // one or two frames — some navigations apparently need more paints
  // than others before the old focus target is well and truly gone,
  // and there's no reliable signal for exactly when. So instead of
  // guessing a frame count, this re-asserts focus every frame until it
  // actually sticks (verified on the *next* frame) or the budget below
  // runs out, whichever comes first — robust to whatever is contending
  // for focus without needing to know why.
  let attemptsLeft = FOCUS_RETRY_FRAME_BUDGET;

  function attempt() {
    const heading = document.getElementById('auth-heading');
    attemptsLeft -= 1;
    if (!heading) {
      if (attemptsLeft > 0) requestAnimationFrame(attempt);
      return;
    }

    heading.focus();
    if (attemptsLeft <= 0) return;

    requestAnimationFrame(() => {
      if (document.activeElement !== heading) attempt();
    });
  }

  requestAnimationFrame(attempt);
}

/**
 * Persists across every `(auth)` navigation (it lives in
 * `app/(auth)/layout.tsx`, a shared layout Next.js doesn't remount on
 * sibling route changes) and owns the crossfade between screens via
 * `AnimatePresence` keyed on the pathname — the standard integration
 * point for exit animations in the App Router, since the layout
 * itself never unmounts, only the `children` it's handed does.
 *
 * Two distinct transitions share this one component instead of being
 * duplicated:
 *  - `swap`: the existing login ↔ create-account whole-screen slide.
 *  - `micro`: a subtler diagonal drift for login ↔ forgot-password,
 *    where the visual panel is meant to read as a stable anchor.
 * `transitionKind` picks between them by comparing the *previous*
 * pathname's flow to the current one — computed during render (not an
 * effect) so it's correct in the very same commit that removes the
 * outgoing page, matching React's documented pattern for deriving
 * state from a changed value without an extra render's delay.
 *
 * Motion's `AnimatePresence` can't otherwise let an already-exiting
 * element (whose props were fixed at its own last render) react to
 * *where it's going* — only `custom` reaches it after the fact, which
 * is exactly why `transitionKind` is threaded through as `custom`
 * rather than baked into the variants directly. Because both `/login`
 * and `/forgot-password` share one `micro` variants shape (only which
 * side is exiting vs. entering differs, and that's `AnimatePresence`'s
 * own job), "going back" is naturally the inverse — no second variant.
 */
export function AuthTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { preferences } = usePreferences();
  // "Transições entre páginas" (Settings → Navegação) folds into the
  // same reduced-motion branch below — turning it off collapses this
  // to the identical simple fade `prefers-reduced-motion` already
  // gets, rather than a second code path.
  const shouldReduceMotion = useEffectiveReducedMotion() || !preferences.navigation.transitions;
  const direction = ENTRY_DIRECTION[pathname] ?? 1;

  const [previousPathname, setPreviousPathname] = useState(pathname);
  const [transitionKind, setTransitionKind] = useState<TransitionKind>('swap');
  if (pathname !== previousPathname) {
    const staysWithinFlow = FLOW_OF[previousPathname] === FLOW_OF[pathname];
    setTransitionKind(staysWithinFlow ? 'micro' : 'swap');
    setPreviousPathname(pathname);
  }

  const variants: Variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: (kind: TransitionKind) =>
          kind === 'micro'
            ? { opacity: 0, x: `${MICRO_SLIDE_PERCENT}%`, y: `${-MICRO_SLIDE_PERCENT}%` }
            : { opacity: 0, x: `${SWAP_SLIDE_PERCENT * direction}%` },
        animate: { opacity: 1, x: '0%', y: '0%' },
        exit: (kind: TransitionKind) =>
          kind === 'micro'
            ? { opacity: 0, x: `${-MICRO_SLIDE_PERCENT}%`, y: `${MICRO_SLIDE_PERCENT}%` }
            : { opacity: 0, x: `${-SWAP_SLIDE_PERCENT * direction}%` },
      };

  const transition = shouldReduceMotion
    ? { duration: pageTransitionMotion.duration * 0.5 }
    : { duration: pageTransitionMotion.duration, ease: pageTransitionMotion.enterEase };

  return (
    <AnimatePresence
      mode="popLayout"
      initial={false}
      custom={transitionKind}
      onExitComplete={focusNewHeading}
    >
      <motion.div
        key={pathname}
        custom={transitionKind}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        style={{ minHeight: '100dvh', overflowX: 'hidden' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
