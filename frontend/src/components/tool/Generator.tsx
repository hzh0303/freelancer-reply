"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  createAnonymousSession,
  generatePaymentReminder,
  getUsage,
  submitWaitlist,
  type ApiDraft,
  type GenerateApiResponse,
  type PreviousReminders,
  type ReminderStage,
  type RefinementMode,
  type Quota
} from '@/lib/api';
import { track } from '@/lib/analytics';
import { TurnstileWidget } from './TurnstileWidget';

type FormState = {
  clientName: string;
  amount: string;
  days: string;
  project: string;
  previousReminders: PreviousReminders;
  invoiceNumber: string;
  paymentLink: string;
  relationship: 'New client' | 'Repeat client' | 'Long-term client';
};
type ResultSnapshot = {
  stage: ReminderStage;
  reason: string;
  subject: string;
  body: string;
  dm: string;
  riskNotice?: string;
  disclaimer?: string;
  refinementMode: RefinementMode;
  submittedForm: FormState;
  reminderSessionId?: string;
  reminderSession?: { id: string; refinementCount: number; refinementLimit: number };
};

type Recommendation = { stage: ReminderStage; reason: string; riskNotice?: string };
type PendingAction = {
  title: string;
  body: string;
  primaryLabel: string;
  primaryMode: RefinementMode;
  primaryStage: ReminderStage;
  secondaryLabel?: string;
  secondaryMode?: RefinementMode;
  secondaryStage?: ReminderStage;
};
const fallbackQuota: Quota = { used: 0, limit: 2, remaining: 2, resetAt: '' };
const fallbackHourlyQuota: Quota = { used: 0, limit: 4, remaining: 4, resetAt: '' };
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const reminderOptions: { label: string; value: PreviousReminders }[] = [
  { label: 'None', value: 'none' },
  { label: '1 reminder', value: 'one' },
  { label: '2 reminders', value: 'two' },
  { label: '3+ reminders', value: 'three_plus' }
];

function parsePrevious(value: string | null): PreviousReminders {
  return ['none', 'one', 'two', 'three_plus'].includes(value || '') ? (value as PreviousReminders) : 'none';
}
function parseRelationship(value: string | null): FormState['relationship'] {
  return value === 'New client' || value === 'Long-term client' || value === 'Repeat client' ? value : 'Repeat client';
}
function formatReset(resetAt?: string) {
  return resetAt ? new Date(resetAt).toLocaleString() : 'the next reset';
}
function countPrevious(value: PreviousReminders) {
  return value === 'none' ? 0 : value === 'one' ? 1 : value === 'two' ? 2 : 3;
}
function firstForm(qs: URLSearchParams): FormState {
  return {
    clientName: qs.get('clientName') || 'Sarah',
    amount: qs.get('amount') || '$850',
    days: qs.get('days') || '12',
    project: qs.get('project') || 'Website redesign',
    previousReminders: parsePrevious(qs.get('previousReminders')),
    invoiceNumber: '',
    paymentLink: '',
    relationship: parseRelationship(qs.get('relationship'))
  };
}

