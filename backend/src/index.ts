export interface Env {
  DB: D1Database;
  TASK_QUEUE?: Queue;
  SESSION_SECRET: string;
  AI_PROVIDER?: string;
  AI_PROVIDER_API_KEY?: string;
  AI_PROVIDER_BASE_URL?: string;
  AI_MODEL?: string;
  AI_MAX_TOKENS?: string;
  TURNSTILE_SECRET_KEY?: string;
  SITE_NAME: string;
  SITE_SLUG: string;
  APP_ORIGIN: string;
  APP_ORIGINS?: string;
  ENVIRONMENT: string;
  PRODUCT_TYPE: string;
  API_VERSION?: string;
  ANON_DAILY_REMINDER_SESSIONS?: string;
  ANON_REFINEMENTS_PER_SESSION?: string;
  EMAIL_VERIFIED_DAILY_REMINDER_SESSIONS?: string;
  EMAIL_VERIFIED_REFINEMENTS_PER_SESSION?: string;
  FREE_DAILY_GENERATE_LIMIT?: string;
  FREE_HOURLY_GENERATE_LIMIT?: string;
  ANON_LOGIN_DAILY_LIMIT?: string;
  WAITLIST_DAILY_LIMIT?: string;
  ALLOW_TEMPLATE_FALLBACK?: string;
  LOG_RETENTION_DAYS?: string;
}

type Actor = {
  actorType: 'anonymous' | 'user';
  actorId: string;
  userId?: string;
  sessionId?: string;
};

type ReminderStage = 'Due Soon / Due Today' | 'Gentle Reminder' | 'Firm Reminder' | 'Final Notice';
type PreviousReminders = 'none' | 'one' | 'two' | 'three_plus';
type RefinementMode = 'initial' | 'softer' | 'firmer' | 'regenerate';

type GenerateInput = {
  clientName: string;
  invoiceAmount: string;
  daysOverdue: number;
  projectType: string;
  previousRemindersSent?: PreviousReminders;
  recommendedStage?: ReminderStage;
  refinementMode?: RefinementMode;
  stageReason?: string;
  tone?: string;
  invoiceNumber?: string;
  paymentLink?: string;
  clientRelationship?: string;
  turnstileToken?: string;
};

type NormalizedGenerateInput = {
  clientName: string;
  invoiceAmount: string;
  daysOverdue: number;
  projectType: string;
  previousRemindersSent: PreviousReminders;
  recommendedStage: ReminderStage;
  refinementMode: RefinementMode;
  stageReason: string;
  tone: string | null;
  invoiceNumber: string | null;
  paymentLink: string | null;
  clientRelationship: string | null;
};

type ReminderDraft = { subject: string; emailBody: string; shortMessage: string };

type RecommendedReminderResponse = ReminderDraft & {
  recommendedStage: ReminderStage;
  stageReason: string;
  riskNotice?: string;
  disclaimer: string;
  meta: {
    source: 'ai_provider' | 'template_fallback';
    provider?: string;
    model?: string;
    usage?: AiUsage;
    quota: { used: number; limit: number; remaining: number; resetAt: string };
    inputStored: false;
    refinementMode: RefinementMode;
  };
};

type AiUsage = {
  provider: string;
  providerRequestId?: string;
  requestedModel: string;
  actualModel?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens: number;
  cachedTokens: number;
  cacheWriteTokens: number;
  providerCost?: number;
  providerCostUnit?: string;
  upstreamInferenceCost?: number;
};

type AiGenerationResult = {
  draft: Omit<RecommendedReminderResponse, 'meta'>;
  usage: AiUsage;
};

const API_VERSION = '2026-08-07.v2-amended';
const SESSION_COOKIE = 'fr_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const ACTION_LOGIN = 'anonymous_session_create';
const ACTION_GENERATE = 'generate_payment_reminder';
const ACTION_REFINE = 'refine_payment_reminder';
const ACTION_WAITLIST = 'waitlist_submit';
const ACTION_EVENT = 'analytics_event';

const LEGAL_DISCLAIMER = 'This is not legal, financial, accounting, tax, or debt collection advice. Review and edit before sending. Mention late fees, suspension, collections, or legal action only if you have verified your contract and applicable rules.';
const FINAL_NOTICE_WARNING = 'Final notices can have legal or business consequences. This is not legal advice. Do not mention late fees, collections, service suspension, or legal action unless you have confirmed your agreement and applicable rules allow it.';
const STAGES: ReminderStage[] = ['Due Soon / Due Today', 'Gentle Reminder', 'Firm Reminder', 'Final Notice'];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), request, env);
      const url = new URL(request.url);
      if (!url.pathname.startsWith('/api/')) return json({ ok: false, error: 'not_found' }, 404, request, env);

      if (request.method === 'GET' && url.pathname === '/api/health') return handleHealth(request, env);
      if (request.method === 'POST' && url.pathname === '/api/auth/login') return handleAnonymousLogin(request, env);
      if (request.method === 'GET' && (url.pathname === '/api/auth/me' || url.pathname === '/api/me')) return handleMe(request, env);
      if (request.method === 'GET' && url.pathname === '/api/usage') return handleUsage(request, env);
      if (request.method === 'POST' && url.pathname === '/api/generate-payment-reminder') return handleGenerate(request, env, ctx);
      if (request.method === 'POST' && url.pathname === '/api/waitlist') return handleWaitlist(request, env);
      if (request.method === 'POST' && url.pathname === '/api/events') return handleEvent(request, env);

      return json({ ok: false, error: 'not_found' }, 404, request, env);
    } catch (error) {
      console.error('request_failed', safeError(error));
      return json({ ok: false, error: 'internal_error', code: 'INTERNAL_ERROR', message: 'Unexpected backend error.' }, 500, request, env);
    }
  },

  async queue(batch: MessageBatch<unknown>, _env: Env): Promise<void> {
    for (const message of batch.messages) {
      console.log('task_queue_message', { id: message.id, bodyType: typeof message.body });
      message.ack();
    }
  }
};

