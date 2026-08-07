import fs from "node:fs";
import path from "node:path";
import { Client } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const projectId = "6284166158920708265";
const outputDir = "/Users/hzh/projects/freelancer-reply/stitch-output";
const serverPath = "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/stitch-proxy.mjs";
const edits = [
  {
    slug: "home-mobile-edited",
    replaces: "home-mobile",
    deviceType: "MOBILE",
    selectedScreenIds: ["0e9f21b8444246dcaa6adca88c522eb9"],
    prompt: `Edit this FreelancerReply mobile homepage to remove all unsupported Pro/unlimited claims. Replace "Unlimited generations" with "Higher monthly limits (planned)". Replace "Custom context injection" with "Saved client snippets (planned)". Make sure every Pro-related item is clearly labeled Waitlist / planned, not available now. Do not use the word unlimited anywhere. Do not imply checkout, login, subscription, or immediate Pro access. Preserve the Calm Inbox Desk visual style, warm paper background, teal CTA, and mobile usability.`
  },
  {
    slug: "tool-mobile-edited",
    replaces: "tool-mobile",
    deviceType: "MOBILE",
    selectedScreenIds: ["895c9faa29394390be7b1f1ef76bc0bd"],
    prompt: `Edit this FreelancerReply mobile tool page to fix compliance and pricing copy. In the quota reached state, replace "Upgrade to Pro for unlimited access and custom tone saving" with "Come back tomorrow or join the Pro waitlist for higher limits when Pro becomes available." Do not use the word unlimited anywhere. Make Pro clearly Waitlist / planned only. Do not imply payment, checkout, login, subscription, or immediate Pro access. Keep Free beta includes 3 generations per day, Nothing is sent automatically, Review and edit before sending, and Not legal/financial/accounting/debt collection advice. Preserve the Calm Inbox Desk style.`
  }
];
function writeJson(name, data) { fs.writeFileSync(path.join(outputDir, name), JSON.stringify(data, null, 2)); }
function extractScreens(result) { const out=[]; for (const comp of result.structuredContent?.outputComponents || []) for (const s of comp.design?.screens || []) out.push(s); return out; }
const transport = new StdioClientTransport({ command: "node", args: [serverPath], env: { ...process.env, HTTP_PROXY: process.env.HTTP_PROXY || "http://127.0.0.1:7897", HTTPS_PROXY: process.env.HTTPS_PROXY || "http://127.0.0.1:7897", ALL_PROXY: process.env.ALL_PROXY || "socks5://127.0.0.1:7897" } });
const client = new Client({ name: "freelancerreply-stitch-compliance-edit", version: "1.0.0" });
try {
  await client.connect(transport);
  const summary = JSON.parse(fs.readFileSync(path.join(outputDir, "summary.json"), "utf8"));
  summary.edits = summary.edits || [];
  for (const edit of edits) {
    console.error(`[stitch-edit] ${edit.slug}`);
    const result = await client.callTool({ name: "edit_screens", arguments: { projectId, selectedScreenIds: edit.selectedScreenIds, prompt: edit.prompt, deviceType: edit.deviceType, modelId: "GEMINI_3_FLASH" } }, undefined, { timeout: 300000, resetTimeoutOnProgress: true, maxTotalTimeout: 480000 });
    writeJson(`${edit.slug}.response.json`, result);
    const records = extractScreens(result).map(screen => ({ screenName: screen.name, screenId: screen.id, width: screen.width, height: screen.height, htmlUrl: screen.htmlCode?.downloadUrl, screenshotUrl: screen.screenshot?.downloadUrl, localHtml: null, localScreenshot: null }));
    summary.screens = summary.screens.filter(s => s.slug !== edit.slug);
    summary.screens.push({ slug: edit.slug, name: `${edit.replaces} compliance edit`, deviceType: edit.deviceType, ok: records.length > 0, records, supersedes: edit.replaces });
    summary.edits.push({ slug: edit.slug, supersedes: edit.replaces, reason: "Removed unsupported unlimited/upgrade wording" });
    writeJson("summary.json", summary);
  }
  console.log(JSON.stringify(summary.edits, null, 2));
} finally { await client.close().catch(() => {}); }
