'use client';

import Script from 'next/script';
import { useEffect, useId, useRef, useState } from 'react';

export interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback'?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile widget for signup/login/forgot-password — see
 * kokyu-sam's docs/security.md. Renders via Turnstile's explicit JS API
 * (`render=explicit`) instead of its auto-render `cf-turnstile` div, so
 * `onVerify` gets a real closure rather than a globally-registered
 * callback name.
 *
 * `onVerify`/`onExpire` are read from refs kept fresh by their own
 * dependency-free effect (never assigned during render — this
 * project's stricter `react-hooks/refs` lint rule rejects that) rather
 * than listed as the render effect's own dependencies, so a new
 * render-scoped closure never tears down and re-renders the widget —
 * the standard pattern for an effect that only needs a callback's
 * *latest* value, not one to react to it changing.
 *
 * Renders nothing when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` isn't
 * configured: Supabase silently ignores a missing captcha token when
 * Attack Protection isn't enabled for the project (e.g. local
 * development against `supabase start`), so this degrades gracefully
 * instead of blocking the form.
 */
export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!scriptLoaded || !container || !window.turnstile || !SITE_KEY) return;

    const widgetId = window.turnstile.render(container, {
      sitekey: SITE_KEY,
      callback: (token) => onVerifyRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
    });
    widgetIdRef.current = widgetId;

    return () => {
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [scriptLoaded]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} id={containerId} />
    </>
  );
}
