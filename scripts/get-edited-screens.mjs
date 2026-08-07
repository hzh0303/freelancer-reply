import fs from "node:fs";
import path from "node:path";
import { Client } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";
const projectId="6284166158920708265";
const outputDir="/Users/hzh/projects/freelancer-reply/stitch-output";
const serverPath="/Users/hzh/.hermes/profiles/design-artist/mcp/stitch/stitch-proxy.mjs";
const targets=[{slug:"home-mobile",screenId:"0e9f21b8444246dcaa6adca88c522eb9"},{slug:"tool-mobile",screenId:"895c9faa29394390be7b1f1ef76bc0bd"}];
const transport = new StdioClientTransport({ command:"node", args:[serverPath], env:{...process.env, HTTP_PROXY:process.env.HTTP_PROXY||"http://127.0.0.1:7897", HTTPS_PROXY:process.env.HTTPS_PROXY||"http://127.0.0.1:7897", ALL_PROXY:process.env.ALL_PROXY||"socks5://127.0.0.1:7897"}});
const client=new Client({name:"freelancerreply-get-edited",version:"1.0.0"});
function extractScreens(result){ const out=[]; for(const comp of result.structuredContent?.outputComponents||[]) for(const s of comp.design?.screens||[]) out.push(s); return out; }
try{
 await client.connect(transport);
 for(const t of targets){
  const result=await client.callTool({name:"get_screen", arguments:{name:`projects/${projectId}/screens/${t.screenId}`, projectId, screenId:t.screenId}}, undefined, {timeout:300000, resetTimeoutOnProgress:true});
  fs.writeFileSync(path.join(outputDir,`${t.slug}.get-screen-after-edit.json`), JSON.stringify(result,null,2));
  console.log(t.slug, JSON.stringify(extractScreens(result).map(s=>({id:s.id, html:s.htmlCode?.downloadUrl, screenshot:s.screenshot?.downloadUrl})),null,2));
 }
} finally { await client.close().catch(()=>{}); }
