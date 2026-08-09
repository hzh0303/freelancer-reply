import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { LegalPage } from '@/components/legal/LegalPage';
import { pageMetadata, site } from '@/lib/site';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Cookie Policy',
    description:
      'See how FreelancerReply uses essential storage, anonymous sessions, Cloudflare Turnstile, and optional analytics after consent.',
    path: '/cookie-policy'
  })
};

export default function Cookies() {
  return (
    <PageShell>
      <LegalPage
        title="Cookie Policy"
        intro="This Cookie Policy explains how FreelancerReply uses cookies and similar technologies."
        notice="Optional analytics load only after analytics consent. Essential storage may support consent choices, anonymous sessions, free usage limits, security checks, and core product behavior."
        sections={[
          {
            title: '1. What are cookies and similar technologies?',
            body: [
              'Cookies are small files stored on your browser or device. Similar technologies can include local storage, session storage, pixels, scripts, and security widgets.'
            ]
          },
          {
            title: '2. Essential functionality',
            body: [
              'We may use essential cookies, local storage, or session storage for consent choices, anonymous sessions, free usage limits, Cloudflare Turnstile or similar security checks, and core product functionality. Blocking some storage or security checks may affect site behavior or stop protected actions such as draft generation.',
              'Essential technologies may include an anonymous session cookie, consent storage such as freelancerreply_analytics_consent, quota-related identifiers, and Cloudflare Turnstile security tokens.',
              'Cloudflare Turnstile may process browser, device, network, and challenge-result information to help distinguish normal use from automated abuse.'
            ]
          },
          {
            title: '3. Analytics',
            body: [
              'Optional analytics may help us understand traffic and product usage only after you accept analytics. If analytics is not configured, no optional analytics scripts are loaded.',
              'Optional analytics may include Plausible, Google Analytics, Microsoft Clarity, Ahrefs Analytics, or similar tools if configured and accepted.',
              'Analytics events should not include raw generator inputs, generated draft text, payment details, or confidential client information.'
            ]
          },
          {
            title: '4. Your choices',
            body: [
              'You can choose “Essential only” in the banner to keep non-essential analytics scripts unloaded. You can also clear browser storage at any time.',
              'Essential security and abuse-prevention technologies may still be required for protected actions even if you decline optional analytics.'
            ]
          },
          {
            title: '5. Contact',
            body: [`Contact: ${site.contactEmail}.`]
          }
        ]}
      />
    </PageShell>
  );
}
