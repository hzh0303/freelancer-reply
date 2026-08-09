import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { LegalPage } from '@/components/legal/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FreelancerReply.',
  alternates: { canonical: '/privacy-policy' }
};

export default function Privacy() {
  return (
    <PageShell>
      <LegalPage
        title="Privacy Policy"
        intro="FreelancerReply is an AI-assisted email drafting tool for freelancers. This Privacy Policy explains what information may be collected, how it is used, and what choices you have."
        notice="Do not enter sensitive financial, legal, personal, or confidential information unless it is necessary for the draft. Generator inputs may be sent to OpenRouter or another AI service to create the email."
        sections={[
          {
            title: '1. Information we collect',
            body: [
              'When you use the generator, you may enter client names, invoice amounts, days overdue, service or project type, tone preference, invoice number, payment link, or client relationship. FreelancerReply is designed not to save raw generator inputs or generated outputs by default, but operational systems may process related data to create the draft, protect the service, and measure usage.',
              'If you join the waitlist, we may collect and store your email address, optional role, optional payment-problem notes, source page, feature interest, creation time, and a hashed IP value.'
            ]
          },
          {
            title: '2. Hosting, storage, and infrastructure',
            body: [
              'FreelancerReply is hosted on Cloudflare Workers. Product data needed to operate the beta, such as anonymous session state, waitlist records, usage-limit records, reminder-session counters, and operational logs, may be stored in Cloudflare D1.',
              'We may store hashed IP values, anonymous session identifiers, quota logs, usage logs, AI token and cost logs, provider request identifiers, requested model names, response status, timestamps, and limited technical metadata. These records help prevent abuse, enforce free usage limits, troubleshoot errors, and understand AI costs. They are not intended to store the raw generator input or the generated email body.'
            ]
          },
          {
            title: '3. AI processing',
            body: [
              'When you submit the generator form, information you provide may be sent to OpenRouter or another AI service to produce the generated subject line, email body, and short message. Do not enter information you are not comfortable sending to an AI service.',
              'AI services may process request metadata and generated responses according to their own policies. FreelancerReply uses the AI response to show a draft for you to review, edit, copy, and send yourself.'
            ]
          },
          {
            title: '4. Analytics, cookies, and abuse prevention',
            body: [
              'We use essential technologies to run the site, maintain anonymous sessions, support free usage-limit checks, and help prevent automated abuse. The generator may use Cloudflare Turnstile or similar security checks before draft generation.',
              'Optional analytics scripts load only after you accept analytics in the consent banner. If no analytics IDs are configured, no optional analytics provider scripts are loaded.'
            ]
          },
          {
            title: '5. How we use information',
            body: [
              'We use information to generate AI-assisted drafts, display results, operate copy and regenerate features, run waitlist functionality, understand product usage, prevent abuse, estimate AI costs, and respond to support or deletion requests.',
              'FreelancerReply does not automatically send emails or messages to your clients. You are responsible for reviewing, editing, copying, and sending any draft yourself.'
            ]
          },
          {
            title: '6. Data retention and deletion',
            body: [
              'Generator inputs and outputs are intended not to be stored by FreelancerReply by default. Waitlist data, anonymous session records, free usage-limit records, security logs, usage logs, and AI cost logs may be retained for product operation, abuse prevention, troubleshooting, and cost monitoring.',
              `You may request deletion of waitlist information by contacting ${site.contactEmail}. Depending on your location, you may have additional rights to access, correct, delete, or object to processing. Some anonymous hashed-IP or aggregate operational logs may not be reasonably linkable to your email address.`
            ]
          },
          {
            title: '7. Contact',
            body: [`Contact: ${site.contactEmail}. Website: ${site.url}.`]
          }
        ]}
      />
    </PageShell>
  );
}
