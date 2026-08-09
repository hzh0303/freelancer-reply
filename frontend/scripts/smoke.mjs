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
      quota: { used: 1, limit: 2, remaining: 1, resetAt: '' }
    }
  };
}

async function installApiMocks(page) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );
  await page.route('**/api/usage', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        usage: {
          generatePaymentReminder: { used: 0, limit: 2, remaining: 2, resetAt: '' },
          waitlistSubmit: { used: 0, limit: 3, remaining: 3, resetAt: '' }
        }
      })
    })
  );
  await page.route('**/api/generate-payment-reminder', async (route) => {
    const input = route.request().postDataJSON();
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
    hasCTA: document.body.innerText.includes('Start a reminder session'),
    hasToolEntry: document.body.innerText.toLowerCase().includes('previous reminders sent'),
    hasLegal: document.body.innerText.includes('Privacy Policy') && document.body.innerText.includes('Terms of Service'),
    oldTonePicker: document.body.innerText.includes('Tone picker') || document.body.innerText.includes('Choose a tone'),
    visibleUndefined: document.body.innerText.includes('undefined')
  }));
  if (home.h1 !== 1 || !home.hasCTA || !home.hasToolEntry || !home.hasLegal || home.oldTonePicker || home.visibleUndefined) {
    throw new Error(`home checks failed ${JSON.stringify(home)}`);
  }

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const r of ['/', '/late-payment-reminder-email-generator', '/privacy-policy', '/terms-of-service']) {
      await page.goto(`${base}${r}`, { waitUntil: 'networkidle' });
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
  await page.getByRole('button', { name: 'Make it firmer' }).click();
  await page.getByText('Do you want to move toward a Final Notice?').waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Keep it firm instead' }).click();

  if (errors.length) throw new Error(`Console/page errors: ${errors.join('\n')}`);
  console.log(JSON.stringify({ ok: true, base, routes: routes.length, widths, consoleErrors: errors }, null, 2));
} finally {
  await browser.close();
}
