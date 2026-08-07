import fs from "node:fs";
import path from "node:path";
import { Client } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const serverPath = "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/stitch-proxy.mjs";
const outputDir = "/Users/hzh/projects/freelancer-reply/stitch-output";
fs.mkdirSync(outputDir, { recursive: true });

const baseStyle = `Project: FreelancerReply, a calm AI-assisted email drafting tool for English-speaking solo freelancers.
Approved direction: Calm Inbox Desk. Warm paper background #F7F3EC, surface #FFFEFA, ink #17211C, muted text #6E7974, border #DDE5DF, primary teal #1C8C7A, warning amber #B7791F. Headline font should feel editorial like Fraunces/Newsreader; UI/body Inter-like. Solid paper cards, thin borders, subtle shadows, 16-20px radius.
Product boundaries: P0 free beta. No login, no checkout, no payments, no automatic email sending, no invoice system, no CRM, no fake testimonials, no fake ratings, no fake customer logos. Pro is waitlist/planned only, not available now. Free beta includes 3 generations per day. Nothing is sent automatically. Users review, edit, copy, and send themselves. This is not legal, financial, accounting, or debt collection advice.
Anti-AI constraints: no purple-blue AI gradients, no robot mascot, no magic wand, no abstract 3D blob, no excessive glassmorphism, no emoji feature piles, no debt collection red visual language, no "Send email" button, no "guaranteed payment" claim.
Use real product UI motifs: email draft workspace, form fields, tone selector, copy buttons, quota pill, safety notes, waitlist badges, legal footer.`;