export function Generator() {
  const qs = useSearchParams();
  const [form, setForm] = useState(() => firstForm(qs));
  const [showAdv, setShowAdv] = useState(false);
  const [state, setState] = useState<'empty' | 'loading' | 'success' | 'error'>('empty');
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState('');
  const [waitlist, setWaitlist] = useState<{ open: boolean; feature?: string }>({ open: false });
  const [result, setResult] = useState<ResultSnapshot | null>(null);
  const [quota, setQuota] = useState<Quota>(fallbackQuota);
  const [refinementQuota, setRefinementQuota] = useState<Quota>(fallbackQuota);
  const [hourlyQuota, setHourlyQuota] = useState<Quota>(fallbackHourlyQuota);
  const [apiSource, setApiSource] = useState<'ai_provider' | 'template_fallback' | 'frontend_fallback' | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileTokenRef = useRef('');
  const [turnstileStatus, setTurnstileStatus] = useState<'idle' | 'ready' | 'error' | 'expired'>('idle');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const handleTurnstileToken = useCallback((token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);
  }, []);
  const handleTurnstileStatus = useCallback((status: 'idle' | 'ready' | 'error' | 'expired') => setTurnstileStatus(status), []);
  const resetTurnstile = useCallback(() => {
    turnstileTokenRef.current = '';
    setTurnstileToken('');
    setTurnstileResetKey((key) => key + 1);
  }, []);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      clientName: qs.get('clientName') || f.clientName,
      amount: qs.get('amount') || f.amount,
      days: qs.get('days') || f.days,
      project: qs.get('project') || f.project,
      previousReminders: parsePrevious(qs.get('previousReminders')),
      relationship: parseRelationship(qs.get('relationship'))
    }));
  }, [qs]);

  useEffect(() => {
    let alive = true;
    createAnonymousSession()
      .catch(() => null)
      .then(() => refreshUsage(alive))
      .catch(() => {
        if (alive) setApiSource('frontend_fallback');
      });
    return () => {
      alive = false;
    };
  }, []);

  async function refreshUsage(alive = true) {
    const usage = await getUsage();
    if (!alive) return;
    setQuota(usage.usage.generatePaymentReminder);
    setRefinementQuota(usage.usage.refinePaymentReminder || fallbackQuota);
    setHourlyQuota(usage.usage.hourlyAiCalls || fallbackHourlyQuota);
  }

  const recommendation = useMemo(() => recommendStage(form), [form]);

  async function generate(mode: RefinementMode = 'initial', overrideStage?: ReminderStage) {
    if (state === 'loading') return;
    const limitMessage = preflightLimitMessage(mode);
    if (limitMessage) {
      setErrorMessage(limitMessage);
      track('error_shown', { type: mode === 'initial' ? 'session_quota_preflight' : 'refinement_quota_preflight' });
      return;
    }
    if (turnstileSiteKey && !(turnstileTokenRef.current || turnstileToken)) {
      setErrorMessage(turnstileStatus === 'expired' ? 'Security verification expired. Please complete the check again.' : 'Complete the security check before generating a draft.');
      track('error_shown', { type: 'turnstile_preflight' });
      return;
    }
    if (!form.clientName || !form.amount || !form.days || !form.project) {
      setState(result ? 'success' : 'error');
      setErrorMessage('Please complete client name, invoice amount, days overdue, project or service, and previous reminders.');
      track('error_shown', { type: 'validation' });
      return;
    }
    const stage = overrideStage || recommendation.stage;
    const reason = stage === recommendation.stage ? recommendation.reason : refinementReason(mode, stage, recommendation.stage);
    const submitted = { ...form };
    setPendingAction(null);
    setState('loading');
    setErrorMessage('');
    const loadingWatchdog = window.setTimeout(() => {
      setState((current) => (current === 'loading' ? (result ? 'success' : 'error') : current));
      setErrorMessage((current) => current || 'The generator took too long to respond. Please refresh the security check and try again.');
      if (turnstileSiteKey) resetTurnstile();
    }, 50_000);
    track(mode === 'regenerate' ? 'regenerate_clicked' : mode === 'softer' ? 'make_softer_clicked' : mode === 'firmer' ? 'make_firmer_clicked' : 'generator_started', { stage });
    const activeTurnstileToken = turnstileTokenRef.current || turnstileToken || undefined;
    try {
      const apiResult = await generatePaymentReminder({
        clientName: submitted.clientName,
        invoiceAmount: submitted.amount,
        daysOverdue: Number(submitted.days),
        projectType: submitted.project,
        previousRemindersSent: submitted.previousReminders,
        recommendedStage: stage,
        refinementMode: mode,
        stageReason: reason,
        tone: toneForStage(stage, mode),
        invoiceNumber: submitted.invoiceNumber || undefined,
        paymentLink: submitted.paymentLink || undefined,
        clientRelationship: submitted.relationship || undefined,
        turnstileToken: activeTurnstileToken,
        reminderSessionId: mode === 'initial' ? undefined : result?.reminderSessionId
      });
      const normalized = normalizeApiResult(apiResult, stage, reason, mode, submitted);
      setResult(normalized);
      setQuota(apiResult.meta?.quota || quota);
      setApiSource(apiResult.meta?.source || null);
      setState('success');
      refreshUsage().catch(() => null);
      track('stage_recommended', { stage: normalized.stage, mode });
      track('generator_completed', { stage: normalized.stage, source: apiResult.meta?.source || 'unknown', mode });
      if (normalized.stage === 'Final Notice') track('final_notice_warning_shown', { mode });
    } catch (error) {
      const e = error as Error & { code?: string; status?: number; resetAt?: string };
      setState(result ? 'success' : 'error');
      if (e.code === 'REMINDER_SESSION_REFINEMENT_LIMIT_REACHED' || e.code === 'REMINDER_SESSION_NOT_FOUND') {
        setResult((current) => current ? {
          ...current,
          reminderSession: current.reminderSession
            ? { ...current.reminderSession, refinementCount: current.reminderSession.refinementLimit }
            : { id: current.reminderSessionId || '', refinementCount: 1, refinementLimit: 1 }
        } : current);
      }
      setErrorMessage(messageForApiError(e, mode));
      refreshUsage().catch(() => null);
      track('error_shown', { type: e.code || e.status || 'api_error' });
    } finally {
      window.clearTimeout(loadingWatchdog);
      if (turnstileSiteKey) resetTurnstile();
    }
  }

  async function copy(text: string, kind: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied. Review once more before sending.');
      track(kind === 'subject' ? 'copy_subject_clicked' : kind === 'short_dm' ? 'copy_short_dm_clicked' : 'copy_email_clicked', { kind });
    } catch {
      setToast('Could not copy automatically. Please select the text and copy it manually.');
      track('error_shown', { type: 'copy' });
    }
    setTimeout(() => setToast(''), 2200);
  }

  function preflightLimitMessage(mode: RefinementMode) {
    if (mode === 'initial') {
      if (quota.limit > 0 && quota.remaining <= 0) return `You’ve used today’s ${quota.limit} free reminder drafts. Come back after ${formatReset(quota.resetAt)} or join the waitlist for higher limits.`;
      if (hourlyQuota.limit > 0 && hourlyQuota.remaining <= 0) return `You’ve made several AI requests recently. Please try again after ${hourlyQuota.resetAt ? new Date(hourlyQuota.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'the hourly reset'}.`;
      return '';
    }
    if (result?.reminderSession && result.reminderSession.refinementCount >= result.reminderSession.refinementLimit) {
      return 'This draft has already used its free adjustment. Start a new reminder to adjust another draft.';
    }
    if (refinementQuota.limit > 0 && refinementQuota.remaining <= 0) {
      return `You’ve used today’s ${refinementQuota.limit} free adjustments. Come back after ${formatReset(refinementQuota.resetAt)} or join the waitlist for higher limits.`;
    }
    if (hourlyQuota.limit > 0 && hourlyQuota.remaining <= 0) {
      return `You’ve made several AI requests recently. Please try again after ${hourlyQuota.resetAt ? new Date(hourlyQuota.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'the hourly reset'}.`;
    }
    return '';
  }
  function openPendingAction(action: PendingAction) {
    if (!result || state === 'loading') return;
    const limitMessage = preflightLimitMessage(action.primaryMode);
    if (limitMessage) {
      setErrorMessage(limitMessage);
      track('error_shown', { type: 'refinement_quota_preflight' });
      return;
    }
    setErrorMessage('');
    setPendingAction(action);
  }
  function softer() {
    if (!result || state === 'loading') return;
    const next = adjacentStage(result.stage, -1);
    openPendingAction({
      title: 'Make this reminder softer?',
      body: 'This uses one free beta adjustment. The payment ask will stay clear, but the wording will become more gentle.',
      primaryLabel: 'Generate softer draft',
      primaryMode: 'softer',
      primaryStage: next
    });
  }
  function firmer() {
    if (!result || state === 'loading') return;
    const next = adjacentStage(result.stage, 1);
    if (result.stage === 'Firm Reminder' && next === 'Final Notice') {
      openPendingAction({
        title: 'Move toward a Final Notice?',
        body: 'Final Notice wording can have legal or business consequences. You can generate a Final Notice draft, generate another Firm Reminder, or close this dialog without spending an adjustment.',
        primaryLabel: 'Generate Final Notice draft',
        primaryMode: 'firmer',
        primaryStage: 'Final Notice',
        secondaryLabel: 'Generate another Firm Reminder',
        secondaryMode: 'regenerate',
        secondaryStage: 'Firm Reminder'
      });
      return;
    }
    openPendingAction({
      title: 'Make this reminder firmer?',
      body: 'This uses one free beta adjustment. The draft will become more direct while staying professional and avoiding unsupported legal threats.',
      primaryLabel: 'Generate firmer draft',
      primaryMode: 'firmer',
      primaryStage: next
    });
  }
  function regenerate() {
    if (!result || state === 'loading') return;
    openPendingAction({
      title: 'Regenerate this reminder?',
      body: 'This uses one free beta adjustment and keeps the same recommended stage and situation.',
      primaryLabel: 'Regenerate draft',
      primaryMode: 'regenerate',
      primaryStage: result.stage
    });
  }
  function startOver() {
    setResult(null);
    setState('empty');
    setErrorMessage('');
  }

  const hourlyBlocked = hourlyQuota.limit > 0 && hourlyQuota.remaining <= 0;
  const turnstileBlocked = Boolean(turnstileSiteKey) && !turnstileToken;
  const missingReminderSession = Boolean(result) && !result?.reminderSessionId;
  const sessionRefinementBlocked = Boolean(result?.reminderSession && result.reminderSession.refinementCount >= result.reminderSession.refinementLimit);
  // Keep the primary button clickable so users always get a clear message
  // when security check/quota blocks generation, instead of a dead control.
  const canGenerateInitial = state !== 'loading';
  const canRefine = state !== 'loading' && Boolean(result) && !missingReminderSession && !sessionRefinementBlocked;
  const quotaNotice = sessionRefinementBlocked && result
    ? 'This draft has already used its free adjustment. Start a new reminder to adjust another draft.'
    : missingReminderSession
      ? 'Start a new reminder before making adjustments.'
      : '';

  return (
    <section data-clarity-mask="true" className="section grid items-start gap-6 lg:grid-cols-2 mobile-stack">
      <div className="paper-card p-6 md:p-8">
        <h2 className="font-display text-3xl">Tell us what happened</h2>
        <p className="mt-2 text-sm muted">Add the facts needed to recommend the right reminder stage. Avoid entering sensitive information that is not needed for the draft.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Client name" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} helper="Use a first name, company name, or generic label." />
          <Input label="Invoice amount" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} helper="Used as text only. FreelancerReply does not process payments." />
          <Input label="Days overdue" type="number" value={form.days} onChange={(v) => setForm({ ...form, days: v })} helper="Use 0 if due today. Negative numbers can mean not due yet." />
          <Input label="Project or service" value={form.project} onChange={(v) => setForm({ ...form, project: v })} helper="Example: logo design or web development." />
          <fieldset className="sm:col-span-2">
            <legend className="label mb-2">Previous reminders sent</legend>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {reminderOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setForm({ ...form, previousReminders: option.value })}
                  className={`chip justify-center text-center ${form.previousReminders === option.value ? 'chip-active' : ''}`}
                  aria-pressed={form.previousReminders === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs muted">This helps decide whether the next message should stay gentle, become firm, or be treated as a final notice candidate.</p>
          </fieldset>
          <div className="sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4">
            <p className="label">Current recommendation preview</p>
            <p className="mt-2 font-display text-2xl">{recommendation.stage}</p>
            <p className="mt-2 text-sm muted">{recommendation.reason}</p>
          </div>
          <button className="text-left font-semibold text-[var(--primary)] sm:col-span-2" type="button" onClick={() => setShowAdv(!showAdv)}>{showAdv ? 'Hide optional details' : 'Add optional details'}</button>
          {showAdv ? <>
            <label className="sm:col-span-2"><span className="label">Client relationship</span><select className="input mt-1" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value as FormState['relationship'] })}>{['New client', 'Repeat client', 'Long-term client'].map((x) => <option key={x}>{x}</option>)}</select><span className="mt-1 block text-xs muted">Optional. This can help make the draft more relationship-aware.</span></label>
            <Input label="Invoice number" value={form.invoiceNumber} onChange={(v) => setForm({ ...form, invoiceNumber: v })} helper="Optional. Only include it if you want it in the draft." />
            <Input label="Payment link" value={form.paymentLink} onChange={(v) => setForm({ ...form, paymentLink: v })} helper="Included as text only; not opened, verified, or processed." />
          </> : null}
          <div className="sm:col-span-2">
            <TurnstileWidget siteKey={turnstileSiteKey} resetKey={turnstileResetKey} onTokenChange={handleTurnstileToken} onStatusChange={handleTurnstileStatus} />
            {turnstileSiteKey && turnstileBlocked ? <p className="mt-2 text-xs muted">Complete the security check to enable draft generation.</p> : null}
            {turnstileStatus === 'error' ? <p role="alert" className="mt-2 text-sm text-red-700">Security verification could not load. Refresh the page and try again.</p> : null}
            {turnstileStatus === 'expired' ? <p role="alert" className="mt-2 text-sm text-red-700">Security verification expired. Complete the check again before generating.</p> : null}
          </div>
          <button className="btn btn-primary sm:col-span-2" onClick={() => generate('initial')} disabled={!canGenerateInitial}>{state === 'loading' ? <span className="inline-flex items-center gap-2"><Spinner /> Generating…</span> : 'Get recommended reminder'}</button>
          <p className="sm:col-span-2 text-xs muted">By generating a draft, you understand that FreelancerReply creates AI-assisted drafts only. It does not provide legal, financial, accounting, or debt collection advice.</p>
        </div>
      </div>
      <div className="paper-card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-white p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row"><h2 className="font-display text-3xl">{state === 'success' ? 'Your recommended reminder is ready.' : state === 'loading' ? 'Reviewing the situation…' : state === 'error' ? 'We could not generate your reminder.' : 'Ready when you are.'}</h2><div className="flex flex-col gap-2 text-xs font-bold sm:items-end"><span className="rounded-full bg-[var(--primary-soft)] px-3 py-2">{quota.remaining} of {quota.limit} free reminder drafts left today</span><span className="rounded-full bg-[var(--primary-soft)] px-3 py-2">{refinementQuota.remaining} of {refinementQuota.limit} free adjustments left today</span><span className={`rounded-full px-3 py-2 ${hourlyBlocked ? 'bg-red-50 text-red-800' : 'bg-[var(--primary-soft)]'}`}>{hourlyQuota.remaining} of {hourlyQuota.limit} recent AI requests left</span></div></div>
          {apiSource ? <p className="mt-2 text-xs muted">Draft generated. Review and edit before sending.</p> : null}
          {errorMessage || quotaNotice ? <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errorMessage || quotaNotice}</p> : <p className="mt-3 text-sm muted">Describe the payment situation to get one recommended reminder stage and draft. Nothing is sent automatically.</p>}
        </div>
        <div className="p-6">
          {state === 'loading' ? <LoadingResult /> : result ? <Result result={result} copy={copy} /> : <EmptyResult />}
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4 text-xs muted">AI-generated drafts may not fit your specific contract, client relationship, or local rules. This is not legal, financial, accounting, or debt collection advice. Review and edit before sending. Mention late fees, suspension, collections, or legal action only if you have verified that you are allowed to do so.</div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row"><button className="btn btn-secondary" onClick={softer} disabled={!canRefine}>Make it softer</button><button className="btn btn-secondary" onClick={firmer} disabled={!canRefine}>Make it firmer</button><button className="btn btn-secondary" onClick={regenerate} disabled={!canRefine}>Regenerate</button><button className="btn btn-primary" onClick={() => result ? copy(`${result.subject}\n\n${result.body}`, 'email') : undefined} disabled={!result || state === 'loading'}>Copy email</button></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-4"><Gate label="Generate full sequence" open={() => openGate('full_sequence')} /><Gate label="Save this client" open={() => openGate('save_client')} /><Gate label="Save to history" open={() => openGate('history')} /><Gate label="Use my brand voice" open={() => openGate('brand_voice')} /></div>
          <button className="mt-4 text-sm font-semibold text-[var(--primary)]" type="button" onClick={startOver}>Start over</button>
        </div>
      </div>
      {pendingAction ? <ConfirmAction action={pendingAction} close={() => setPendingAction(null)} run={(mode, stage) => generate(mode, stage)} loading={state === 'loading'} /> : null}
      {toast ? <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-white">{toast}</div> : null}
      {waitlist.open ? <Waitlist feature={waitlist.feature} close={() => setWaitlist({ open: false })} /> : null}
    </section>
  );

  function openGate(feature: string) {
    track('pro_waitlist_clicked', { feature });
    track('pro_feature_clicked', { feature });
    setWaitlist({ open: true, feature });
  }
}

