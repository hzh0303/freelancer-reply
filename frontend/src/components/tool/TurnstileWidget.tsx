"use client";

import { useEffect, useRef, useState } from 'react';

type TurnstileSize = 'normal' | 'compact' | 'flexible';

type TurnstileRenderOptions = {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: TurnstileSize;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

type TurnstileWidgetProps = {
  siteKey: string;
  resetKey: number;
  onTokenChange: (token: string) => void;
  onStatusChange?: (status: 'idle' | 'ready' | 'error' | 'expired') => void;
};

export function TurnstileWidget({ siteKey, resetKey, onTokenChange, onStatusChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(() => typeof window !== 'undefined' && Boolean(window.turnstile));

  useEffect(() => {
    if (!siteKey) return;
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }
    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const handleLoad = () => setScriptReady(Boolean(window.turnstile));
    script.addEventListener('load', handleLoad);
    return () => script?.removeEventListener('load', handleLoad);
  }, [siteKey]);

  useEffect(() => {
    onTokenChange('');
    onStatusChange?.('idle');
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) return;

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'light',
      size: 'compact',
      callback: (token) => {
        onTokenChange(token);
        onStatusChange?.('ready');
      },
      'error-callback': () => {
        onTokenChange('');
        onStatusChange?.('error');
      },
      'expired-callback': () => {
        onTokenChange('');
        onStatusChange?.('expired');
      }
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady, resetKey, onTokenChange, onStatusChange]);

  if (!siteKey) {
    return (
      <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Security verification is not configured yet. The generator may be unavailable until setup is complete.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)]/70 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
            <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-[var(--primary)] text-[10px] text-white">✓</span>
            Security check
          </div>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">Keep the free generator available.</p>
          <p className="mt-1 text-xs muted">A quick verification helps prevent automated abuse before creating drafts.</p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <div className="overflow-hidden rounded-xl bg-white p-1 shadow-sm">
            <div ref={containerRef} className="min-h-[65px] w-[150px]" data-testid="turnstile-widget" />
          </div>
        </div>
      </div>
    </div>
  );
}
