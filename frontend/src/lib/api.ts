export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.freelancerreply.com').replace(/\/$/, '');

export type ReminderStage = 'Due Soon / Due Today' | 'Gentle Reminder' | 'Firm Reminder' | 'Final Notice';
export type PreviousReminders = 'none' | 'one' | 'two' | 'three_plus';
export type ClientRelationship = 'New client' | 'Repeat client' | 'Long-term client';
export type RefinementMode = 'initial' | 'softer' | 'firmer' | 'regenerate';

export type ApiDraft = { subject: string; emailBody: string; shortMessage: string };
export type Quota = { used: number; limit: number; remaining: number; resetAt: string };
export type GenerateMeta = {
  source?: 'ai_provider' | 'template_fallback';
  provider?: string;
  model?: string;
  quota?: Quota;
  inputStored?: false;
  usage?: {
    provider?: string;
    requestedModel?: string;
    actualModel?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    providerCost?: number;
    providerCostUnit?: string;
  };
  reminderSessionId?: string;
  reminderSession?: { id: string; refinementCount: number; refinementLimit: number };
};

export type LegacyGenerateApiResponse = {
  gentle: ApiDraft;
  firm: ApiDraft;
  finalNotice: ApiDraft;
  disclaimer: string;
  meta?: GenerateMeta;
};
export type RecommendedGenerateApiResponse = {
  recommendedStage: ReminderStage;
  stageReason: string;
  subject: string;
  emailBody: string;
  shortMessage: string;
  riskNotice?: string;
  disclaimer?: string;
  meta?: GenerateMeta;
};
export type GenerateApiResponse = LegacyGenerateApiResponse | RecommendedGenerateApiResponse;
export type UsageApiResponse = {
  ok: boolean;
  usage: {
    generatePaymentReminder: Quota;
    refinePaymentReminder?: Quota;
    hourlyAiCalls?: Quota;
    waitlistSubmit: Quota;
  };
};
export type ApiError = Error & { code?: string; status?: number; resetAt?: string };

const DEFAULT_API_TIMEOUT_MS = 12_000;
const GENERATE_API_TIMEOUT_MS = 45_000;

async function apiFetch<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_API_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      signal: controller.signal,
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
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error('The request timed out. Please try again.') as ApiError;
      timeoutError.code = 'REQUEST_TIMEOUT';
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
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
  previousRemindersSent: PreviousReminders;
  recommendedStage: ReminderStage;
  refinementMode?: RefinementMode;
  stageReason?: string;
  tone?: string;
  invoiceNumber?: string;
  paymentLink?: string;
  clientRelationship?: string;
  turnstileToken?: string;
  reminderSessionId?: string;
}) {
  return apiFetch<GenerateApiResponse>('/api/generate-payment-reminder', {
    method: 'POST',
    body: JSON.stringify(input)
  }, GENERATE_API_TIMEOUT_MS);
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
