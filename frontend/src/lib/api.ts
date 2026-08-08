export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://freelancer-reply-api.huangzhenhui0303.workers.dev').replace(/\/$/, '');

export type ApiDraft = { subject: string; emailBody: string; shortMessage: string };
export type GenerateApiResponse = {
  gentle: ApiDraft;
  firm: ApiDraft;
  finalNotice: ApiDraft;
  disclaimer: string;
  meta?: {
    source?: 'ai_provider' | 'template_fallback';
    quota?: { used: number; limit: number; remaining: number; resetAt: string };
    inputStored?: false;
  };
};
export type UsageApiResponse = {
  ok: boolean;
  usage: {
    generatePaymentReminder: { used: number; limit: number; remaining: number; resetAt: string };
    waitlistSubmit: { used: number; limit: number; remaining: number; resetAt: string };
  };
};
export type ApiError = Error & { code?: string; status?: number; resetAt?: string };

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || data.error || `API request failed with ${res.status}`) as ApiError;
    error.code = data.code || data.error;
    error.status = res.status;
    error.resetAt = data.resetAt;
    throw error;
  }
  return data as T;
}

export async function createAnonymousSession() {
  return apiFetch('/api/auth/login', { method: 'POST' });
}

export async function getUsage() {
  return apiFetch<UsageApiResponse>('/api/usage', { method: 'GET', headers: {} });
}

export async function generatePaymentReminder(input: {
  clientName: string;
  invoiceAmount: string;
  daysOverdue: number;
  projectType: string;
  tone: string;
  invoiceNumber?: string;
  paymentLink?: string;
  clientRelationship?: string;
}) {
  return apiFetch<GenerateApiResponse>('/api/generate-payment-reminder', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function submitWaitlist(input: {
  email: string;
  role?: string;
  biggestPaymentProblem?: string;
  sourcePage?: string;
  featureInterest?: string;
}) {
  return apiFetch<{ ok: true; message: string; stored: { email: true; generatorInput: false } }>('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
