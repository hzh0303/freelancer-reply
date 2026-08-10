import { chromium } from 'playwright';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8787';
const routes = [
  '/',
  '/late-payment-reminder-email-generator',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/refund-policy',
  '/sitemap.xml',
  '/robots.txt'
];
const widths = [320, 375, 390, 768, 1024];
const errors = [];
let generateCalls = 0;
let initialCalls = 0;
let refinementCalls = 0;
let currentReminderSessionId = '';
let hangUsageAfterGenerate = false;

function countPrevious(value) {
  return value === 'none' ? 0 : value === 'one' ? 1 : value === 'two' ? 2 : 3;
}

function recommend(days, previousRemindersSent) {
  const previous = countPrevious(previousRemindersSent);
  if (days <= 0) return 'Due Soon / Due Today';
  if (days <= 6) return previous >= 2 ? 'Firm Reminder' : 'Gentle Reminder';
  if (days <= 20) return 'Firm Reminder';
  if (days <= 29) return previous >= 2 ? 'Final Notice' : 'Firm Reminder';
  return previous >= 2 ? 'Final Notice' : 'Firm Reminder';
}

function draft(stage, input) {
  return {
    recommendedStage: stage,
    stageReason: `Smoke test reason for ${stage}.`,
    subject: `${stage}: ${input.projectType}`,
    emailBody: `Hi ${input.clientName},\n\nThis is a ${stage} draft for ${input.invoiceAmount}.`,
    shortMessage: `Hi ${input.clientName} — ${stage} reminder for ${input.invoiceAmount}.`,
    riskNotice: stage === 'Final Notice' ? 'Final notice smoke warning.' : undefined,
    disclaimer: 'Smoke test disclaimer.',
    meta: {
      source: 'template_fallback',
      quota: { used: 1, limit: 2, remaining: 1, resetAt: '' },
      reminderSessionId: currentReminderSessionId,
      reminderSession: { id: currentReminderSessionId, refinementCount: refinementCalls, refinementLimit: 1 }
    }
  };
}

