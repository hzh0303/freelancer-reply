import fs from "node:fs";
import path from "node:path";
import { Client } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const projectId = "6284166158920708265";
const serverPath = "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/stitch-proxy.mjs";
const outputDir = "/Users/hzh/projects/freelancer-reply/stitch-output";
fs.mkdirSync(outputDir, { recursive: true });

const baseStyle = `Project: FreelancerReply, a calm AI-assisted email drafting tool for English-speaking solo freelancers. Approved direction: Calm Inbox Desk. Warm paper #F7F3EC, surface #FFFEFA, ink #17211C, muted #6E7974, border #DDE5DF, teal #1C8C7A, amber #B7791F. Editorial headline, Inter-like UI. Solid paper cards, thin borders, subtle shadows, 16-20px radius. P0 free beta: no login, no checkout, no payments, no automatic email sending, no invoice system, no CRM, no fake testimonials/ratings/logos. Pro is waitlist/planned only. Free beta 3 generations/day. Nothing is sent automatically. Review, edit, copy, send yourself. Not legal, financial, accounting, or debt collection advice. Avoid purple-blue AI gradients, robots, magic wand, 3D blobs, excessive glass, emoji piles, debt collection red visuals, Send email button, guaranteed payment claims.`;

const screens = [
  {
    slug: "pricing-waitlist-desktop",
    name: "Pricing and Waitlist Desktop",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\nDesign a high-fidelity DESKTOP pricing/waitlist page or section. H1 "Free beta for your first overdue invoice follow-ups." Three plan cards. Free Beta highlighted: $0, 3 generations/day, Gentle/Firm/Final Notice, subject lines, full email bodies, short DM/SMS, copy/regenerate, tone change, no account required; visible limits: 3 generations per IP/session/day, regenerations count, no saved clients/history/brand voice/sequence export/automatic sending/invoice/payment processing. CTA Generate a free reminder. Pro Solo: $9/month or $90/year, badge Waitlist / planned for P1, planned includes 300 generations/month, 30/day soft limit, 25 saved client snippets, 3 brand voices, 100 sequence exports/month, more freelancer email tools. Pro Plus: $19/month or $190/year, badge Optional P1/P2 waitlist, 1,500 generations/month, 100/day soft limit, 200 snippets, 10 brand voices, 500 exports/month, possible 1-3 seat support [待确认]. Bottom safety copy: P0 no payments, prices/features may change before launch, refund/payment provider details published before any charge. No checkout buttons.`
  },
  {
    slug: "legal-template-desktop",
    name: "Legal Pages Template Desktop",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\nDesign a high-fidelity DESKTOP legal page template for /privacy, /terms, /cookies, /refund. Trustworthy and readable, not marketing-heavy. Header with logo and back-to-generator CTA. Main layout: left sticky page nav (Privacy Policy, Terms of Service, Cookie Policy, Refund Policy), center article content, right important notice card. Show Privacy Policy active. H1 "Privacy Policy". Intro: "FreelancerReply is an AI-assisted email drafting tool for freelancers. This Privacy Policy explains what information may be collected, how it is used, and what choices you have." Notice box: "Do not enter sensitive financial, legal, personal, or confidential information unless it is necessary for the draft. Generator inputs may be sent to an AI provider to create the email." Sections: Information you enter, Waitlist information, Usage and analytics information, AI processing, Third-party services, Cookies, Data retention, Your choices, Contact [CONTACT_EMAIL 待确认]. Footer legal links. 16px body, clear anchors. No fake provider names.`
  },
  {
    slug: "coming-soon-template",
    name: "Coming Soon Tool Page Template",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\nDesign a high-fidelity DESKTOP coming-soon tool page template for planned routes: /proposal-follow-up-email-generator, /scope-creep-response-generator, /testimonial-request-email-generator, /price-increase-email-generator. Make it clear the tool is not available in current beta. H1 example "Proposal Follow-Up Email Generator for Freelancers". Body: "This tool is not available in the current beta. FreelancerReply is starting with the Late Payment Reminder Email Generator so we can validate one clear freelancer workflow first." Primary CTA Join the waitlist, Secondary CTA Use the late payment reminder generator. Show cards for upcoming tools with Coming Soon badges, not active generate forms. Include waitlist mini form, privacy consent microcopy, and footer legal. Avoid overpromising launch order.`
  },
  {
    slug: "error-system-pages",
    name: "404 500 Maintenance Pages",
    deviceType: "DESKTOP",
    prompt: `${baseStyle}\nDesign a DESKTOP system page set: 404, 500, and maintenance states shown as three panels for frontend handoff. 404: Title "Page not found." Body "The page you are looking for may have moved, or the tool may not be available yet." CTA "Generate a late payment reminder" secondary "Back to homepage". 500: Title "Something went wrong." Body "We could not load this page. Please try again in a moment." CTA "Reload page" secondary "Back to homepage". Maintenance: Title "FreelancerReply is temporarily unavailable." Body "We are working on the beta tool. Please check back later." CTA "Back to homepage". Calm paper-card design, small mail/reply icon, no panic red, compact legal footer.`
  }
];

function writeJson(name, data) { fs.writeFileSync(path.join(outputDir, name), JSON.stringify(data, null, 2)); }
function extractScreens(result) {
  const comps = result.structuredContent?.outputComponents || [];
  const out = [];
  for (const comp of comps) for (const s of (comp.design?.screens || [])) out.push(s);
  return out;
}
function loadSummary() {
  const p = path.join(outputDir, "summary.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : { projectId, generatedAt: new Date().toISOString(), screens: [] };
}

const transport = new StdioClientTransport({ command: "node", args: [serverPath], env: { ...process.env, HTTP_PROXY: process.env.HTTP_PROXY || "http://127.0.0.1:7897", HTTPS_PROXY: process.env.HTTPS_PROXY || "http://127.0.0.1:7897", ALL_PROXY: process.env.ALL_PROXY || "socks5://127.0.0.1:7897" } });
const client = new Client({ name: "freelancerreply-stitch-continue", version: "1.0.0" });
try {
  await client.connect(transport);
  const summary = loadSummary();
  for (const item of screens) {
    console.error(`[stitch] generating ${item.slug}`);
    try {
      const result = await client.callTool({ name: "generate_screen_from_text", arguments: { projectId, prompt: item.prompt, deviceType: item.deviceType, modelId: "GEMINI_3_FLASH" } }, undefined, { timeout: 300000, resetTimeoutOnProgress: true, maxTotalTimeout: 480000 });
      writeJson(`${item.slug}.response.json`, result);
      const records = extractScreens(result).map(screen => ({ screenName: screen.name, screenId: screen.id, width: screen.width, height: screen.height, htmlUrl: screen.htmlCode?.downloadUrl, screenshotUrl: screen.screenshot?.downloadUrl, localHtml: null, localScreenshot: null }));
      summary.screens = summary.screens.filter(s => s.slug !== item.slug);
      summary.screens.push({ slug: item.slug, name: item.name, deviceType: item.deviceType, ok: records.length > 0, records });
    } catch (err) {
      fs.writeFileSync(path.join(outputDir, `${item.slug}.error.txt`), err?.stack || err?.message || String(err));
      summary.screens = summary.screens.filter(s => s.slug !== item.slug);
      summary.screens.push({ slug: item.slug, name: item.name, deviceType: item.deviceType, ok: false, error: err?.message || String(err) });
    }
    writeJson("summary.json", summary);
  }
  console.log(JSON.stringify(summary, null, 2));
} finally { await client.close().catch(() => {}); }
