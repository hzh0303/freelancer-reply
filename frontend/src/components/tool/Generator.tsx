"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createAnonymousSession, generatePaymentReminder, getUsage, submitWaitlist, type ApiDraft, type GenerateApiResponse } from '@/lib/api';
import { track } from '@/lib/analytics';

type Tone = 'Friendly' | 'Professional' | 'Firm' | 'Final Notice';
type Draft = { label: string; badge: string; description: string; subject: string; body: string; dm: string };
type Quota = { used: number; limit: number; remaining: number; resetAt: string };

const tones: Tone[] = ['Friendly', 'Professional', 'Firm', 'Final Notice'];
const fallbackQuota: Quota = { used: 0, limit: 3, remaining: 3, resetAt: '' };

export function Generator() {
  const qs = useSearchParams();
  const [form, setForm] = useState({
    clientName: 'Sarah',
    amount: '$850',
    days: '12',
    project: 'Website redesign',
    tone: 'Professional' as Tone,
    invoiceNumber: '',
    paymentLink: '',
    relationship: 'Repeat client'
  });
  const [showAdv, setShowAdv] = useState(false);
  const [state, setState] = useState<'empty' | 'loading' | 'success' | 'error'>('empty');
  const [errorMessage, setErrorMessage] = useState('');
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState('');
  const [waitlist, setWaitlist] = useState<{ open: boolean; feature?: string }>({ open: false });
  const [apiResult, setApiResult] = useState<GenerateApiResponse | null>(null);
  const [quota, setQuota] = useState<Quota>(fallbackQuota);
  const [apiSource, setApiSource] = useState<'ai_provider' | 'template_fallback' | 'frontend_fallback' | null>(null);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      clientName: qs.get('clientName') || f.clientName,
      amount: qs.get('amount') || f.amount,
      days: qs.get('days') || f.days,
      project: qs.get('project') || f.project,
      tone: (qs.get('tone') as Tone) || f.tone
    }));
  }, [qs]);

  useEffect(() => {
    let alive = true;
    createAnonymousSession()
      .catch(() => null)
      .then(() => getUsage())
      .then((usage) => {
        if (alive) setQuota(usage.usage.generatePaymentReminder);
      })
      .catch(() => {
        if (alive) setApiSource('frontend_fallback');
      });
    return () => {
      alive = false;
    };
  }, []);

  const drafts = useMemo(() => (apiResult ? mapApiDrafts(apiResult) : makeTemplatePreview(form)), [apiResult, form]);

  async function generate(regen = false) {
    if (!form.clientName || !form.amount || !form.days || !form.project) {
      setState('error');
      setErrorMessage('Please complete client name, invoice amount, days overdue, and project type.');
      track('error_shown', { type: 'validation' });
      return;
    }
    setState('loading');
    setErrorMessage('');
    track(regen ? 'regenerate_clicked' : 'generator_started', { tone: form.tone });
    try {
      const result = await generatePaymentReminder({
        clientName: form.clientName,
        invoiceAmount: form.amount,
        daysOverdue: Number(form.days),
        projectType: form.project,
        tone: form.tone,
        invoiceNumber: form.invoiceNumber || undefined,
        paymentLink: form.paymentLink || undefined,
        clientRelationship: form.relationship || undefined
      });
      setApiResult(result);
      setQuota(result.meta?.quota || quota);
      setApiSource(result.meta?.source || null);
      setState('success');
      track('generator_completed', { tone: form.tone, source: result.meta?.source || 'unknown' });
    } catch (error) {
      const e = error as Error & { code?: string; status?: number; resetAt?: string };
      setState('error');
      setErrorMessage(messageForApiError(e));
      track('error_shown', { type: e.code || e.status || 'api_error' });
    }
  }

  async function copy(text: string, kind: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard.');
      track('copy_clicked', { kind });
    } catch {
      setToast('Could not copy automatically. Please select the text and copy it manually.');
      track('error_shown', { type: 'copy' });
    }
    setTimeout(() => setToast(''), 2200);
  }

  return (
    <section data-clarity-mask="true" className="section grid items-start gap-6 lg:grid-cols-2 mobile-stack">
      <div className="paper-card p-6 md:p-8">
        <h2 className="font-display text-3xl">Tell us what the reminder is about.</h2>
        <p className="mt-2 text-sm muted">Use only the details needed to draft the email. Avoid entering sensitive financial, legal, or personal information.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Client name" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} helper="Use a first name, company name, or placeholder." />
          <Input label="Invoice amount" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} helper="Text only. FreelancerReply does not process payments." />
          <Input label="Days overdue" type="number" value={form.days} onChange={(v) => setForm({ ...form, days: v })} helper="Approximate days are fine." />
          <Input label="Service or project type" value={form.project} onChange={(v) => setForm({ ...form, project: v })} helper="Example: logo design or web development." />
          <fieldset className="sm:col-span-2">
            <legend className="label mb-2">Tone</legend>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {tones.map((t) => (
                <button type="button" key={t} onClick={() => { setForm({ ...form, tone: t }); track('tone_selected', { tone: t }); }} className={`chip text-left ${form.tone === t ? 'chip-active' : ''}`}>{t}</button>
              ))}
            </div>
            <p className="mt-2 text-xs muted">Final Notice can sound more serious. Review carefully before sending.</p>
          </fieldset>
          <button className="text-left font-semibold text-[var(--primary)] sm:col-span-2" type="button" onClick={() => setShowAdv(!showAdv)}>{showAdv ? 'Hide optional details' : 'Add optional details'}</button>
          {showAdv ? <>
            <Input label="Invoice number" value={form.invoiceNumber} onChange={(v) => setForm({ ...form, invoiceNumber: v })} />
            <Input label="Payment link" value={form.paymentLink} onChange={(v) => setForm({ ...form, paymentLink: v })} helper="Included as text only; not opened or verified." />
            <label className="sm:col-span-2"><span className="label">Client relationship</span><select className="input mt-1" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>{['New client', 'Repeat client', 'Long-term client'].map((x) => <option key={x}>{x}</option>)}</select></label>
          </> : null}
          <button className="btn btn-primary sm:col-span-2" onClick={() => generate(false)} disabled={state === 'loading'}>{state === 'loading' ? 'Drafting your reminder…' : 'Generate reminder'}</button>
          <p className="sm:col-span-2 text-xs muted">By generating a draft, you understand that FreelancerReply does not provide legal, financial, accounting, or debt collection advice.</p>
        </div>
      </div>
      <div className="paper-card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-white p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row"><h2 className="font-display text-3xl">{state === 'success' ? 'Your reminder drafts are ready.' : state === 'loading' ? 'Drafting your reminder…' : state === 'error' ? 'We could not generate your reminder.' : 'Ready when you are.'}</h2><span className="rounded-full bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold">{quota.remaining} of {quota.limit} free generations left today</span></div>
          {apiSource ? <p className="mt-2 text-xs muted">Generation mode: {apiSource === 'template_fallback' ? 'template fallback until AI is connected' : apiSource === 'ai_provider' ? 'AI provider' : 'frontend fallback'}</p> : null}
          {state === 'error' ? <p className="mt-3 text-sm text-red-700">{errorMessage}</p> : <p className="mt-3 text-sm muted">Review each version, adjust anything that does not fit, then copy the version you want to send.</p>}
          <div className="mt-5 flex flex-wrap gap-2">{drafts.map((d, i) => <button key={d.label} className={`chip ${active === i ? 'chip-active' : ''}`} onClick={() => setActive(i)}>{d.label}</button>)}</div>
        </div>
        <div className="p-6">
          {state === 'loading' ? <div className="rounded-xl bg-[var(--paper)] p-8 text-center muted">Creating Gentle, Firm, and Final Notice versions. Please do not refresh.</div> : <Result draft={drafts[active]} copy={copy} />}
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4 text-xs muted">AI-generated drafts may not fit your specific contract, client relationship, or local rules. This is not legal, financial, accounting, or debt collection advice. Review and edit before sending. Mention late fees, suspension, or legal action only if you have verified that you are allowed to do so.</div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row"><button className="btn btn-secondary" onClick={() => generate(true)} disabled={state === 'loading'}>Regenerate drafts</button><button className="btn btn-primary" onClick={() => copy(`${drafts[active].subject}\n\n${drafts[active].body}`, 'email')}>Copy email</button></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-4"><Gate label="Save this client" open={() => openGate('save_client')} /><Gate label="Schedule reminder" open={() => openGate('schedule')} /><Gate label="Export email sequence" open={() => openGate('export')} /><Gate label="Use my brand voice" open={() => openGate('brand_voice')} /></div>
        </div>
      </div>
      {toast ? <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-white">{toast}</div> : null}
      {waitlist.open ? <Waitlist feature={waitlist.feature} close={() => setWaitlist({ open: false })} /> : null}
    </section>
  );

  function openGate(feature: string) {
    track('pro_feature_clicked', { feature });
    setWaitlist({ open: true, feature });
  }
}