async function installApiMocks(page) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );
  await page.route('**/api/usage', (route) => {
    if (hangUsageAfterGenerate) return;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        usage: {
          generatePaymentReminder: { used: initialCalls, limit: 2, remaining: Math.max(0, 2 - initialCalls), resetAt: '' },
          refinePaymentReminder: { used: refinementCalls, limit: 2, remaining: Math.max(0, 2 - refinementCalls), resetAt: '' },
          hourlyAiCalls: { used: generateCalls, limit: 4, remaining: Math.max(0, 4 - generateCalls), resetAt: '' },
          waitlistSubmit: { used: 0, limit: 3, remaining: 3, resetAt: '' }
        }
      })
    });
  });
  await page.route('**/api/generate-payment-reminder', async (route) => {
    generateCalls += 1;
    hangUsageAfterGenerate = true;
    const input = route.request().postDataJSON();
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && input.turnstileToken !== 'smoke-turnstile-token') {
      await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'TURNSTILE_FAILED', message: 'Bot protection token is required.' }) });
      return;
    }
    if (input.refinementMode === 'initial' || !input.refinementMode) {
      initialCalls += 1;
      currentReminderSessionId = `00000000-0000-4000-8000-${String(initialCalls).padStart(12, '0')}`;
    } else {
      if (input.reminderSessionId !== currentReminderSessionId) {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'REMINDER_SESSION_REQUIRED', message: 'reminderSessionId is required for refinements.' }) });
        return;
      }
      refinementCalls += 1;
    }
    const stage = input.recommendedStage || recommend(input.daysOverdue, input.previousRemindersSent);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft(stage, input)) });
  });
  await page.route('**/api/waitlist', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, message: 'ok', stored: { email: true, generatorInput: false } }) })
  );
}

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    window.turnstile = {
      render: (_container, options) => {
        setTimeout(() => options.callback?.('smoke-turnstile-token'), 0);
        return `smoke-widget-${Math.random()}`;
      },
      reset: () => {},
      remove: () => {}
    };
  });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror:${err.message}`));
  await installApiMocks(page);

  for (const r of routes) {
    const res = await page.goto(`${base}${r}`, { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) throw new Error(`${r} returned ${res?.status()}`);
  }

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const home = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    hasCTA: document.body.innerText.includes('Start a reminder'),
    hasToolEntry: document.body.innerText.toLowerCase().includes('previous reminders sent'),
    hasLegal: document.body.innerText.includes('Privacy Policy') && document.body.innerText.includes('Terms of Service'),
    oldTonePicker: document.body.innerText.includes('Tone picker') || document.body.innerText.includes('Choose a tone'),
    visibleUndefined: document.body.innerText.includes('undefined')
  }));
  if (home.h1 !== 1 || !home.hasCTA || !home.hasToolEntry || !home.hasLegal || home.oldTonePicker || home.visibleUndefined) {
    throw new Error(`home checks failed ${JSON.stringify(home)}`);
  }

  await page.setViewportSize({ width: 1200, height: 900 });
  for (const item of [
    { name: 'Examples', hash: '#example', target: '#example' },
    { name: 'Pricing', hash: '#pricing', target: '#pricing' },
    { name: 'FAQ', hash: '#faq', target: '#faq' },
    { name: 'Pro waitlist', hash: '#waitlist', target: '#waitlist' }
  ]) {
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    await page.locator('header').getByRole('link', { name: item.name, exact: true }).click();
    await page.waitForFunction((hash) => window.location.hash === hash, item.hash);
    await page.waitForFunction((selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect && rect.top >= 70 && rect.top < window.innerHeight;
    }, item.target);
    await page.waitForFunction((name) => document.querySelector('a[aria-current="page"]')?.textContent?.trim() === name, item.name);
    const navCheck = await page.evaluate((targetSelector) => {
      const header = document.querySelector('header')?.getBoundingClientRect();
      const target = document.querySelector(targetSelector)?.getBoundingClientRect();
      const active = document.querySelector('a[aria-current="page"]')?.textContent?.trim();
      return {
        headerTop: header?.top,
        headerBottom: header?.bottom,
        targetTop: target?.top,
        active,
        hash: window.location.hash
      };
    }, item.target);
    if ((navCheck.headerTop ?? 999) > 1 || (navCheck.headerBottom ?? 0) < 40) throw new Error(`header not visible after ${item.name}: ${JSON.stringify(navCheck)}`);
    if ((navCheck.targetTop ?? -999) < 70) throw new Error(`target hidden under header after ${item.name}: ${JSON.stringify(navCheck)}`);
    if (navCheck.active !== item.name) throw new Error(`active nav failed for ${item.name}: ${JSON.stringify(navCheck)}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('header').getByRole('link', { name: item.name, exact: true }).click();
    await page.waitForFunction((selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect && rect.top >= 70 && rect.top < window.innerHeight;
    }, item.target);
  }

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const r of ['/', '/late-payment-reminder-email-generator', '/privacy-policy', '/terms-of-service']) {
      await page.goto(`${base}${r}`, { waitUntil: 'domcontentloaded' });
      const m = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        cta: document.body.innerText.includes('Get recommended reminder') || document.body.innerText.includes('Privacy Policy') || document.body.innerText.includes('Terms of Service'),
        legal: document.body.innerText.includes('Privacy Policy') && document.body.innerText.includes('Terms of Service')
      }));
      if (m.scrollWidth > m.clientWidth + 1) throw new Error(`${r} overflow at ${width}: ${JSON.stringify(m)}`);
      if (m.h1 !== 1) throw new Error(`${r} h1 count ${m.h1} at ${width}`);
    }
  }

  await page.goto(`${base}/late-payment-reminder-email-generator`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Get recommended reminder' }).click();
  await page.getByText('Your recommended reminder is ready.').waitFor({ timeout: 5000 });
  await page.getByText('Firm Reminder').first().waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Copy email' }).click();

  const matrix = [
    { days: '5', previous: 'None', expected: 'Gentle Reminder' },
    { days: '12', previous: 'None', expected: 'Firm Reminder' },
    { days: '35', previous: 'None', expected: 'Firm Reminder' },
    { days: '35', previous: '2 reminders', expected: 'Final Notice' }
  ];
  for (const item of matrix) {
    await page.getByLabel('Days overdue').fill(item.days);
    await page.getByRole('button', { name: item.previous, exact: true }).click();
    const preview = await page.locator('text=Current recommendation preview').locator('..').innerText();
    if (!preview.includes(item.expected)) throw new Error(`matrix failed ${JSON.stringify(item)} preview=${preview}`);
  }

  await page.getByLabel('Days overdue').fill('12');
  await page.getByRole('button', { name: 'None', exact: true }).click();
  await page.getByRole('button', { name: 'Get recommended reminder' }).click();
  await page.getByText('Your recommended reminder is ready.').waitFor({ timeout: 5000 });

  const beforeDialogCancel = generateCalls;
  await page.getByRole('button', { name: 'Make it softer' }).click();
  await page.getByText('Make this reminder softer?').waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Close dialog' }).click();
  if (generateCalls !== beforeDialogCancel) throw new Error('closing softer confirmation should not call generate');

  await page.getByRole('button', { name: 'Regenerate' }).click();
  await page.getByText('Regenerate this reminder?').waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Close dialog' }).click();

  await page.getByRole('button', { name: 'Make it firmer' }).click();
  await page.getByText('Move toward a Final Notice?').waitFor({ timeout: 5000 });
  const beforeFinalChoice = generateCalls;
  await page.getByRole('button', { name: 'Generate another Firm Reminder' }).click();
  await page.getByText('Your recommended reminder is ready.').waitFor({ timeout: 5000 });
  if (generateCalls !== beforeFinalChoice + 1) throw new Error('final-choice secondary action should call generate exactly once');
  if (!(await page.getByRole('button', { name: 'Make it firmer' }).isDisabled())) throw new Error('refinement buttons should be disabled after one per-session backend refinement');

  if (errors.length) throw new Error(`Console/page errors: ${errors.join('\n')}`);
  console.log(JSON.stringify({ ok: true, base, routes: routes.length, widths, consoleErrors: errors }, null, 2));
} finally {
  await browser.close();
}
