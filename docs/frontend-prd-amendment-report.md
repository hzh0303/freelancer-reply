# FreelancerReply 前端 PRD Amendment 改造报告

## 结论

**WARN / 已完成、已部署、已推送。**

前端已从旧的 “选择 tone / 一次生成 Gentle、Firm、Final Notice 三封草稿 / tabs 切换” 改为新版 PRD 流程：根据 payment situation 推荐一个当前最合适的 reminder stage，并只展示一个推荐草稿。

仍为 WARN 的原因：正式域名 `freelancerreply.com` 未绑定；后端 AI 生成质量、限流、waitlist 存储和合规数据流仍需后端/合规继续验证。

## 项目信息

- 产品：FreelancerReply
- 前端目录：`frontend/`
- 技术栈：Next.js 16 + TypeScript + Tailwind CSS + OpenNext + Cloudflare Workers
- 部署 URL：`https://freelancer-reply.huangzhenhui0303.workers.dev`
- GitHub commit：`db70c29 feat: update reminder stage generator flow`
- Cloudflare Workers Version ID：`a09e287a-379a-4712-ae72-4c424c83de8d`

## 本次完成

- 工具页改为 situation-first 表单：
  - Client name
  - Invoice amount
  - Days overdue
  - Project or service
  - Previous reminders sent
  - Optional client relationship / invoice number / payment link
- 新增 stage recommendation preview。
- 生成结果改为单个 recommended reminder：
  - Recommended stage
  - Why this stage
  - Subject
  - Email
  - Short DM
- 移除旧 tabs 主流程。
- 移除公开页面旧 “tone picker / choose tone / 一次生成三封” 叙事。
- Final Notice 前增加确认弹窗。
- 保留 Make it softer / Make it firmer / Regenerate，但基于当前结果做 refinement。
- 更新 API request/response 类型，兼容 recommended response，并保留 legacy response fallback。
- 更新 analytics event 类型：stage recommended、make softer/firmer、final notice warning、copy variants、Pro waitlist 等。
- 修复首页与工具页 JSON-LD context。
- 修复 320px 移动端横向溢出。
- 更新 smoke test，加入：
  - API mock
  - 320 / 375 / 390 / 768 / 1024 宽度
  - stage recommendation matrix
  - Final Notice confirmation modal

## 核心推荐逻辑验证

Smoke test 覆盖：

| Days overdue | Previous reminders | Expected stage | 状态 |
|---:|---|---|---|
| 5 | None | Gentle Reminder | PASS |
| 12 | None | Firm Reminder | PASS |
| 35 | None | Firm Reminder | PASS |
| 35 | 2 reminders | Final Notice | PASS |

## 验证证据

已执行：

```bash
npm run lint
npm run build
```

结果：PASS。

已执行本地 OpenNext preview：

```bash
npm run preview
# [wrangler:info] Ready on http://localhost:8787
```

已执行本地 smoke：

```bash
SMOKE_BASE_URL=http://127.0.0.1:8787 npm run test
```

结果：

```json
{
  "ok": true,
  "base": "http://127.0.0.1:8787",
  "routes": 8,
  "widths": [320, 375, 390, 768, 1024],
  "consoleErrors": []
}
```

已部署到 Cloudflare Workers：

```text
Current Version ID: a09e287a-379a-4712-ae72-4c424c83de8d
URL: https://freelancer-reply.huangzhenhui0303.workers.dev
```

已执行线上 smoke：

```bash
SMOKE_BASE_URL=https://freelancer-reply.huangzhenhui0303.workers.dev npm run test
```

结果：

```json
{
  "ok": true,
  "base": "https://freelancer-reply.huangzhenhui0303.workers.dev",
  "routes": 8,
  "widths": [320, 375, 390, 768, 1024],
  "consoleErrors": []
}
```

线上路由 curl：

```text
/ 200
/late-payment-reminder-email-generator 200
/privacy-policy 200
/terms-of-service 200
/sitemap.xml 200
/robots.txt 200
```

Browser snapshot 已确认线上工具页包含：

- `Previous reminders sent`
- `Current recommendation preview`
- `Get recommended reminder`
- 单个 recommended reminder 空状态
- Final Notice / legal risk copy
- Footer Legal links

## 主要文件

- `frontend/src/components/tool/Generator.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/analytics.ts`
- `frontend/src/components/sections/HeroSection.tsx`
- `frontend/src/components/sections/ToolEntry.tsx`
- `frontend/src/components/sections/ContentSections.tsx`
- `frontend/src/data/content.ts`
- `frontend/src/app/late-payment-reminder-email-generator/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/globals.css`
- `frontend/scripts/smoke.mjs`

## API 依赖 / 给云枢羊

前端当前调用：

- `POST /api/auth/login`
- `GET /api/usage`
- `POST /api/generate-payment-reminder`
- `POST /api/waitlist`

新版 generate request 关键字段：

```json
{
  "clientName": "Sarah",
  "invoiceAmount": "$850",
  "daysOverdue": 12,
  "projectType": "Website redesign",
  "previousRemindersSent": "none",
  "recommendedStage": "Firm Reminder",
  "refinementMode": "initial",
  "stageReason": "...",
  "invoiceNumber": "...",
  "paymentLink": "...",
  "clientRelationship": "Repeat client"
}
```

推荐新版 response：

```json
{
  "recommendedStage": "Firm Reminder",
  "stageReason": "...",
  "subject": "...",
  "emailBody": "...",
  "shortMessage": "...",
  "riskNotice": "...",
  "disclaimer": "...",
  "meta": {
    "source": "ai_provider",
    "quota": {
      "used": 1,
      "limit": 2,
      "remaining": 1,
      "resetAt": "..."
    }
  }
}
```

## 风险

- `[backend-risk]` AI 输出、quota、waitlist、Turnstile、provider fallback 仍需后端继续验证。
- `[seo-risk]` canonical 指向 `freelancerreply.com`，但正式域名尚未绑定。
- `[compliance-risk]` Final Notice 文案已加提示，但正式 AI prompt/output 仍需合规样例复核。
- `[repo-risk]` 仓库中仍有非本次前端提交的 backend/docs 未提交改动，未纳入本次 commit。

## 给灰太狼挑战 Agent

重点测：

- `/`
- `/late-payment-reminder-email-generator`
- 320 / 375 / 390 / 768 / 1024
- Previous reminders 四个选项
- stage preview matrix
- Submit 前结果不出现
- Submit 后一次性显示 recommended reminder
- Make it firmer 从 Firm 到 Final Notice 时必须出现确认弹窗
- Copy subject/email/DM
- Pro Waitlist modal
- Footer Legal links

## Gate Recommendation

**WARN**

## Reason

前端 PRD amendment 的 P0 交互已完成、构建通过、本地和线上 smoke 通过、已部署并推送 commit。仍为 WARN 是因为正式域名、后端 AI/限流/waitlist/合规样例评测未全部完成。