function Input({ label, value, onChange, helper, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; helper?: string; type?: string }) {
  return <label><span className="label">{label}</span><input className="input mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} />{helper ? <span className="mt-1 block text-xs muted">{helper}</span> : null}</label>;
}
function EmptyResult() {
  return <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-6 text-sm muted"><h3 className="font-display text-2xl text-[var(--ink)]">Ready when you are.</h3><p className="mt-2">Complete the situation form and click <span className="font-semibold text-[var(--ink)]">Get recommended reminder</span>. Results are shown only after your draft is ready.</p></div>;
}
function Result({ result, copy }: { result: ResultSnapshot; copy: (text: string, kind: string) => void }) {
  return <div><div className="rounded-xl border border-[var(--border)] bg-[var(--primary-soft)] p-4"><p className="label">Recommended stage</p><p className="mt-2 font-display text-3xl">{result.stage}</p><p className="label mt-4">Why this stage?</p><p className="mt-2 text-sm muted">{result.reason}</p>{result.riskNotice ? <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{result.riskNotice}</p> : null}</div><Block title="Subject" text={result.subject} onCopy={() => copy(result.subject, 'subject')} /><Block title="Email" text={result.body} onCopy={() => copy(result.body, 'email_body')} /><Block title="Short DM" text={result.dm} onCopy={() => copy(result.dm, 'short_dm')} /></div>;
}
function Block({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return <div className="mt-5"><div className="mb-2 flex items-center justify-between"><span className="label">{title}</span><button className="text-sm font-semibold text-[var(--primary)]" onClick={onCopy}>Copy</button></div><pre className="whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-white p-4 text-sm leading-6">{text}</pre></div>;
}
function Gate({ label, open }: { label: string; open: () => void }) {
  return <button className="rounded-xl border border-[var(--border)] bg-white p-3 text-sm font-semibold" onClick={open}>{label}</button>;
}
function Spinner() {
  return <span aria-hidden className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}
function LoadingResult() {
  return <div role="status" className="rounded-xl bg-[var(--paper)] p-8 text-center muted"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"><Spinner /></div><p className="font-semibold text-[var(--ink)]">Generating your reminder…</p><p className="mt-2 text-sm">Recommending a stage and drafting your message. Please do not refresh or click again.</p></div>;
}
function ConfirmAction({ action, close, run, loading }: { action: PendingAction; close: () => void; run: (mode: RefinementMode, stage: ReminderStage) => void; loading: boolean }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"><div className="paper-card relative max-w-lg p-6"><button aria-label="Close dialog" className="absolute right-4 top-4 text-2xl leading-none muted hover:text-[var(--ink)]" onClick={close} disabled={loading}>×</button><h2 className="font-display pr-8 text-3xl">{action.title}</h2><p className="mt-3 muted">{action.body}</p><div className="mt-5 flex flex-col gap-2 sm:flex-row"><button className="btn btn-primary" onClick={() => run(action.primaryMode, action.primaryStage)} disabled={loading}>{loading ? <span className="inline-flex items-center gap-2"><Spinner /> Generating…</span> : action.primaryLabel}</button>{action.secondaryLabel && action.secondaryMode && action.secondaryStage ? <button className="btn btn-secondary" onClick={() => run(action.secondaryMode!, action.secondaryStage!)} disabled={loading}>{action.secondaryLabel}</button> : null}</div></div></div>;
}
function Waitlist({ close, feature }: { close: () => void; feature?: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [featureInterest, setFeatureInterest] = useState(feature || 'Full reminder sequence');
  const [frequency, setFrequency] = useState('A few times a year');
  const [willingness, setWillingness] = useState('$9/month');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.');
      track('error_shown', { type: 'waitlist_email' });
      return;
    }
    try {
      await submitWaitlist({
        email,
        role,
        biggestPaymentProblem: `${featureInterest}; late payment frequency: ${frequency}; pricing willingness: ${willingness}`,
        sourcePage: window.location.pathname,
        featureInterest
      });
      track('waitlist_submitted', { source: 'modal', feature: featureInterest, willingness });
      setDone(true);
    } catch (e) {
      setError((e as Error).message || 'Could not join the waitlist. Please try again.');
      track('error_shown', { type: 'waitlist_api' });
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <div className="paper-card max-w-lg p-6">
        <h2 className="font-display text-3xl">{done ? 'You’re on the Pro Waitlist.' : 'Want the next follow-up too?'}</h2>
        {done ? (
          <p className="mt-3 muted">Thanks. We’ll use beta feedback to decide which Pro features to build first.</p>
        ) : (
          <>
            <p className="mt-3 muted">FreelancerReply Pro is planned to help with full reminder sequences, saved clients, reminder history, brand voice, and more freelancer email tools. No payment required.</p>
            <label className="mt-5 block"><span className="label">Email address</span><input className="input mt-1" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="mt-3 block"><span className="label">What kind of freelancer are you?</span><select className="input mt-1" value={role} onChange={(e) => setRole(e.target.value)}>{['Designer', 'Developer', 'Copywriter', 'Marketer', 'Consultant', 'Virtual assistant', 'Solo agency', 'Other'].map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="mt-3 block"><span className="label">Which Pro feature would help you most?</span><select className="input mt-1" value={featureInterest} onChange={(e) => { setFeatureInterest(e.target.value); track('pro_feature_selected', { feature: e.target.value }); }}>{['Full reminder sequence', 'Saved clients', 'Reminder history', 'Brand voice', 'More freelancer email tools', 'Higher usage limits', 'Not sure yet'].map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="mt-3 block"><span className="label">How often do clients pay late?</span><select className="input mt-1" value={frequency} onChange={(e) => setFrequency(e.target.value)}>{['Rarely', 'A few times a year', 'Monthly', 'Often', 'Prefer not to say'].map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="mt-3 block"><span className="label">What would feel reasonable if Pro launches?</span><select className="input mt-1" value={willingness} onChange={(e) => { setWillingness(e.target.value); track('pricing_willingness_selected', { value: e.target.value }); }}>{['$5/month', '$9/month', '$19/month', 'One-time payment', 'Not sure yet', 'I only want the free beta'].map((x) => <option key={x}>{x}</option>)}</select></label>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
            <p className="mt-2 text-xs muted">By joining the waitlist, you agree that we may store your email to contact you about FreelancerReply. You can request deletion later.</p>
          </>
        )}
        <div className="mt-5 flex gap-2">
          {done ? null : <button className="btn btn-primary" onClick={submit}>Join Pro Waitlist</button>}
          <button className="btn btn-secondary" onClick={close}>{done ? 'Back to generator' : 'Not now'}</button>
        </div>
      </div>
    </div>
  );
}

function recommendStage(form: FormState): Recommendation {
  const days = Number(form.days);
  const previous = countPrevious(form.previousReminders);
  const relationshipPhrase = form.relationship === 'Long-term client' ? ' Because this is a long-term client, the wording should stay relationship-aware.' : form.relationship === 'New client' ? ' Because this is a new client, the draft should be clear without assuming bad intent.' : '';
  if (Number.isNaN(days)) return { stage: 'Gentle Reminder', reason: 'Please enter a valid overdue day count so FreelancerReply can recommend a stage.' };
  if (days <= 0) return { stage: 'Due Soon / Due Today', reason: 'The invoice is not overdue yet or is due today, so a light reminder is more appropriate than a collection-style follow-up.' };
  if (days <= 6) {
    if (previous >= 2) return { stage: 'Firm Reminder', reason: `The invoice is only ${days} days overdue, but you have already sent multiple reminders. A more direct reminder is reasonable while staying professional.${relationshipPhrase}` };
    return { stage: 'Gentle Reminder', reason: `The invoice is ${days} days overdue and you have sent ${previous === 0 ? 'no previous reminders' : 'one previous reminder'}, so a gentle follow-up is a safer starting point.${relationshipPhrase}` };
  }
  if (days <= 20) return { stage: 'Firm Reminder', reason: `The invoice is ${days} days overdue${previous ? ` and you have already sent ${previous} reminder${previous > 1 ? 's' : ''}` : ''}, so a direct but relationship-safe follow-up is appropriate.${relationshipPhrase}` };
  if (days <= 29) {
    if (previous >= 2) return { stage: 'Final Notice', reason: `The invoice is significantly overdue and you have already sent multiple reminders, so a final notice may be appropriate. Review carefully before sending.${relationshipPhrase}`, riskNotice: finalNoticeWarning };
    return { stage: 'Firm Reminder', reason: `The invoice is ${days} days overdue, but you have sent ${previous === 0 ? 'no previous reminders' : 'only one previous reminder'}. A firm reminder is safer than starting with a final notice.${relationshipPhrase}` };
  }
  if (previous >= 2) return { stage: 'Final Notice', reason: `The invoice is over 30 days overdue and you have already sent multiple reminders, so Final Notice wording may be appropriate. Review carefully before sending.${relationshipPhrase}`, riskNotice: finalNoticeWarning };
  return { stage: 'Firm Reminder', reason: `Even though the invoice is over 30 days overdue, this appears to be ${previous === 0 ? 'your first reminder' : 'only your second reminder'}. A firm reminder is safer than starting with a final notice.${relationshipPhrase}` };
}
const finalNoticeWarning = 'Final notices can have legal or business consequences. This is not legal advice. Do not mention late fees, collections, service suspension, or legal action unless you have confirmed your agreement and applicable rules allow it.';
function adjacentStage(stage: ReminderStage, direction: -1 | 1): ReminderStage {
  const order: ReminderStage[] = ['Due Soon / Due Today', 'Gentle Reminder', 'Firm Reminder', 'Final Notice'];
  const index = order.indexOf(stage);
  return order[Math.max(0, Math.min(order.length - 1, index + direction))];
}
function toneForStage(stage: ReminderStage, mode: RefinementMode) {
  if (mode === 'softer') return 'Friendly';
  if (stage === 'Final Notice') return 'Final Notice';
  if (stage === 'Firm Reminder' || mode === 'firmer') return 'Firm';
  return 'Professional';
}
function refinementReason(mode: RefinementMode, stage: ReminderStage, original: ReminderStage) {
  if (mode === 'softer') return `The user asked to make the ${original} draft softer while keeping the payment request clear.`;
  if (mode === 'firmer') return `The user asked to make the ${original} draft firmer. Keep it professional and avoid unsupported legal threats.`;
  return `Regenerate the current ${stage} draft with the same situation.`;
}
function normalizeApiResult(api: GenerateApiResponse, stage: ReminderStage, reason: string, mode: RefinementMode, submittedForm: FormState): ResultSnapshot {
  if ('recommendedStage' in api) {
    return { stage: api.recommendedStage, reason: api.stageReason, subject: api.subject, body: api.emailBody, dm: api.shortMessage, riskNotice: api.riskNotice, disclaimer: api.disclaimer, refinementMode: mode, submittedForm, reminderSessionId: api.meta?.reminderSessionId, reminderSession: api.meta?.reminderSession };
  }
  const selected = draftForStage(api, stage);
  return { stage, reason, subject: selected.subject, body: selected.emailBody, dm: selected.shortMessage, riskNotice: stage === 'Final Notice' ? finalNoticeWarning : undefined, disclaimer: api.disclaimer, refinementMode: mode, submittedForm, reminderSessionId: api.meta?.reminderSessionId, reminderSession: api.meta?.reminderSession };
}
function draftForStage(api: { gentle: ApiDraft; firm: ApiDraft; finalNotice: ApiDraft }, stage: ReminderStage) {
  if (stage === 'Final Notice') return api.finalNotice;
  if (stage === 'Firm Reminder') return api.firm;
  return api.gentle;
}
function messageForApiError(e: { code?: string; status?: number; message?: string; resetAt?: string }, mode: RefinementMode = 'initial') {
  if (e.code === 'REMINDER_SESSION_REQUIRED' || e.code === 'REMINDER_SESSION_NOT_FOUND') return 'Start a new reminder before making adjustments.';
  if (e.code === 'REMINDER_SESSION_REFINEMENT_LIMIT_REACHED') return 'This draft has already used its free adjustment. Start a new reminder to adjust another draft.';
  if (e.code === 'QUOTA_EXCEEDED' || e.status === 402) {
    return mode === 'initial'
      ? `You’ve used today’s free reminder drafts. Come back after ${formatReset(e.resetAt)} or join the waitlist for higher limits.`
      : `You’ve used today’s free adjustments. Come back after ${formatReset(e.resetAt)} or join the waitlist for higher limits.`;
  }
  if (e.code === 'RATE_LIMITED' || e.status === 429) return 'You’ve made several AI requests recently. Please wait a bit and try again.';
  if (e.code === 'PROVIDER_UNAVAILABLE' || e.status === 503) return 'The generator is temporarily unavailable. Please try again in a few minutes.';
  if (e.code === 'REQUEST_TIMEOUT' || e.status === 408) return 'The generator took too long to respond. Please refresh the security check and try again.';
  if (e.code === 'NETWORK_ERROR' || e.code === 'UPSTREAM_UNAVAILABLE') return 'Could not reach the generator service. Please refresh and try again.';
  if (e.code === 'TURNSTILE_FAILED' || e.status === 403) return 'Security verification failed. Please refresh and try again.';
  if (e.code === 'VALIDATION_ERROR') return e.message || 'Some details are invalid. Please review your inputs.';
  return e.message || 'Something went wrong while generating your draft. Please try again.';
}
