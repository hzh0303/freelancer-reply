export type AnalyticsEvent = 'page_view'|'cta_click'|'generator_started'|'generator_completed'|'copy_clicked'|'tone_selected'|'regenerate_clicked'|'waitlist_clicked'|'waitlist_submitted'|'pro_feature_clicked'|'error_shown';
type Props = Record<string, string | number | boolean | undefined>;
declare global { interface Window { plausible?: (event:string, opts?:{props?:Props})=>void; gtag?: (...args: unknown[])=>void; clarity?: (...args: unknown[])=>void; } }
export function track(event: AnalyticsEvent, props: Props = {}) { if (typeof window === 'undefined') return; window.dispatchEvent(new CustomEvent('fr-analytics',{detail:{event,props}})); window.plausible?.(event,{props}); window.gtag?.('event', event, props); window.clarity?.('event', event); }