async function handleHealth(request: Request, env: Env) {
  return json({
    ok: true,
    service: 'freelancer-reply-api',
    siteName: env.SITE_NAME,
    siteSlug: env.SITE_SLUG,
    productType: env.PRODUCT_TYPE,
    version: env.API_VERSION || API_VERSION,
    environment: env.ENVIRONMENT,
    p0Boundary: {
      noAccountRequired: true,
      noPayment: true,
      noAutomaticEmailSending: true,
      noCrm: true,
      generatorInputsStoredServerSide: false,
      waitlistEmailStored: true,
      outputMode: 'recommended_reminder_single_draft'
    },
    bindings: {
      d1: Boolean(env.DB),
      queue: Boolean(env.TASK_QUEUE),
      r2: false,
      aiProvider: env.AI_PROVIDER || providerName(env),
      aiModel: env.AI_MODEL || 'openai/gpt-4.1-mini',
      aiMaxTokens: getInt(env.AI_MAX_TOKENS, 1400),
      aiProviderConfigured: Boolean(env.AI_PROVIDER_API_KEY),
      turnstileConfigured: Boolean(env.TURNSTILE_SECRET_KEY)
    },
    limits: reminderLimits(env),
    time: new Date().toISOString()
  }, 200, request, env);
}

async function handleAnonymousLogin(request: Request, env: Env) {
  requireSessionSecret(env);
  const ipActor = await getIpActor(request, env);
  const quota = await consumeQuota(env, ipActor, ACTION_LOGIN, 1, request);
  if (!quota.allowed) return errorJson('RATE_LIMITED', 'Too many anonymous session requests.', 429, request, env, { resetAt: quota.resetAt });

  const now = new Date();
  const userId = `anon_${crypto.randomUUID()}`;
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO users (id, user_type, plan, role, created_at, updated_at) VALUES (?, 'anonymous', 'free', 'user', ?, ?)`).bind(userId, now.toISOString(), now.toISOString()),
    env.DB.prepare(`INSERT INTO sessions (id, user_id, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)`).bind(sessionId, userId, expiresAt, now.toISOString(), now.toISOString())
  ]);

  const signed = await signSession(sessionId, env.SESSION_SECRET);
  const response = json({
    ok: true,
    mode: 'anonymous_session',
    message: 'P0 has no account login. This endpoint issues an anonymous httpOnly session for quota and usage state only.',
    user: { id: userId, type: 'anonymous', plan: 'free' },
    expiresAt
  }, 200, request, env);
  response.headers.append('Set-Cookie', buildSessionCookie(signed, env));
  return response;
}

async function handleMe(request: Request, env: Env) {
  const actor = await getActor(request, env);
  if (!actor.userId) {
    return json({
      authenticated: false,
      user: null,
      plan: 'anonymous_free_beta',
      entitlements: entitlementsForPlan('free', env),
      p0Boundary: { accountLogin: false, paidPlan: false }
    }, 200, request, env);
  }
  const user = await env.DB.prepare(`SELECT id, user_type, email, plan, role, created_at FROM users WHERE id = ?`).bind(actor.userId).first<any>();
  if (!user) return json({ authenticated: false, user: null, plan: 'anonymous_free_beta', entitlements: entitlementsForPlan('free', env) }, 200, request, env);
  return json({
    authenticated: true,
    user: { id: user.id, type: user.user_type, email: user.email, plan: user.plan, role: user.role, createdAt: user.created_at },
    plan: user.email ? 'email_verified_free_beta' : 'anonymous_free_beta',
    entitlements: entitlementsForPlan(user.plan, env),
    p0Boundary: { accountLogin: false, paidPlan: false }
  }, 200, request, env);
}

async function handleUsage(request: Request, env: Env) {
  const actor = await getActor(request, env);
  const generateQuota = await readOrCreateQuota(env, actor, ACTION_GENERATE, 'daily');
  const waitlistQuota = await readOrCreateQuota(env, actor, ACTION_WAITLIST, 'daily');
  const aiCostSummary = await readAiCostSummary(env, actor);
  const limits = reminderLimits(env);
  return json({
    ok: true,
    actor: { type: actor.actorType, authenticated: Boolean(actor.userId), emailVerified: false },
    usage: {
      generatePaymentReminder: quotaView(generateQuota),
      waitlistSubmit: quotaView(waitlistQuota),
      aiCostSummary
    },
    limits: {
      anonymous: {
        dailyReminderSessions: limits.anonymousDailyReminderSessions,
        refinementsPerSession: limits.anonymousRefinementsPerSession,
        maxAiCallsPerDay: limits.anonymousDailyReminderSessions * (1 + limits.anonymousRefinementsPerSession),
        hourlyAiCalls: getInt(env.FREE_HOURLY_GENERATE_LIMIT, 4)
      },
      emailVerifiedFree: {
        dailyReminderSessions: limits.emailVerifiedDailyReminderSessions,
        refinementsPerSession: limits.emailVerifiedRefinementsPerSession,
        maxAiCallsPerDay: limits.emailVerifiedDailyReminderSessions * (1 + limits.emailVerifiedRefinementsPerSession)
      },
      pro: { status: 'waitlist_only_p0', monthlyReminderSessions: null }
    },
    notes: [
      'P0 amended quota is session-oriented: anonymous free allows 2 reminder sessions/day with 1 refinement/session by default.',
      'Current backend stores AI call cost and token data, but does not persist raw generator input or generated output.',
      'Email-verified higher quota is a documented P0/P1 direction but email verification is not implemented yet.'
    ]
  }, 200, request, env);
}

async function handleGenerate(request: Request, env: Env, ctx: ExecutionContext) {
  requireSessionSecret(env);
  const actor = await getActor(request, env);
  const body = await parseJson<GenerateInput>(request);
  const validation = validateGenerateInput(body);
  if (!validation.ok) {
    await logUsage(env, actor, request, ACTION_GENERATE, 0, 'validation_error', { error: validation.error });
    return errorJson('VALIDATION_ERROR', validation.error || 'Invalid request.', 400, request, env);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    if (!body.turnstileToken) return errorJson('TURNSTILE_FAILED', 'Bot protection token is required.', 403, request, env);
    const turnstile = await verifyTurnstile(body.turnstileToken, getClientIp(request), env);
    if (!turnstile.success) return errorJson('TURNSTILE_FAILED', 'Bot protection check failed.', 403, request, env);
  }

  const ipActor = await getIpActor(request, env);
  const ipHourly = await consumeQuota(env, ipActor, `${ACTION_GENERATE}:hourly`, 1, request, 'hourly');
  if (!ipHourly.allowed) return errorJson('RATE_LIMITED', 'Too many generation requests this hour.', 429, request, env, { resetAt: ipHourly.resetAt });

  const safeInput = normalizeGenerateInput(body);
  const quotaAction = safeInput.refinementMode === 'initial' ? ACTION_GENERATE : ACTION_REFINE;
  const quota = await consumeQuota(env, actor, quotaAction, 1, request, 'daily');
  if (!quota.allowed) {
    const message = quotaAction === ACTION_GENERATE ? 'Free beta daily reminder session quota reached.' : 'Free beta daily refinement quota reached.';
    return errorJson('QUOTA_EXCEEDED', message, 402, request, env, { resetAt: quota.resetAt });
  }
  const taskId = crypto.randomUUID();
  const inputHash = await hmac(JSON.stringify(safeInput), env.SESSION_SECRET);
  await env.DB.prepare(`INSERT INTO tasks (id, task_type, status, input_hash, created_at) VALUES (?, 'generate_payment_reminder', 'completed', ?, ?)`).bind(taskId, inputHash, new Date().toISOString()).run();

  let draft: Omit<RecommendedReminderResponse, 'meta'>;
  let aiUsage: AiUsage | undefined;
  let source: 'ai_provider' | 'template_fallback' = 'template_fallback';
  if (env.AI_PROVIDER_API_KEY) {
    try {
      const ai = await generateWithAI(safeInput, env);
      draft = ai.draft;
      aiUsage = ai.usage;
      source = 'ai_provider';
    } catch (error) {
      console.warn('ai_provider_failed', safeError(error));
      if (env.ALLOW_TEMPLATE_FALLBACK !== 'true') {
        await logUsage(env, actor, request, ACTION_GENERATE, 1, 'provider_unavailable');
        return errorJson('PROVIDER_UNAVAILABLE', 'AI provider is unavailable. Please try again later.', 503, request, env);
      }
      draft = generateTemplateReminder(safeInput);
    }
  } else {
    draft = generateTemplateReminder(safeInput);
  }

  ctx.waitUntil(logUsage(env, actor, request, quotaAction, 1, source === 'ai_provider' ? 'success_ai' : 'success_template', { taskId, source, refinementMode: safeInput.refinementMode, recommendedStage: safeInput.recommendedStage }, aiUsage));
  if (aiUsage) ctx.waitUntil(logAiGenerationCost(env, actor, request, taskId, aiUsage, 'success'));
  if (env.TASK_QUEUE) ctx.waitUntil(env.TASK_QUEUE.send({ type: 'generation_completed', taskId, source, stage: draft.recommendedStage, refinementMode: safeInput.refinementMode, at: new Date().toISOString() }).catch((err) => console.warn('queue_send_failed', safeError(err))));

  const latest = await readOrCreateQuota(env, actor, ACTION_GENERATE, 'daily');
  const response: RecommendedReminderResponse = {
    ...draft,
    meta: { source, provider: aiUsage?.provider || providerName(env), model: aiUsage?.actualModel || env.AI_MODEL, usage: aiUsage, quota: quotaView(latest), inputStored: false, refinementMode: safeInput.refinementMode }
  };
  return json(response, 200, request, env);
}

async function handleWaitlist(request: Request, env: Env) {
  requireSessionSecret(env);
  const actor = await getActor(request, env);
  const quota = await consumeQuota(env, actor, ACTION_WAITLIST, 1, request, 'daily');
  if (!quota.allowed) return errorJson('RATE_LIMITED', 'Too many waitlist submissions.', 429, request, env, { resetAt: quota.resetAt });

  const body = await parseJson<any>(request);
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return errorJson('VALIDATION_ERROR', 'Valid email is required.', 400, request, env);
  const role = trimOptional(body.role, 80);
  const problem = trimOptional(body.biggestPaymentProblem || body.biggest_payment_problem || body.problem, 500);
  const sourcePage = trimOptional(body.sourcePage || body.source_page || body.source, 160) || '/';
  const featureInterest = trimOptional(body.featureInterest || body.feature_interest, 120);
  const ipHash = await hashIp(getClientIp(request), env.SESSION_SECRET);
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO waitlist_subscribers (id, email, role, biggest_payment_problem, source_page, feature_interest, ip_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET role = COALESCE(excluded.role, waitlist_subscribers.role), biggest_payment_problem = COALESCE(excluded.biggest_payment_problem, waitlist_subscribers.biggest_payment_problem), source_page = excluded.source_page, feature_interest = COALESCE(excluded.feature_interest, waitlist_subscribers.feature_interest)`).bind(id, email, role, problem, sourcePage, featureInterest, ipHash, new Date().toISOString()).run();
  await logUsage(env, actor, request, ACTION_WAITLIST, 1, 'success');
  return json({ ok: true, message: 'You are on the FreelancerReply Pro waitlist.', stored: { email: true, generatorInput: false } }, 200, request, env);
}

