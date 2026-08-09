"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/site';
import { track } from '@/lib/analytics';
import type { PreviousReminders } from '@/lib/api';

const reminderOptions: { label: string; value: PreviousReminders }[] = [
  { label: 'None', value: 'none' },
  { label: '1 reminder', value: 'one' },
  { label: '2 reminders', value: 'two' },
  { label: '3+ reminders', value: 'three_plus' }
];

export function ToolEntry() {
  const router = useRouter();
  const [form, setForm] = useState({ clientName: '', amount: '', days: '', project: '', previousReminders: 'none' as PreviousReminders });
  const submit = () => {
    track('cta_click', { location: 'home_tool_entry' });
    const q = new URLSearchParams(form).toString();
    router.push(`${routes.tool}?${q}`);
  };
  return <section id="tool-entry" className="section !pt-0 scroll-mt-24"><div className="paper-card grid gap-8 p-6 md:p-8 lg:grid-cols-[.9fr_1.1fr] mobile-stack"><div><p className="label">Available now</p><h2 className="mt-3 font-display text-4xl font-medium">Late Payment Reminder Email Generator</h2><p className="mt-4 muted">Not sure whether to send a gentle reminder, a firm follow-up, or a final notice? Tell us the situation and get the recommended next message.</p><p className="mt-4 text-sm muted">Nothing is sent automatically. FreelancerReply creates drafts only.</p></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Client name" placeholder="Sarah" value={form.clientName} onChange={v=>setForm({...form,clientName:v})}/><Input label="Invoice amount" placeholder="$850" value={form.amount} onChange={v=>setForm({...form,amount:v})}/><Input label="Days overdue" placeholder="12" value={form.days} onChange={v=>setForm({...form,days:v})}/><Input label="Project or service" placeholder="Website redesign" value={form.project} onChange={v=>setForm({...form,project:v})}/><fieldset className="sm:col-span-2"><legend className="label mb-2">Previous reminders sent</legend><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{reminderOptions.map(option=><button key={option.value} type="button" className={`chip justify-center text-center ${form.previousReminders===option.value?'chip-active':''}`} aria-pressed={form.previousReminders===option.value} onClick={()=>setForm({...form,previousReminders:option.value})}>{option.label}</button>)}</div></fieldset><button className="btn btn-primary sm:col-span-2" onClick={submit}>Get recommended reminder</button></div></div></section>;
}
function Input(p:{label:string;placeholder:string;value:string;onChange:(v:string)=>void}){return <label><span className="label">{p.label}</span><input className="input mt-1" placeholder={p.placeholder} value={p.value} onChange={e=>p.onChange(e.target.value)}/></label>}
