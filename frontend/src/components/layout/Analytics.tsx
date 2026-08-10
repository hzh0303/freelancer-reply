"use client";

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const CONSENT_KEY = 'freelancerreply_analytics_consent';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-LBWD89ZJ61';
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || 'xzq0bxvzis';
const AHREFS_ANALYTICS_KEY = process.env.NEXT_PUBLIC_AHREFS_ANALYTICS_KEY || '2X5hx9s7E6jLFFY/nAUvWg';
const PLAUSIBLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.shipsolo.io/js/pa-J11ox4e1X_BUHLes2wPPy.js';

type Consent = 'accepted' | 'rejected' | null;
type AnalyticsProps = Record<string, string | number | boolean | undefined>;
type AnalyticsPayload = { detail?: { event?: string; props?: AnalyticsProps } };

export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    setConsent(localStorage.getItem(CONSENT_KEY) as Consent);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted') return;
    window.dispatchEvent(
      new CustomEvent('fr-analytics', {
        detail: { event: 'page_view', props: { path: pathname, query: search.toString() } }
      })
    );
  }, [pathname, search, consent]);

  useEffect(() => {
    if (consent !== 'accepted') return;
    const handler = (event: Event) => {
      const payload = event as Event & AnalyticsPayload;
      const name = payload.detail?.event;
      const props = payload.detail?.props || {};
      if (!name) return;
      try {
        if (typeof window.plausible === 'function') window.plausible(name, { props });
        if (typeof window.gtag === 'function') window.gtag('event', name, props);
        if (typeof window.clarity === 'function') window.clarity('event', name);
      } catch {
        // Analytics failures must never block core interactions.
      }
    };
    window.addEventListener('fr-analytics', handler);
    return () => window.removeEventListener('fr-analytics', handler);
  }, [consent]);

  const choose = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: value === 'accepted' ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted'
      });
    }
  };

  return (
    <>
      {GA4_ID ? (
        <Script id="gcm-default" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`}
        </Script>
      ) : null}

      {consent === 'accepted' && PLAUSIBLE_SCRIPT_URL ? (
        <>
          <Script src={PLAUSIBLE_SCRIPT_URL} strategy="afterInteractive" />
          <Script id="plausible-init" strategy="afterInteractive">
            {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init();`}
          </Script>
        </>
      ) : null}

      {consent === 'accepted' && GA4_ID ? (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted'});gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      ) : null}

      {consent === 'accepted' && CLARITY_ID ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){if(typeof c[a]!=='function'){c[a]=function(){(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${CLARITY_ID}');`}
        </Script>
      ) : null}

      {consent === 'accepted' && AHREFS_ANALYTICS_KEY ? (
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key={AHREFS_ANALYTICS_KEY}
          strategy="afterInteractive"
        />
      ) : null}

      {consent === null ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-white p-4 shadow-lg">
          <p className="text-sm font-semibold">Analytics choices</p>
          <p className="mt-1 text-sm muted">
            We use essential storage for the site to work. Optional analytics help us improve FreelancerReply.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-secondary !px-4 !py-2 text-sm" onClick={() => choose('rejected')}>
              Essential only
            </button>
            <button className="btn btn-primary !px-4 !py-2 text-sm" onClick={() => choose('accepted')}>
              Accept analytics
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
