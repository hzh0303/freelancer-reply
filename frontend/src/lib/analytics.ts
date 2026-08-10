export type AnalyticsEvent =
  | 'page_view'
  | 'cta_click'
  | 'generator_started'
  | 'stage_recommended'
  | 'generator_completed'
  | 'copy_clicked'
  | 'copy_subject_clicked'
  | 'copy_email_clicked'
  | 'copy_short_dm_clicked'
  | 'regenerate_clicked'
  | 'make_softer_clicked'
  | 'make_firmer_clicked'
  | 'final_notice_warning_shown'
  | 'waitlist_clicked'
  | 'waitlist_submitted'
  | 'pro_feature_clicked'
  | 'pro_feature_selected'
  | 'pro_waitlist_clicked'
  | 'pricing_willingness_selected'
  | 'error_shown';

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: unknown;
    gtag?: unknown;
    clarity?: unknown;
  }
}

function callAnalytics(fn: unknown, args: unknown[]) {
  if (typeof fn !== 'function') return;
  try {
    fn(...args);
  } catch {
    // Analytics must never block the generator or any core CTA.
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('fr-analytics', { detail: { event, props } }));
  } catch {
    // Ignore third-party listener failures.
  }
  callAnalytics(window.plausible, [event, { props }]);
  callAnalytics(window.gtag, ['event', event, props]);
  callAnalytics(window.clarity, ['event', event]);
}
