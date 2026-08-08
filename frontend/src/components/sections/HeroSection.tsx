"use client";

import { useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/site';

type Tone = 'Friendly' | 'Professional' | 'Firm' | 'Final Notice';

const exampleDetails = [
  ['Client', 'Sarah'],
  ['Amount', '$850'],
  ['Days overdue', '12'],
  ['Project', 'Website redesign']
] as const;

const examples: Record<Tone, { badge: string; subject: string; body: string }> = {
  Friendly: {
    badge: 'Warm first follow-up',
    subject: 'Quick reminder about the website redesign invoice',
    body: `Hi Sarah,

I hope you’re doing well. I wanted to send a quick reminder about the $850 invoice for the website redesign project, which is now 12 days overdue.

It may simply have slipped through, so I’m just checking in. Could you let me know when I should expect payment?

Thanks,
[Your name]`
  },
  Professional: {
    badge: 'Balanced reminder',
    subject: 'Follow-up on overdue website redesign invoice',
    body: `Hi Sarah,

I hope you’re doing well. I wanted to follow up on the $850 invoice for the website redesign project, which is now 12 days overdue.

Could you please let me know when I can expect payment, or if there is anything you need from me to process it?

Thanks,
[Your name]`
  },
  Firm: {
    badge: 'Clear payment request',
    subject: 'Payment follow-up for website redesign invoice',
    body: `Hi Sarah,

I’m following up again on the $850 invoice for the website redesign project. The invoice is now 12 days overdue, and I have not seen payment come through yet.

Please confirm the payment status and expected payment date. If there is an issue with the invoice, let me know so we can resolve it quickly.

Thanks,
[Your name]`
  },
  'Final Notice': {
    badge: 'Review carefully',
    subject: 'Final reminder: overdue website redesign invoice',
    body: `Hi Sarah,

This is a final reminder that the $850 invoice for the website redesign project remains unpaid and is now 12 days overdue.

Please arrange payment or send an update by [date]. Before taking any further steps, I will review our agreement and applicable requirements carefully.

Regards,
[Your name]`
  }
};

const tones = Object.keys(examples) as Tone[];

export function HeroSection() {
  const [activeTone, setActiveTone] = useState<Tone>('Professional');
  const activeExample = examples[activeTone];

  return (
    <section className="section grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] mobile-stack">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-2 text-xs font-bold uppercase tracking-wide muted"><span className="h-2 w-2 rounded-full bg-[var(--primary)]" />Free beta • 3 generations/day</div>
        <h1 className="font-display text-[56px] font-semibold leading-[1.05] tracking-[-.03em]">Freelance Email Generator for Awkward Client Conversations</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 muted">Start with a polite late payment reminder. Enter a few invoice details, choose a tone, and get email drafts for Gentle, Firm, and Final Notice follow-ups.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className="btn btn-primary" href={routes.tool}>Generate a late payment reminder</Link><Link className="btn btn-secondary" href="#example">See example email</Link></div>
        <p className="mt-4 text-sm muted">✓ Nothing is sent automatically. You stay in control of what gets sent.</p>
      </div>
      <div className="paper-card p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4"><h2 className="font-display text-2xl">Invoice Follow-up</h2><span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold muted">Draft Mode</span></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {exampleDetails.map(([label, value]) => <Detail key={label} label={label} value={value} />)}
        </div>
        <div className="my-5 flex flex-wrap gap-2" aria-label="Example tone selector">
          {tones.map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setActiveTone(tone)}
              className={`chip ${activeTone === tone ? 'chip-active' : ''} ${tone === 'Final Notice' && activeTone !== tone ? 'border-red-200 text-red-700' : ''}`}
              aria-pressed={activeTone === tone}
            >
              {tone}
            </button>
          ))}
        </div>
        <div className="mb-3 rounded-full bg-[var(--paper)] px-3 py-2 text-xs font-bold muted">{activeExample.badge}</div>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--paper)] p-4 text-sm leading-6"><strong>Subject: {activeExample.subject}</strong>{`\n\n${activeExample.body}`}</pre>
        <p className="mt-4 text-xs muted">Example only. Generated emails should be reviewed before sending and are not legal, financial, or debt collection advice.</p>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--border)] bg-white px-3 py-3"><div className="label">{label}</div><div className="mt-1 font-semibold text-[var(--ink)]">{value}</div></div>;
}
