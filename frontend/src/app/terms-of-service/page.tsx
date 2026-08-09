import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { LegalPage } from '@/components/legal/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FreelancerReply.',
  alternates: { canonical: '/terms-of-service' }
};

export default function Terms() {
  return (
    <PageShell>
      <LegalPage
        title="Terms of Service"
        intro="These Terms govern your use of FreelancerReply. By using the service, you agree to review and edit generated drafts before sending them."
        notice="FreelancerReply does not provide legal, financial, accounting, tax, debt collection, or professional advice. Generated content is a draft only and may not fit your contract, client relationship, jurisdiction, or legal rights."
        sections={[
          {
            title: '1. What FreelancerReply does',
            body: [
              'FreelancerReply helps users draft client communication emails, starting with late payment reminder emails for freelancers. The service may generate a recommended reminder draft, including a subject line, email body, and short DM or SMS draft. You may also request limited adjustments such as making the draft softer, firmer, or regenerating it.',
              'FreelancerReply does not send emails automatically. You are responsible for reviewing, editing, copying, and sending any message yourself.'
            ]
          },
          {
            title: '2. AI-generated drafts',
            body: [
              'FreelancerReply uses AI services, such as OpenRouter or another AI service, to help create drafts from the information you provide. AI-generated content may be inaccurate, incomplete, inappropriate, or unsuitable for your situation.',
              'FreelancerReply does not guarantee that a draft will result in payment, comply with your contract or local rules, or be appropriate for every client relationship.',
              'You must review and edit every draft before using it. Do not rely on generated drafts as professional advice or as a final statement of your legal, financial, accounting, tax, or collection rights.'
            ]
          },
          {
            title: '3. No legal, financial, accounting, or debt collection advice',
            body: [
              'Generated content is a draft only. It may not fit your contract, client relationship, jurisdiction, or legal rights. If you are unsure about late fees, contract rights, service suspension, collections, legal action, taxes, accounting treatment, or disputed invoices, consult a qualified professional.'
            ]
          },
          {
            title: '4. User responsibilities',
            body: [
              'You agree to review and edit generated drafts, verify invoice details, avoid unnecessary sensitive information, comply with applicable laws and platform rules, and use your own judgment before contacting a client.',
              'You should mention late fees, service suspension, collections, or legal action only if you have verified that your agreement and applicable rules allow it.'
            ]
          },
          {
            title: '5. Prohibited uses',
            body: [
              'You may not use FreelancerReply to harass, threaten, intimidate, abuse others, send misleading payment demands, impersonate another person, generate illegal debt collection messages, violate platform rules, bypass security checks, or bypass free usage limits.'
            ]
          },
          {
            title: '6. Waitlist and coming soon features',
            body: [
              'Saved clients, automatic reminders, brand voice, export, or other Pro features may be shown as waitlist or coming soon features. Unless explicitly stated as available, these features are not part of the current service and may never launch.',
              'Joining the waitlist stores the information you submit so FreelancerReply can understand interest in future features and contact you if those features become available.'
            ]
          },
          {
            title: '7. Payments',
            body: [
              'FreelancerReply is currently free while in beta and does not process payments. If paid plans are introduced, these Terms and any applicable Refund Policy will be updated before charging users.'
            ]
          },
          {
            title: '8. Contact',
            body: [`Contact: ${site.contactEmail}. Website: ${site.url}.`]
          }
        ]}
      />
    </PageShell>
  );
}