async function handleEvent(request: Request, env: Env) {
  requireSessionSecret(env);
  const actor = await getActor(request, env);
  const body = await parseJson<any>(request);
  const eventName = trimOptional(body.event || body.eventName, 80);
  if (!eventName || !/^[a-zA-Z0-9_:-]+$/.test(eventName)) return errorJson('VALIDATION_ERROR', 'Valid event name is required.', 400, request, env);
  const ipHash = await hashIp(getClientIp(request), env.SESSION_SECRET);
  await env.DB.prepare(`INSERT INTO analytics_events (id, event_name, page, tone, anonymous_id, ip_hash, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(
    crypto.randomUUID(), eventName, trimOptional(body.page, 180), trimOptional(body.tone, 40), actor.actorType === 'anonymous' ? actor.actorId : null, ipHash, safeMetadata(body.props || body.metadata || {}), new Date().toISOString()
  ).run();
  await logUsage(env, actor, request, ACTION_EVENT, 0, 'success', { eventName });
  return json({ ok: true }, 200, request, env);
}

async function getActor(request: Request, env: Env): Promise<Actor> {
  requireSessionSecret(env);
  const signed = parseCookie(request.headers.get('cookie') || '', SESSION_COOKIE);
  if (signed) {
    const sessionId = await verifySession(signed, env.SESSION_SECRET);
    if (sessionId) {
      const row = await env.DB.prepare(`SELECT id, user_id, expires_at FROM sessions WHERE id = ?`).bind(sessionId).first<any>();
      if (row && Date.parse(row.expires_at) > Date.now()) {
        await env.DB.prepare(`UPDATE sessions SET last_seen_at = ? WHERE id = ?`).bind(new Date().toISOString(), sessionId).run();
        return { actorType: 'user', actorId: row.user_id, userId: row.user_id, sessionId };
      }
    }
  }
  return getIpActor(request, env);
}

async function getIpActor(request: Request, env: Env): Promise<Actor> {
  requireSessionSecret(env);
  const ipHash = await hashIp(getClientIp(request), env.SESSION_SECRET);
  return { actorType: 'anonymous', actorId: ipHash };
}

async function readOrCreateQuota(env: Env, actor: Actor, action: string, period: 'daily' | 'hourly') {
  const id = quotaId(actor, action, period);
  const resetAt = period === 'hourly' ? nextUtcHour() : nextUtcMidnight();
  const limit = quotaLimit(env, action, period);
  const existing = await env.DB.prepare(`SELECT used, quota_limit, reset_at FROM quota_counters WHERE id = ?`).bind(id).first<any>();
  if (existing && Date.parse(existing.reset_at) > Date.now()) return existing;
  await env.DB.prepare(`INSERT OR REPLACE INTO quota_counters (id, actor_type, actor_id, action, period, used, quota_limit, reset_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`).bind(id, actor.actorType, actor.actorId, action, period, limit, resetAt, new Date().toISOString()).run();
  return { used: 0, quota_limit: limit, reset_at: resetAt };
}

async function consumeQuota(env: Env, actor: Actor, action: string, units: number, request: Request, period: 'daily' | 'hourly' = 'daily') {
  const quota = await readOrCreateQuota(env, actor, action, period);
  if (quota.used + units > quota.quota_limit) {
    await logUsage(env, actor, request, action, units, period === 'hourly' ? 'rejected_rate_limit' : 'rejected_quota');
    return { allowed: false, remaining: Math.max(0, quota.quota_limit - quota.used), resetAt: quota.reset_at };
  }
  const now = new Date().toISOString();
  const updated = await env.DB.prepare(`UPDATE quota_counters SET used = used + ?, updated_at = ? WHERE id = ? AND used + ? <= quota_limit AND reset_at > ?`).bind(units, now, quotaId(actor, action, period), units, now).run();
  if (!updated.meta || updated.meta.changes !== 1) {
    const latest = await readOrCreateQuota(env, actor, action, period);
    await logUsage(env, actor, request, action, units, 'rejected_quota_race');
    return { allowed: false, remaining: Math.max(0, latest.quota_limit - latest.used), resetAt: latest.reset_at };
  }
  return { allowed: true, remaining: Math.max(0, quota.quota_limit - quota.used - units), resetAt: quota.reset_at };
}

async function logUsage(env: Env, actor: Actor, request: Request, action: string, units: number, status: string, metadata: Record<string, unknown> = {}, aiUsage?: AiUsage) {
  try {
    const ipHash = await hashIp(getClientIp(request), env.SESSION_SECRET);
    await env.DB.prepare(`INSERT INTO usage_logs (id, user_id, anon_id, ip_hash, action, cost_units, status, metadata, provider, provider_request_id, requested_model, actual_model, prompt_tokens, completion_tokens, total_tokens, reasoning_tokens, cached_tokens, cache_write_tokens, provider_cost, provider_cost_unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      crypto.randomUUID(), actor.userId || null, actor.actorType === 'anonymous' ? actor.actorId : null, ipHash, action, units, status, safeMetadata({ path: new URL(request.url).pathname, ...metadata }), aiUsage?.provider || null, aiUsage?.providerRequestId || null, aiUsage?.requestedModel || null, aiUsage?.actualModel || null, aiUsage?.promptTokens || null, aiUsage?.completionTokens || null, aiUsage?.totalTokens || null, aiUsage?.reasoningTokens || null, aiUsage?.cachedTokens || null, aiUsage?.cacheWriteTokens || null, aiUsage?.providerCost ?? null, aiUsage?.providerCostUnit || null
    ).run();
  } catch (error) {
    console.warn('usage_log_failed', safeError(error));
  }
}

async function logAiGenerationCost(env: Env, actor: Actor, request: Request, taskId: string, aiUsage: AiUsage, status: string) {
  try {
    const ipHash = await hashIp(getClientIp(request), env.SESSION_SECRET);
    await env.DB.prepare(`INSERT INTO ai_generation_costs (id, task_id, user_id, anon_id, ip_hash, provider, provider_request_id, requested_model, actual_model, status, prompt_tokens, completion_tokens, total_tokens, reasoning_tokens, cached_tokens, cache_write_tokens, provider_cost, provider_cost_unit, upstream_inference_cost, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      crypto.randomUUID(), taskId, actor.userId || null, actor.actorType === 'anonymous' ? actor.actorId : null, ipHash, aiUsage.provider, aiUsage.providerRequestId || null, aiUsage.requestedModel, aiUsage.actualModel || null, status, aiUsage.promptTokens, aiUsage.completionTokens, aiUsage.totalTokens, aiUsage.reasoningTokens, aiUsage.cachedTokens, aiUsage.cacheWriteTokens, aiUsage.providerCost ?? null, aiUsage.providerCostUnit || null, aiUsage.upstreamInferenceCost ?? null, safeMetadata({ path: new URL(request.url).pathname })
    ).run();
  } catch (error) {
    console.warn('ai_generation_cost_log_failed', safeError(error));
  }
}

async function readAiCostSummary(env: Env, actor: Actor) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const params = actor.userId ? [actor.userId, `${today}%`] : [actor.actorId, `${today}%`];
    const where = actor.userId ? 'user_id = ?' : 'anon_id = ?';
    const row = await env.DB.prepare(`SELECT COUNT(*) AS requests, COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens, COALESCE(SUM(completion_tokens), 0) AS completion_tokens, COALESCE(SUM(total_tokens), 0) AS total_tokens, COALESCE(SUM(provider_cost), 0) AS provider_cost FROM ai_generation_costs WHERE ${where} AND created_at LIKE ?`).bind(...params).first<any>();
    return { period: 'today_utc', providerCostUnit: 'openrouter_usage_cost', requests: Number(row?.requests || 0), promptTokens: Number(row?.prompt_tokens || 0), completionTokens: Number(row?.completion_tokens || 0), totalTokens: Number(row?.total_tokens || 0), providerCost: Number(row?.provider_cost || 0) };
  } catch (error) {
    console.warn('ai_cost_summary_failed', safeError(error));
    return { period: 'today_utc', providerCostUnit: 'openrouter_usage_cost', requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, providerCost: 0 };
  }
}

function quotaLimit(env: Env, action: string, period: 'daily' | 'hourly') {
  if (action === ACTION_LOGIN) return getInt(env.ANON_LOGIN_DAILY_LIMIT, 30);
  if (action === ACTION_WAITLIST) return getInt(env.WAITLIST_DAILY_LIMIT, 10);
  if (action === `${ACTION_GENERATE}:hourly` || period === 'hourly') return getInt(env.FREE_HOURLY_GENERATE_LIMIT, 4);
  if (action === ACTION_GENERATE) return getInt(env.ANON_DAILY_REMINDER_SESSIONS, getInt(env.FREE_DAILY_GENERATE_LIMIT, 2));
  if (action === ACTION_REFINE) {
    const limits = reminderLimits(env);
    return limits.anonymousDailyReminderSessions * limits.anonymousRefinementsPerSession;
  }
  return 1000;
}

function quotaId(actor: Actor, action: string, period: 'daily' | 'hourly') {
  const bucket = period === 'hourly' ? new Date().toISOString().slice(0, 13) : new Date().toISOString().slice(0, 10);
  return `${actor.actorType}:${actor.actorId}:${action}:${period}:${bucket}`;
}

function quotaView(row: any) {
  return { used: row.used, limit: row.quota_limit, remaining: Math.max(0, row.quota_limit - row.used), resetAt: row.reset_at };
}

function reminderLimits(env: Env) {
  return {
    anonymousDailyReminderSessions: getInt(env.ANON_DAILY_REMINDER_SESSIONS, getInt(env.FREE_DAILY_GENERATE_LIMIT, 2)),
    anonymousRefinementsPerSession: getInt(env.ANON_REFINEMENTS_PER_SESSION, 1),
    emailVerifiedDailyReminderSessions: getInt(env.EMAIL_VERIFIED_DAILY_REMINDER_SESSIONS, 5),
    emailVerifiedRefinementsPerSession: getInt(env.EMAIL_VERIFIED_REFINEMENTS_PER_SESSION, 2)
  };
}

function entitlementsForPlan(plan: string, env: Env) {
  const limits = reminderLimits(env);
  return {
    plan: plan === 'free' ? 'anonymous_free_beta' : plan,
    dailyReminderSessions: limits.anonymousDailyReminderSessions,
    refinementsPerSession: limits.anonymousRefinementsPerSession,
    dailyGenerations: limits.anonymousDailyReminderSessions,
    monthlyGenerations: null,
    savedClients: false,
    brandVoice: false,
    sequenceExport: false,
    automaticSending: false,
    payment: false
  };
}

function validateGenerateInput(input: GenerateInput | null | undefined): { ok: boolean; error?: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'JSON body is required.' };
  if (!trimOptional(input.clientName, 80)) return { ok: false, error: 'clientName is required.' };
  if (!trimOptional(input.invoiceAmount, 80)) return { ok: false, error: 'invoiceAmount is required.' };
  if (!Number.isFinite(Number(input.daysOverdue)) || Number(input.daysOverdue) < -30 || Number(input.daysOverdue) > 3650) return { ok: false, error: 'daysOverdue must be a number between -30 and 3650.' };
  if (!trimOptional(input.projectType, 120)) return { ok: false, error: 'projectType is required.' };
  if (input.previousRemindersSent && !['none', 'one', 'two', 'three_plus'].includes(input.previousRemindersSent)) return { ok: false, error: 'previousRemindersSent is invalid.' };
  if (input.recommendedStage && !STAGES.includes(input.recommendedStage)) return { ok: false, error: 'recommendedStage is invalid.' };
  if (input.refinementMode && !['initial', 'softer', 'firmer', 'regenerate'].includes(input.refinementMode)) return { ok: false, error: 'refinementMode is invalid.' };
  if (String(input.clientName).length > 80) return { ok: false, error: 'clientName is too long.' };
  if (String(input.projectType).length > 120) return { ok: false, error: 'projectType is too long.' };
  if (input.paymentLink && !/^https?:\/\/[^\s]+$/i.test(String(input.paymentLink))) return { ok: false, error: 'paymentLink must be a valid URL.' };
  const unsafe = [input.clientName, input.invoiceAmount, input.projectType, input.invoiceNumber, input.paymentLink, input.clientRelationship, input.stageReason].filter(Boolean).join(' ').toLowerCase();
  if (/\b(violence|threaten|harass|blackmail|doxx|kill|injure|extort|shame|publicly expose)\b/.test(unsafe)) return { ok: false, error: 'unsafe_input' };
  return { ok: true };
}

function normalizeGenerateInput(input: GenerateInput): NormalizedGenerateInput {
  const base = {
    clientName: trimRequired(input.clientName, 80),
    invoiceAmount: trimRequired(input.invoiceAmount, 80),
    daysOverdue: Math.round(Number(input.daysOverdue)),
    projectType: trimRequired(input.projectType, 120),
    previousRemindersSent: normalizePrevious(input.previousRemindersSent),
    refinementMode: normalizeRefinement(input.refinementMode),
    tone: trimOptional(input.tone, 40),
    invoiceNumber: trimOptional(input.invoiceNumber, 80),
    paymentLink: trimOptional(input.paymentLink, 240),
    clientRelationship: trimOptional(input.clientRelationship, 120)
  };
  const recommendation = recommendStage(base.daysOverdue, base.previousRemindersSent, base.clientRelationship);
  const recommendedStage = input.recommendedStage && STAGES.includes(input.recommendedStage) ? input.recommendedStage : recommendation.recommendedStage;
  return {
    ...base,
    recommendedStage,
    stageReason: trimOptional(input.stageReason, 700) || (recommendedStage === recommendation.recommendedStage ? recommendation.stageReason : refinementReason(base.refinementMode, recommendedStage, recommendation.recommendedStage)) || recommendation.stageReason
  };
}

function recommendStage(days: number, previousRemindersSent: PreviousReminders, relationship: string | null): { recommendedStage: ReminderStage; stageReason: string; riskNotice?: string } {
  const previous = previousCount(previousRemindersSent);
  const relationshipPhrase = relationship === 'Long-term client' ? ' Because this is a long-term client, the wording should stay relationship-aware.' : relationship === 'New client' ? ' Because this is a new client, the draft should be clear without assuming bad intent.' : '';
  if (days <= 0) return { recommendedStage: 'Due Soon / Due Today', stageReason: 'The invoice is not overdue yet or is due today, so a light reminder is more appropriate than a collection-style follow-up.' };
  if (days <= 6) {
    if (previous >= 2) return { recommendedStage: 'Firm Reminder', stageReason: `The invoice is only ${days} days overdue, but you have already sent multiple reminders. A more direct reminder is reasonable while staying professional.${relationshipPhrase}` };
    return { recommendedStage: 'Gentle Reminder', stageReason: `The invoice is ${days} days overdue and you have sent ${previous === 0 ? 'no previous reminders' : 'one previous reminder'}, so a gentle follow-up is a safer starting point.${relationshipPhrase}` };
  }
  if (days <= 20) return { recommendedStage: 'Firm Reminder', stageReason: `The invoice is ${days} days overdue${previous ? ` and you have already sent ${previous} reminder${previous > 1 ? 's' : ''}` : ''}, so a direct but relationship-safe follow-up is appropriate.${relationshipPhrase}` };
  if (days <= 29) {
    if (previous >= 2) return { recommendedStage: 'Final Notice', stageReason: `The invoice is significantly overdue and you have already sent multiple reminders, so a final notice may be appropriate. Review carefully before sending.${relationshipPhrase}`, riskNotice: FINAL_NOTICE_WARNING };
    return { recommendedStage: 'Firm Reminder', stageReason: `The invoice is ${days} days overdue, but you have sent ${previous === 0 ? 'no previous reminders' : 'only one previous reminder'}. A firm reminder is safer than starting with a final notice.${relationshipPhrase}` };
  }
  if (previous >= 2) return { recommendedStage: 'Final Notice', stageReason: `The invoice is over 30 days overdue and you have already sent multiple reminders, so Final Notice wording may be appropriate. Review carefully before sending.${relationshipPhrase}`, riskNotice: FINAL_NOTICE_WARNING };
  return { recommendedStage: 'Firm Reminder', stageReason: `Even though the invoice is over 30 days overdue, this appears to be ${previous === 0 ? 'your first reminder' : 'only your second reminder'}. A firm reminder is safer than starting with a final notice.${relationshipPhrase}` };
}

function generateTemplateReminder(input: NormalizedGenerateInput): Omit<RecommendedReminderResponse, 'meta'> {
  const name = input.clientName;
  const amount = input.invoiceAmount;
  const project = input.projectType;
  const days = input.daysOverdue;
  const invoiceRef = input.invoiceNumber ? `invoice ${input.invoiceNumber}` : 'the invoice';
  const invoicePhrase = `${amount} ${invoiceRef}`;
  const link = input.paymentLink ? `\n\nPayment link: ${input.paymentLink}` : '';
  const relationship = input.clientRelationship ? ` I value our ${input.clientRelationship.toLowerCase()} relationship and want to keep this simple.` : '';
  const rec = recommendStage(days, input.previousRemindersSent, input.clientRelationship);
  const stage = input.recommendedStage || rec.recommendedStage;
  const reason = input.stageReason || rec.stageReason;
  const softened = input.refinementMode === 'softer';
  const firmed = input.refinementMode === 'firmer';

  if (stage === 'Due Soon / Due Today' || stage === 'Gentle Reminder') {
    return {
      recommendedStage: stage,
      stageReason: reason,
      subject: stage === 'Due Soon / Due Today' ? `Reminder about ${invoiceRef} for ${project}` : `Quick reminder about ${invoiceRef} for ${project}`,
      emailBody: `Hi ${name},\n\nI hope you are doing well. I wanted to send a ${stage === 'Due Soon / Due Today' ? 'quick note' : 'quick reminder'} about ${invoicePhrase} for ${project}.${days > 0 ? ` It appears to be ${days} days overdue.` : ' It is due today or coming up.'} It may simply have slipped through, so I am just following up here.${relationship}\n\nCould you let me know when I should expect payment, or if you need anything else from me to process it?${link}\n\nThank you,\n[Your name]`,
      shortMessage: `Hi ${name}, quick ${stage === 'Due Soon / Due Today' ? 'note' : 'reminder'} about ${invoicePhrase} for ${project}. Could you let me know when payment should be processed? Thanks!`,
      disclaimer: LEGAL_DISCLAIMER
    };
  }

  if (stage === 'Final Notice') {
    return {
      recommendedStage: stage,
      stageReason: reason,
      riskNotice: FINAL_NOTICE_WARNING,
      subject: `Final reminder: overdue invoice for ${project}`,
      emailBody: `Hi ${name},\n\nThis is a final reminder that ${invoicePhrase} for ${project} remains unpaid and is now ${days} days overdue.\n\nPlease arrange payment or send an update by [date]. If there is a problem with the invoice, please reply so we can resolve it. Before taking any further steps, I will review our agreement and applicable requirements carefully.${link}\n\nRegards,\n[Your name]`,
      shortMessage: `Hi ${name}, final reminder that ${invoicePhrase} for ${project} is still unpaid and ${days} days overdue. Please arrange payment or send an update by [date].`,
      disclaimer: LEGAL_DISCLAIMER
    };
  }

  return {
    recommendedStage: 'Firm Reminder',
    stageReason: reason,
    subject: `Follow-up: overdue payment for ${project}`,
    emailBody: `Hi ${name},\n\nI am following up ${softened ? 'on' : firmed ? 'again regarding' : 'on'} ${invoicePhrase} for ${project}, which is now ${days} days overdue. I have not seen payment come through yet.\n\nCould you please confirm the payment status and the expected payment date? If there is an issue with the invoice or payment details, let me know and I will help resolve it quickly.${link}\n\nThanks,\n[Your name]`,
    shortMessage: `Hi ${name}, following up on ${invoicePhrase} for ${project}. It is now ${days} days overdue. Can you confirm the payment status and expected date?`,
    disclaimer: LEGAL_DISCLAIMER
  };
}

async function generateWithAI(input: NormalizedGenerateInput, env: Env): Promise<AiGenerationResult> {
  const baseUrl = (env.AI_PROVIDER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
  const model = env.AI_MODEL || 'openai/gpt-4.1-mini';
  const maxTokens = getInt(env.AI_MAX_TOKENS, 1400);
  const recommendation = recommendStage(input.daysOverdue, input.previousRemindersSent, input.clientRelationship);
  const prompt = `Generate exactly one recommended freelancer late-payment reminder draft as JSON. Do not generate gentle/firm/final variants. Use the provided recommended stage unless it is unsafe; if unsafe, keep the output safer and explain. Return JSON keys: recommendedStage, stageReason, subject, emailBody, shortMessage, riskNotice, disclaimer. Requirements: no legal advice, no threats, no harassment, no debt collection claims, no automatic sending language, no unsupported late fees/collections/legal action. Refinement mode: ${input.refinementMode}. If mode is softer, reduce intensity while keeping a clear payment ask. If mode is firmer, increase directness without legal threats. If refinementMode is softer or firmer, the stageReason must explain the refinement from the previous stage to the requested stage. Do not reuse the original stage reason if the recommendedStage changes. If recommendedStage is Final Notice, include riskNotice. Input: ${JSON.stringify(input)}. Backend safety recommendation: ${JSON.stringify(recommendation)}`;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    authorization: `Bearer ${env.AI_PROVIDER_API_KEY}`
  };
  if (providerName(env) === 'openrouter') {
    headers['HTTP-Referer'] = env.APP_ORIGIN || 'https://freelancerreply.com';
    headers['X-OpenRouter-Title'] = env.SITE_NAME || 'FreelancerReply';
  }
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.45,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You write concise, professional freelancer payment follow-up drafts. Return valid JSON only. Generate one recommended draft, not multiple variants. Never claim to send emails. Never provide legal, financial, accounting, tax, or debt collection advice.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`AI provider HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json<any>();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('AI provider returned empty content');
  const parsed = JSON.parse(raw);
  return { draft: validateRecommendedAiOutput(parsed, input), usage: normalizeAiUsage(data, env, model) };
}

function validateRecommendedAiOutput(parsed: any, input: NormalizedGenerateInput): Omit<RecommendedReminderResponse, 'meta'> {
  if (!parsed?.subject || !parsed?.emailBody || !parsed?.shortMessage) throw new Error('AI output missing recommended draft fields');
  const stage = STAGES.includes(parsed.recommendedStage) ? parsed.recommendedStage : input.recommendedStage;
  return {
    recommendedStage: stage,
    stageReason: safeStageReason(parsed, input, stage),
    subject: trimRequired(parsed.subject, 180),
    emailBody: trimRequired(parsed.emailBody, 3000),
    shortMessage: trimRequired(parsed.shortMessage, 500),
    riskNotice: stage === 'Final Notice' ? trimOptional(parsed.riskNotice, 700) || FINAL_NOTICE_WARNING : trimOptional(parsed.riskNotice, 700) || undefined,
    disclaimer: LEGAL_DISCLAIMER
  };
}

function safeStageReason(parsed: any, input: NormalizedGenerateInput, outputStage: ReminderStage): string {
  const rec = recommendStage(input.daysOverdue, input.previousRemindersSent, input.clientRelationship);
  const parsedStageChanged = parsed?.recommendedStage && STAGES.includes(parsed.recommendedStage) && parsed.recommendedStage !== input.recommendedStage;
  if (input.refinementMode !== 'initial' || parsedStageChanged || outputStage !== input.recommendedStage) {
    return trimRequired(refinementReason(input.refinementMode, outputStage, rec.recommendedStage) || input.stageReason || rec.stageReason, 900);
  }
  return trimRequired(parsed?.stageReason || input.stageReason || rec.stageReason, 900);
}

function normalizeAiUsage(data: any, env: Env, requestedModel: string): AiUsage {
  const usage = data?.usage || {};
  const promptDetails = usage.prompt_tokens_details || {};
  const completionDetails = usage.completion_tokens_details || {};
  const costDetails = usage.cost_details || {};
  return {
    provider: providerName(env),
    providerRequestId: data?.id,
    requestedModel,
    actualModel: data?.model || requestedModel,
    promptTokens: numberOrZero(usage.prompt_tokens),
    completionTokens: numberOrZero(usage.completion_tokens),
    totalTokens: numberOrZero(usage.total_tokens),
    reasoningTokens: numberOrZero(completionDetails.reasoning_tokens),
    cachedTokens: numberOrZero(promptDetails.cached_tokens),
    cacheWriteTokens: numberOrZero(promptDetails.cache_write_tokens),
    providerCost: typeof usage.cost === 'number' ? usage.cost : undefined,
    providerCostUnit: providerName(env) === 'openrouter' ? 'openrouter_usage_cost' : 'provider_reported_cost',
    upstreamInferenceCost: typeof costDetails.upstream_inference_cost === 'number' ? costDetails.upstream_inference_cost : undefined
  };
}

function normalizePrevious(value: unknown): PreviousReminders {
  return value === 'one' || value === 'two' || value === 'three_plus' ? value : 'none';
}

function normalizeRefinement(value: unknown): RefinementMode {
  return value === 'softer' || value === 'firmer' || value === 'regenerate' ? value : 'initial';
}

function previousCount(value: PreviousReminders) {
  return value === 'none' ? 0 : value === 'one' ? 1 : value === 'two' ? 2 : 3;
}

function refinementReason(mode: RefinementMode, stage: ReminderStage, original: ReminderStage) {
  if (mode === 'softer') {
    return `The previous recommendation was ${original}. The user asked to make it softer, so this draft uses ${stage} wording while keeping the payment request clear.`;
  }
  if (mode === 'firmer') {
    return `The previous recommendation was ${original}. The user asked to make it firmer, so this draft uses ${stage} wording while staying professional and avoiding unsupported legal threats.`;
  }
  if (mode === 'regenerate') {
    return `Regenerate the current ${stage} draft with the same payment situation.`;
  }
  return '';
}

function providerName(env: Env) {
  if (env.AI_PROVIDER) return env.AI_PROVIDER.toLowerCase();
  if ((env.AI_PROVIDER_BASE_URL || '').includes('openrouter.ai')) return 'openrouter';
  return 'openai_compatible';
}

function numberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

async function verifyTurnstile(token: string, ip: string, env: Env) {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY || '');
  form.append('response', token);
  form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  if (!res.ok) return { success: false };
  return res.json<any>();
}

async function parseJson<T>(request: Request): Promise<T> {
  try {
    return await request.json<T>();
  } catch {
    return null as T;
  }
}

function withCors(response: Response, request: Request, env: Env) {
  const origin = request.headers.get('origin');
  const allowed = new Set((env.APP_ORIGINS || env.APP_ORIGIN || '').split(',').map((v) => v.trim()).filter(Boolean));
  if (origin && allowed.has(origin)) response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'content-type, authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

function json(data: unknown, status: number, request: Request, env: Env) {
  const response = new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-api-version': env.API_VERSION || API_VERSION, 'x-content-type-options': 'nosniff' }
  });
  return withCors(response, request, env);
}

function errorJson(code: string, message: string, status: number, request: Request, env: Env, extra: Record<string, unknown> = {}) {
  return json({ ok: false, error: code.toLowerCase(), code, message, ...extra }, status, request, env);
}

function parseCookie(cookieHeader: string, name: string) {
  return cookieHeader.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${name}=`))?.slice(name.length + 1);
}

function buildSessionCookie(value: string, env: Env) {
  const secure = env.ENVIRONMENT === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly${secure}; SameSite=Lax`;
}

async function signSession(sessionId: string, secret: string) {
  const sig = await hmac(sessionId, secret);
  return `${sessionId}.${sig}`;
}

async function verifySession(signed: string, secret: string) {
  const [sessionId, sig] = signed.split('.');
  if (!sessionId || !sig) return null;
  const expected = await hmac(sessionId, secret);
  return expected === sig ? sessionId : null;
}

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return base64Url(bytes);
}

async function hashIp(ip: string, secret: string) {
  return hmac(ip || 'unknown', secret);
}

function getClientIp(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
}

function base64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function requireSessionSecret(env: Env) {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET is missing or too short. Set it with wrangler secret put SESSION_SECRET.');
}

function trimRequired(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max);
}

function trimOptional(value: unknown, max: number) {
  const s = String(value || '').trim();
  return s ? s.slice(0, max) : null;
}

function getInt(value: string | undefined, fallback: number) {
  const n = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function nextUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)).toISOString();
}

function nextUtcHour() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1, 0, 0)).toISOString();
}

function safeMetadata(value: unknown) {
  try {
    return JSON.stringify(value, (_key, val) => typeof val === 'string' ? val.slice(0, 500) : val).slice(0, 2000);
  } catch {
    return '{}';
  }
}

function safeError(error: unknown) {
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { message: String(error) };
}
