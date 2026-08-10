import Link from 'next/link';
import { routes } from '@/lib/site';

const exampleDetails = [
  ['Client', 'Sarah'],
  ['Amount', '$850'],
  ['Days overdue', '12'],
  ['Project', 'Website redesign'],
  ['Previous reminders', 'None'],
  ['Relationship', 'Repeat client']
] as const;

export function HeroSection() {
  return (
    <section className="section grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] mobile-stack">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-2 text-xs font-bold uppercase tracking-wide muted"><span className="h-2 w-2 rounded-full bg-[var(--primary)]" />Free beta • Drafts only</div>
        <h1 className="font-display text-[56px] font-semibold leading-[1.05] tracking-[-.03em]">Know what to say when a client hasn’t paid.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 muted">Describe what happened — how overdue the invoice is, how many reminders you’ve sent, and your client relationship. Get one recommended reminder with a clear reason, subject line, email body, and short DM.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className="btn btn-primary" href={routes.tool}>Start a reminder</Link><Link className="btn btn-secondary" href="#example">See an example</Link></div>
        <p className="mt-4 text-sm muted">✓ Nothing is sent automatically. You review, edit, copy, and send it yourself.</p>
      </div>
      <div className="paper-card p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4"><h2 className="font-display text-2xl">Example recommendation</h2><span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold muted">Recommended</span></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {exampleDetails.map(([label, value]) => <Detail key={label} label={label} value={value} />)}
        </div>
        <div className="my-5 rounded-xl border border-[var(--border)] bg-[var(--primary-soft)] p-4">
          <p className="label">Recommended stage</p>
          <p className="mt-2 font-display text-3xl">Firm Reminder</p>
          <p className="mt-2 text-sm muted">The invoice is 12 days overdue, but this appears to be your first reminder. A firm reminder is clearer than a gentle nudge, but safer than starting with a final notice.</p>
        </div>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--paper)] p-4 text-sm leading-6"><strong>Subject: Follow-up on website redesign invoice</strong>{`\n\nHi Sarah,\n\nI hope you’re doing well. I wanted to follow up on the $850 invoice for the website redesign project, which is now 12 days overdue.\n\nCould you please let me know when I can expect payment, or if there is anything you need from me to process it?\n\nThanks,\n[Your name]`}</pre>
        <p className="mt-4 text-xs muted">Example only. AI-assisted drafts should be reviewed before sending and are not legal, financial, or debt collection advice.</p>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--border)] bg-white px-3 py-3"><div className="label">{label}</div><div className="mt-1 font-semibold text-[var(--ink)]">{value}</div></div>;
}