function Input({ label, value, onChange, helper, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; helper?: string; type?: string }) {
  return <label><span className="label">{label}</span><input className="input mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} />{helper ? <span className="mt-1 block text-xs muted">{helper}</span> : null}</label>;
}
function Result({ draft, copy }: { draft: Draft; copy: (text: string, kind: string) => void }) {
  return <div><p className="label">{draft.badge}</p><p className="mt-2 text-sm muted">{draft.description}</p><Block title="Subject Line" text={draft.subject} onCopy={() => copy(draft.subject, 'subject')} /><Block title="Email Body" text={draft.body} onCopy={() => copy(draft.body, 'email_body')} /><Block title="Short DM / SMS" text={draft.dm} onCopy={() => copy(draft.dm, 'short_dm')} /></div>;
}
function Block({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return <div className="mt-5"><div className="mb-2 flex items-center justify-between"><span className="label">{title}</span><button className="text-sm font-semibold text-[var(--primary)]" onClick={onCopy}>Copy</button></div><pre className="whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-white p-4 text-sm leading-6">{text}</pre></div>;
}
function Gate({ label, open }: { label: string; open: () => void }) {
  return <button className="rounded-xl border border-[var(--border)] bg-white p-3 text-sm font-semibold" onClick={open}>{label}</button>;
}
function Waitlist({ close, feature }: { close: () => void; feature?: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [problem, setProblem] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.');
      track('error_shown', { type: 'waitlist_email' });
      return;
    }
    try {
      await submitWaitlist({ email, role, biggestPaymentProblem: problem, sourcePage: window.location.pathname, featureInterest: feature });
      track('waitlist_submitted', { source: 'modal', feature: feature || 'unknown' });
      setDone(true);
    } catch (e) {
      setError((e as Error).message || 'Could not join the waitlist. Please try again.');
      track('error_shown', { type: 'waitlist_api' });
    }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"><div className="paper-card max-w-lg p-6"><h2 className="font-display text-3xl">{done ? 'You’re on the waitlist.' : 'Want higher limits and saved client tools?'}</h2>{done ? <p className="mt-3 muted">Thanks — we’ll use beta feedback to decide which Pro features to build next.</p> : <><p className="mt-3 muted">Join the Pro waitlist if you want saved clients, brand voice, reminder sequences, and more freelancer email generators.</p><label className="mt-5 block"><span className="label">Email address</span><input className="input mt-1" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="mt-3 block"><span className="label">Role</span><select className="input mt-1" value={role} onChange={(e) => setRole(e.target.value)}>{['Designer', 'Developer', 'Marketer', 'Copywriter', 'Consultant', 'Virtual assistant', 'Other'].map((x) => <option key={x}>{x}</option>)}</select></label><label className="mt-3 block"><span className="label">What client email do you struggle with most?</span><input className="input mt-1" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Late payments, proposal follow-ups, scope creep…" /></label>{error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}<p className="mt-2 text-xs muted">By joining the waitlist, you agree that we may store your email to contact you about FreelancerReply. You can request deletion later.</p></>}<div className="mt-5 flex gap-2">{done ? null : <button className="btn btn-primary" onClick={submit}>Join waitlist</button>}<button className="btn btn-secondary" onClick={close}>{done ? 'Back to generator' : 'Not now'}</button></div></div></div>;
}
function mapApiDrafts(result: GenerateApiResponse): Draft[] {
  return [toDraft('Gentle', 'Early follow-up', 'Best for a first reminder or a relationship you want to keep warm.', result.gentle), toDraft('Firm', 'Clear follow-up', 'Best when the invoice is clearly overdue and you need a more direct request.', result.firm), toDraft('Final Notice', 'Review carefully', 'Best for later-stage follow-up. Do not add late fees or legal action unless verified.', result.finalNotice)];
}
function toDraft(label: string, badge: string, description: string, draft: ApiDraft): Draft {
  return { label, badge, description, subject: draft.subject, body: draft.emailBody, dm: draft.shortMessage };
}
function messageForApiError(e: { code?: string; status?: number; message?: string; resetAt?: string }) {
  if (e.code === 'QUOTA_EXCEEDED' || e.status === 402) return `You’ve reached today’s free beta limit. Come back after ${e.resetAt ? new Date(e.resetAt).toLocaleString() : 'the next reset'} or join the waitlist for higher limits.`;
  if (e.code === 'RATE_LIMITED' || e.status === 429) return 'Too many requests. Please wait a bit and try again.';
  if (e.code === 'PROVIDER_UNAVAILABLE' || e.status === 503) return 'The generator is temporarily unavailable. Please try again in a few minutes.';
  if (e.code === 'VALIDATION_ERROR') return e.message || 'Some details are invalid. Please review your inputs.';
  return e.message || 'Something went wrong while generating your draft. Please try again.';
}
function makeTemplatePreview(f: { clientName: string; amount: string; days: string; project: string }): Draft[] {
  return mapApiDrafts({ gentle: { subject: `Quick reminder about the invoice for ${f.project}`, emailBody: `Hi ${f.clientName},\n\nI hope you are doing well. I wanted to send a quick reminder that the ${f.amount} invoice for ${f.project} appears to be ${f.days} days overdue.\n\nCould you let me know when I should expect payment, or if you need anything else from me to process it?\n\nThank you,\n[Your name]`, shortMessage: `Hi ${f.clientName}, quick reminder that the ${f.amount} invoice for ${f.project} is ${f.days} days overdue.` }, firm: { subject: `Follow-up: overdue payment for ${f.project}`, emailBody: `Hi ${f.clientName},\n\nI am following up again on the ${f.amount} invoice for ${f.project}, which is now ${f.days} days overdue.\n\nCould you please confirm the payment status and expected payment date?\n\nThanks,\n[Your name]`, shortMessage: `Hi ${f.clientName}, following up on the ${f.amount} invoice for ${f.project}. Can you confirm payment status?` }, finalNotice: { subject: `Final reminder: overdue invoice for ${f.project}`, emailBody: `Hi ${f.clientName},\n\nThis is a final reminder that the ${f.amount} invoice for ${f.project} remains unpaid and is now ${f.days} days overdue.\n\nPlease arrange payment or send an update by [date].\n\nRegards,\n[Your name]`, shortMessage: `Hi ${f.clientName}, final reminder that the ${f.amount} invoice for ${f.project} is still unpaid.` }, disclaimer: '' });
}