const screens = [
  {
    slug: "home-desktop",
    name: "Homepage Desktop",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a high-fidelity DESKTOP homepage for route /.\nHeader: FreelancerReply wordmark with reply-envelope icon; nav Late Payment Reminder, Examples, Pricing, FAQ; right side Pro waitlist ghost and Generate reminder primary. No Sign in.\nHero: two-column 52/48. Left: eyebrow "Free beta • 3 generations/day", H1 "Freelance Email Generator for Awkward Client Conversations", PAS copy about asking clients for payment/proposal/scope creep without sounding rude, subhead "Start with a polite late payment reminder...", primary CTA "Generate a late payment reminder", secondary "See example email", microcopy "Nothing is sent automatically. You stay in control of what gets sent." Right: realistic email draft workspace mock with Client name Sarah, Invoice amount $850, Days overdue 12, Project type Website redesign, tone chips Friendly/Professional/Firm/Final Notice, output tabs Gentle/Firm/Final Notice and Copy buttons.\nBelow fold sections: Tool Entry card; Problem section; Benefit bento; Features; How it works; Use cases with Available now + Coming soon badges; Example output; Pricing cards; FAQ accordion; Final CTA; Footer legal links Privacy, Terms, Cookie Policy, Refund Policy, Contact [待确认].\nMake tool entry and CTA visually dominant. Keep calm, trustworthy, freelancer-friendly.`
  },
  {
    slug: "home-mobile",
    name: "Homepage Mobile",
    deviceType: "MOBILE",
    prompt: `${baseStyle}\n\nDesign a high-fidelity MOBILE homepage for route /. 390px wide.\nMobile order: compact header with FreelancerReply logo and menu icon; H1; subhead; primary CTA; secondary CTA; trust line "Nothing is sent automatically"; mini tool entry card above the fold.\nTool card: stacked fields Client name, Invoice amount, Days overdue, Project type, Tone as 2x2 segmented control; sticky bottom-style Generate reminder button while form is visible; quota pill "3 free generations/day"; safety note.\nShow compact sections after: example output card, benefits bento stacked, pricing stacked with Free Beta first, FAQ accordion, legal footer.\nEnsure touch targets 44px+, readable text, no desktop multi-column compression.`
  },
  {
    slug: "tool-desktop",
    name: "Late Payment Tool Desktop",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a high-fidelity DESKTOP tool page for route /late-payment-reminder-email-generator.\nH1 "Late Payment Reminder Email Generator for Freelancers". Subhead "Generate polite overdue invoice reminders that help you follow up clearly without sounding unnecessarily harsh." Primary CTA "Generate reminder email" secondary "See example output".\nAbove fold: large split generator workbench. Left form: section title "Tell us what the reminder is about." Fields Client name (Sarah), Invoice amount ($850), Days overdue (12), Service or project type (Website redesign), Tone with options Friendly, Professional, Firm, Final Notice. Advanced toggle "Add optional details" with Invoice number, Payment link, Client relationship. Bottom legal note.\nRight result area: success state preview "Your reminder drafts are ready." Tabs/cards Gentle, Firm, Final Notice. Each shows badge, description, Subject line, Email body preview, Short DM preview, Copy buttons (Copy email, Copy subject, Copy short DM). Utility buttons: Regenerate drafts, Change tone, Start over, Copy all versions. Quota pill "2 of 3 free generations left today."\nAdd amber Final Notice warning and short disclaimer. Lower page: Example input/output, When to send each reminder, Tips, FAQ, Related coming soon tools, waitlist CTA, footer legal. No Send button.`
  },
  {
    slug: "tool-mobile",
    name: "Late Payment Tool Mobile",
    deviceType: "MOBILE",
    prompt: `${baseStyle}\n\nDesign a high-fidelity MOBILE tool page for /late-payment-reminder-email-generator.\nTop: compact header, H1, short subhead, trust line.\nGenerator form full-width stacked. Tone selector 2x2. Advanced details collapsed. Sticky Generate reminder button.\nResults mobile: after generation, show quota pill, tabs Gentle/Firm/Final Notice as horizontal chips; active result card with subject, email body, short DM, Copy buttons. Include amber Final Notice warning when Final Notice tab selected.\nAdd compact states: loading skeleton, error alert, quota reached card, waitlist CTA, footer legal. Make it usable with one thumb; no tiny legal text.`
  },
  {
    slug: "generator-states",
    name: "Generator States and Modals",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a DESKTOP state sheet for FreelancerReply generator UI. This is for frontend implementation, not a marketing page.\nShow multiple panels in one screen: Empty state, Loading state, Success state, General error, AI provider error, Input too long error, Sensitive input warning modal, Final Notice warning, Quota reached, Copy success toast, Copy error toast, Waitlist modal.\nUse exact copy snippets: "Drafting your reminder…", "Your reminder drafts are ready.", "You’ve reached today’s free beta limit.", "Copied to clipboard.", "Could not copy automatically. Please select the text and copy it manually.", "Want higher limits and saved client tools?"\nWaitlist modal fields: Email address, What kind of freelancer are you?, What client email do you struggle with most?, Which plan would you consider if Pro becomes available? Consent microcopy with [CONTACT_EMAIL 待确认].\nWarnings use calm amber, errors muted red, never aggressive debt-collection red.`
  },
  {
    slug: "pricing-waitlist-desktop",
    name: "Pricing and Waitlist Desktop",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a high-fidelity DESKTOP pricing/waitlist page or section for FreelancerReply.\nH1 "Free beta for your first overdue invoice follow-ups."\nThree plan cards: Free Beta highlighted ($0, best for drafting a late payment reminder now, 3 generations/day, Gentle/Firm/Final Notice, subject lines, full email bodies, short DM/SMS, copy/regenerate, tone change, no account required). Limits visible: 3 generations per IP/session/day, regenerations count, no saved clients/history/brand voice/sequence export/automatic sending/invoice/payment processing. CTA "Generate a free reminder".\nPro Solo card: $9/month or $90/year, badge "Waitlist / planned for P1", planned includes 300 generations/month, 30/day soft limit, 25 saved client snippets, 3 brand voices, 100 sequence exports/month, more freelancer email tools. CTA "Join the Pro Solo waitlist".\nPro Plus card: $19/month or $190/year, badge "Optional P1/P2 waitlist", 1,500 generations/month, 100/day soft limit, 200 snippets, 10 brand voices, 500 exports/month, possible 1-3 seat support [待确认]. CTA waitlist.\nBottom safety copy: free while in beta, P0 no payments, prices/features may change before launch, refund/payment provider details published before any charge. No checkout buttons.`
  },
  {
    slug: "legal-template-desktop",
    name: "Legal Pages Template Desktop",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a high-fidelity DESKTOP legal page template for routes /privacy, /terms, /cookies, /refund.\nIt should feel trustworthy, readable, and not marketing-heavy. Header with logo and back-to-generator CTA. Main layout: left sticky page navigation list (Privacy Policy, Terms of Service, Cookie Policy, Refund Policy), center article content, right small important notice card.\nShow Privacy Policy as active example. H1 "Privacy Policy". Intro: "FreelancerReply is an AI-assisted email drafting tool for freelancers. This Privacy Policy explains what information may be collected, how it is used, and what choices you have." Important notice box: "Do not enter sensitive financial, legal, personal, or confidential information unless it is necessary for the draft. Generator inputs may be sent to an AI provider to create the email."\nSections: Information you enter, Waitlist information, Usage and analytics information, AI processing, Third-party services, Cookies, Data retention, Your choices, Contact [CONTACT_EMAIL 待确认].\nFooter legal links. Use high readability, 16px body, clear anchors. No fake provider names.`
  },
  {
    slug: "coming-soon-template",
    name: "Coming Soon Tool Page Template",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a high-fidelity DESKTOP coming-soon tool page template for planned routes: /proposal-follow-up-email-generator, /scope-creep-response-generator, /testimonial-request-email-generator, /price-increase-email-generator.\nMake it clear the tool is not available in current beta. H1 example "Proposal Follow-Up Email Generator for Freelancers". Body: "This tool is not available in the current beta. FreelancerReply is starting with the Late Payment Reminder Email Generator so we can validate one clear freelancer workflow first."\nPrimary CTA "Join the waitlist", Secondary CTA "Use the late payment reminder generator".\nShow cards for upcoming tools with Coming Soon badges, not active generate forms. Include waitlist mini form, privacy consent microcopy, and footer legal. Avoid overpromising launch order.`
  },
  {
    slug: "error-system-pages",
    name: "404 500 Maintenance Pages",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\n\nDesign a DESKTOP system page set for FreelancerReply: 404, 500, and maintenance states shown as three side-by-side or stacked panels for frontend handoff.\n404: Title "Page not found." Body "The page you are looking for may have moved, or the tool may not be available yet." CTA "Generate a late payment reminder" secondary "Back to homepage".\n500: Title "Something went wrong." Body "We could not load this page. Please try again in a moment." CTA "Reload page" secondary "Back to homepage".\nMaintenance: Title "FreelancerReply is temporarily unavailable." Body "We are working on the beta tool. Please check back later." CTA "Back to homepage".\nUse calm paper-card design, small mail/reply icon, no panic red, legal footer compact.`
  }
];

function writeJson(name, data) {
  fs.writeFileSync(path.join(outputDir, name), JSON.stringify(data, null, 2));
}

function extractScreens(result) {
  const comps = result.structuredContent?.outputComponents || [];
  const out = [];
  for (const comp of comps) {
    const screens = comp.design?.screens || [];
    for (const s of screens) out.push(s);
  }
  return out;
}

function safeName(s) { return String(s).replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-").toLowerCase(); }

async function download(url, dest) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return dest;
}

const transport = new StdioClientTransport({
  command: "node",
  args: [serverPath],
  env: {
    ...process.env,
    HTTP_PROXY: process.env.HTTP_PROXY || "http://127.0.0.1:7897",
    HTTPS_PROXY: process.env.HTTPS_PROXY || "http://127.0.0.1:7897",
    ALL_PROXY: process.env.ALL_PROXY || "socks5://127.0.0.1:7897"
  }
});

const client = new Client({ name: "freelancerreply-stitch-generator", version: "1.0.0" });

try {
  await client.connect(transport);
  const create = await client.callTool(
    { name: "create_project", arguments: { title: "FreelancerReply — Calm Inbox Desk Site" } },
    undefined,
    { timeout: 300000, resetTimeoutOnProgress: true, maxTotalTimeout: 420000 }
  );
  writeJson("create-project-response.json", create);
  const createText = create.content?.map(c => c.text || "").join("\n") || JSON.stringify(create);
  const projectId = create.structuredContent?.project?.id || create.structuredContent?.id || createText.match(/\b\d{10,}\b/)?.[0];
  if (!projectId) throw new Error("Could not extract projectId from create_project response");

  const summary = { projectId, generatedAt: new Date().toISOString(), screens: [] };
  for (const item of screens) {
    console.error(`[stitch] generating ${item.slug}`);
    try {
      const result = await client.callTool(
        { name: "generate_screen_from_text", arguments: { projectId, prompt: item.prompt, deviceType: item.deviceType, modelId: "GEMINI_3_FLASH" } },
        undefined,
        { timeout: 300000, resetTimeoutOnProgress: true, maxTotalTimeout: 480000 }
      );
      writeJson(`${item.slug}.response.json`, result);
      const generated = extractScreens(result);
      const records = [];
      let idx = 0;
      for (const screen of generated) {
        idx += 1;
        const stem = `${safeName(item.slug)}${generated.length > 1 ? `-${idx}` : ""}`;
        const htmlPath = path.join(outputDir, `${stem}.html`);
        const screenshotPath = path.join(outputDir, `${stem}.png`);
        let htmlOk = null, screenshotOk = null, downloadError = null;
        try { htmlOk = await download(screen.htmlCode?.downloadUrl, htmlPath); } catch (e) { downloadError = `${downloadError || ""} html: ${e.message}`; }
        try { screenshotOk = await download(screen.screenshot?.downloadUrl, screenshotPath); } catch (e) { downloadError = `${downloadError || ""} screenshot: ${e.message}`; }
        records.push({
          screenName: screen.name,
          screenId: screen.id,
          width: screen.width,
          height: screen.height,
          htmlUrl: screen.htmlCode?.downloadUrl,
          screenshotUrl: screen.screenshot?.downloadUrl,
          localHtml: htmlOk,
          localScreenshot: screenshotOk,
          downloadError
        });
      }
      summary.screens.push({ slug: item.slug, name: item.name, deviceType: item.deviceType, ok: generated.length > 0, records });
    } catch (err) {
      fs.writeFileSync(path.join(outputDir, `${item.slug}.error.txt`), err?.stack || err?.message || String(err));
      summary.screens.push({ slug: item.slug, name: item.name, deviceType: item.deviceType, ok: false, error: err?.message || String(err) });
    }
    writeJson("summary.json", summary);
  }
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await client.close().catch(() => {});
}
