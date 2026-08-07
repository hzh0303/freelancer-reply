import { chromium } from 'playwright';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8787';
const routes = ['/', '/late-payment-reminder-email-generator', '/privacy-policy', '/terms-of-service', '/cookie-policy', '/refund-policy', '/sitemap.xml', '/robots.txt'];
const widths = [320,375,390,768,1024];
const browser = await chromium.launch();
const errors = [];
try {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`console:${msg.text()}`); });
  for (const r of routes) {
    const res = await page.goto(`${base}${r}`, { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) throw new Error(`${r} returned ${res?.status()}`);
  }
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const home = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, hasCTA: document.body.innerText.includes('Generate a late payment reminder'), hasLegal: document.body.innerText.includes('Privacy Policy') && document.body.innerText.includes('Terms of Service'), visibleUndefined: document.body.innerText.includes('undefined') }));
  if (home.h1 !== 1 || !home.hasCTA || !home.hasLegal || home.visibleUndefined) throw new Error(`home checks failed ${JSON.stringify(home)}`);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const r of ['/', '/late-payment-reminder-email-generator', '/privacy-policy', '/terms-of-service']) {
      await page.goto(`${base}${r}`, { waitUntil: 'networkidle' });
      const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, h1: document.querySelectorAll('h1').length, cta: document.body.innerText.includes('Generate') || document.body.innerText.includes('Privacy Policy') || document.body.innerText.includes('Terms of Service'), legal: document.body.innerText.includes('Privacy Policy') && document.body.innerText.includes('Terms of Service') }));
      if (m.scrollWidth > m.clientWidth + 1) throw new Error(`${r} overflow at ${width}: ${JSON.stringify(m)}`);
      if (m.h1 !== 1) throw new Error(`${r} h1 count ${m.h1} at ${width}`);
    }
  }
  await page.goto(`${base}/late-payment-reminder-email-generator`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Generate reminder' }).first().click();
  await page.getByText('Your reminder drafts are ready.').waitFor({ timeout: 3000 });
  await page.getByRole('button', { name: 'Copy email' }).click();
  console.log(JSON.stringify({ ok: true, base, routes: routes.length, widths, consoleErrors: errors }, null, 2));
} finally { await browser.close(); }
if (errors.length) console.error('Console errors:', errors);
