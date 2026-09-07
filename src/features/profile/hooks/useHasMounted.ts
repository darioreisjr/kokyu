'use client';

import { useEffect, useState } from 'react';

/**
 * `false` on the server and on the client's first paint, `true` from
 * the next render onward. Exists specifically to disable a field until
 * then — see the "Sobre você" `Controller` in `ProfileIdentityForm`/
 * `OnboardingForm`'s doc comment: MUI's `multiline` TextField
 * (`TextareaAutosize`) never reflects its value in the server-rendered
 * HTML, controlled or not, so a real (if brief) window exists after
 * load where the field is visually present but not yet holding its
 * real value. Disabling it for that one window closes the gap
 * completely, rather than racing it.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // Deferred to a microtask rather than called synchronously here —
    // same fix as `KokyuAppShell`/`useUsernameAvailability` use for the
    // same React Compiler rule (`react-hooks/set-state-in-effect`).
    // Still resolves before the browser's next paint.
    queueMicrotask(() => setHasMounted(true));
  }, []);
  return hasMounted;
}
