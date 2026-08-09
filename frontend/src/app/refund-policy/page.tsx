import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { LegalPage } from '@/components/legal/LegalPage';
import { pageMetadata, site } from '@/lib/site';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Refund Policy',
    description:
      'Read the FreelancerReply refund policy for the free beta, including current no-payment status, waitlist features, and future paid plan updates.',
    path: '/refund-policy'
  })
};

export default function Refund() {
  return (
    <PageShell>
      <LegalPage
        title="Refund Policy"
        intro="FreelancerReply is currently free while in beta."
        notice="At this stage we do not charge users, process payments, offer paid subscriptions, sell paid credits, or collect payment card information."
        sections={[
          {
            title: '1. Current beta status',
            body: [
              'FreelancerReply is free while in beta. Because no payments are collected, refunds do not apply at this stage.'
            ]
          },
          {
            title: '2. Waitlist features',
            body: [
              'Some parts of the website may mention waitlist, beta, preview, or coming soon features. These are not paid purchases and do not create a right to access future paid features.'
            ]
          },
          {
            title: '3. Future paid plans',
            body: [
              'If FreelancerReply introduces paid plans, subscriptions, credits, trials, or one-time purchases in the future, this Refund Policy will be updated before any charges begin.'
            ]
          },
          {
            title: '4. Contact',
            body: [`Contact: ${site.contactEmail}.`]
          }
        ]}
      />
    </PageShell>
  );
}
