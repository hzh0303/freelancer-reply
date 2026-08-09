import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Generator } from '@/components/tool/Generator';
import { faqs } from '@/data/content';
import { absoluteUrl, pageMetadata, site } from '@/lib/site';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Late Payment Reminder Generator',
    description:
      'Describe an overdue invoice and get a polite reminder draft with a subject line, email body, short DM, and clear stage reason to review before sending.',
    path: '/late-payment-reminder-email-generator'
  })
};

export default function ToolPage() {
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${site.url}/late-payment-reminder-email-generator#app`,
    name: 'Late Payment Reminder Email Generator',
    description:
      'A free beta web tool that drafts polite late payment reminder emails for freelancers to review, edit, copy, and send themselves.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
    url: `${site.url}/late-payment-reminder-email-generator`,
    image: absoluteUrl(site.ogImage),
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.url
    },
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };

  return (
    <PageShell>
      <script type="application/ld+json">{JSON.stringify(app)}</script>
      <section className="section !pb-0">
        <p className="label">Free beta tool</p>
        <h1 className="mt-3 max-w-4xl font-display text-[52px] font-semibold leading-tight">
          Late Payment Reminder Email Generator for Freelancers
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 muted">
          Describe the payment situation and get one recommended reminder draft. FreelancerReply explains why the stage fits, then gives you a subject line, email body, and short DM to review before sending.
        </p>
        <div className="mt-6">
          <a className="btn btn-primary" href="#generator">
            Get recommended reminder
          </a>
        </div>
      </section>

      <div id="generator" className="scroll-mt-24">
        <Suspense fallback={<div className="section">Loading generator…</div>}>
          <Generator />
        </Suspense>
      </div>

      <section className="section !pt-0 grid gap-8 md:grid-cols-2 mobile-stack">
        <div>
          <h2 className="font-display text-4xl">When each reminder stage usually fits</h2>
          <div className="mt-5 grid gap-4">
            {[
              ['Due Soon / Due Today', 'The invoice is due today or not overdue yet. Keep the wording light and helpful.'],
              ['Gentle Reminder', 'The invoice is only a few days overdue and you have sent no reminders or only one reminder.'],
              ['Firm Reminder', 'The invoice is clearly overdue, or you need a more direct follow-up without jumping to a final notice.'],
              ['Final Notice', 'The invoice is significantly overdue and you have already sent multiple reminders. Review carefully before sending.']
            ].map(([title, copy]) => (
              <div className="paper-card p-5" key={title}>
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-2 muted">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-4xl">Best practices for payment follow-ups</h2>
          <ul className="mt-5 grid gap-4 muted">
            <li>✓ Keep the message brief and specific: amount, project, and overdue timing.</li>
            <li>✓ Ask for a payment update or expected payment date instead of assuming bad intent.</li>
            <li>✓ Match the stage to both overdue days and how many reminders you have already sent.</li>
            <li>✓ Do not mention late fees, suspension, collections, or legal action unless you have verified you are allowed to.</li>
            <li>✓ Nothing is sent automatically. Review, edit, copy, and send from your own inbox or messaging tool.</li>
          </ul>
        </div>
      </section>

      <section className="section !pt-0">
        <h2 className="font-display text-4xl">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {faqs.map(([q, a]) => (
            <details className="paper-card p-5" key={q}>
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-3 muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
