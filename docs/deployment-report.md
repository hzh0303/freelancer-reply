# 云枢羊后端开发报告

## 结论

**WARN / DEPLOYED TO WORKERS.DEV**

- [事实] 已为 FreelancerReply 生成 Cloudflare Workers 后端项目代码，并完成 D1、Queues、Worker Secret、D1 migration、Workers 部署和 API smoke 验证。
- [事实] API Base URL 已可用：`https://freelancer-reply-api.huangzhenhui0303.workers.dev`
- [事实] R2 创建失败，Cloudflare API 返回 `code: 10042`：当前账号需要先在 Dashboard 启用 R2。
- [事实] 自定义域名 `api.freelancerreply.com` 绑定失败，Wrangler 返回 `code: 10082`：无法从 route 推断 Zone，需要确认 `freelancerreply.com` Zone 是否已接入当前 Cloudflare 账号。
- [事实] 当前未配置真实 `AI_PROVIDER_API_KEY`，所以生成 API 运行在 `template_fallback` 模式；secret 未暴露。
- [事实] P0 上游要求无登录、无支付、不保存 generator 输入、不自动发送邮件，因此本后端没有接 Stripe/Google OAuth；`/api/auth/login` 只创建匿名 httpOnly session 供 quota 使用。

## 项目信息

- 产品名称：FreelancerReply
- 后端平台：Cloudflare Workers
- 数据库：Cloudflare D1
- D1 database：`freelancer-reply-db`
- D1 database_id：`b21efcc1-446d-448c-a6e5-67450b3a0087`
- 存储：R2 未启用；P0 不绑定 R2
- Queue：`freelancer-reply-tasks`
- 支付：P0 无支付 / 无 Stripe
- 鉴权：匿名 httpOnly session；P0 无 Google OAuth
- 后端状态：`[已验证-workers.dev] / [WARN: custom domain, R2, AI key 待配置]`
- API Base URL：`https://freelancer-reply-api.huangzhenhui0303.workers.dev`
- Worker Version ID：`d13be13f-ca10-49c8-b212-55e17d4ce78d`
- 报告时间：`2026-08-08T03:40:48Z`

## 后端架构

- Runtime：Cloudflare Workers + TypeScript
- API：`src/index.ts`
- Auth：P0 匿名 session；`fr_session` httpOnly / Secure / SameSite=Lax cookie
- Database：D1，保存匿名用户、sessions、quota、usage、waitlist、analytics events、tasks、audit logs
- Storage：R2 目标 bucket `freelancer-reply-assets`，但账号未启用；P0 无上传/文件输出，未绑定不影响当前功能
- Queue：Cloudflare Queue `freelancer-reply-tasks`，当前用于 generation completed 异步事件占位
- Cache：未使用 KV；quota 用 D1 原子 UPDATE
- Payment：P0 不接 Stripe，符合定价与合规报告
- AI Provider：后端支持 OpenAI-compatible `/chat/completions` proxy；当前无 key，启用模板 fallback

## API 合约

机器可读合约已输出：`backend/docs/api-contract.json`

| Method | Path | Auth | 用途 | 成本影响 | 状态 |
|---|---|---|---|---|---|
| GET | `/api/health` | 否 | 健康检查、绑定状态 | 无 | `[已验证]` |
| POST | `/api/auth/login` | 否 | 创建匿名 httpOnly quota session | 无 | `[已验证]` |
| GET | `/api/auth/me` | 可选 | 查询当前匿名 session / entitlements | 无 | `[已验证]` |
| GET | `/api/me` | 可选 | `/api/auth/me` alias | 无 | `[已实现]` |
| GET | `/api/usage` | 可选 | 查询生成 / waitlist quota | 无 | `[已验证]` |
| POST | `/api/generate-payment-reminder` | 可选 | 生成 Gentle / Firm / Final Notice | 高；当前 fallback 低成本 | `[已验证-template_fallback]` |
| POST | `/api/waitlist` | 可选 | 保存 Pro waitlist 邮箱和画像 | 无 | `[已验证]` |
| POST | `/api/events` | 可选 | 可选一方 analytics event | 低 | `[已实现]` |

## 关键 API 说明

### POST `/api/generate-payment-reminder`

- Auth Required：可选。若无 cookie，则用 IP hash 作为 anonymous actor；建议前端先调用 `/api/auth/login` 获取 httpOnly session。
- Request Body：

```json
{
  "clientName": "Sarah",
  "invoiceAmount": "$850",
  "daysOverdue": 12,
  "projectType": "website redesign",
  "tone": "Professional",
  "invoiceNumber": "INV-1042",
  "paymentLink": "https://example.com/pay",
  "clientRelationship": "Repeat client"
}
```

- Response Body：`gentle` / `firm` / `finalNotice`，每个含 `subject`、`emailBody`、`shortMessage`，另含 `disclaimer` 和 `meta.quota`。
- Rate Limit：
  - daily：3 generations / IP or session / UTC day
  - hourly：3 generations / IP / UTC hour
- Usage Cost：1 unit / generation；regenerate 也应计 1 unit。
- Data Stored：`quota_counters`、`usage_logs`、`tasks.input_hash`。**不存 raw generator input/output**。
- Error Codes：
  - `400 VALIDATION_ERROR`
  - `402 QUOTA_EXCEEDED`
  - `429 RATE_LIMITED`
  - `503 PROVIDER_UNAVAILABLE`（只有关闭 fallback 且 AI provider 失败时）
- Notes：当前 `AI_PROVIDER_API_KEY` 未配置，因此响应 `meta.source = template_fallback`。

### GET `/api/usage`

- Auth Required：可选
- Response Body：当前 actor、generate quota、waitlist quota、P0 limits
- Data Source：D1 `quota_counters`
- Notes：用于前端显示 `2 of 3 free generations left today` 类 UI。

### POST `/api/auth/login`

- Auth Required：否
- 用途：P0 不做真实登录；该接口创建匿名 session 用于 quota/usage 状态。
- Cookie：`fr_session`; `HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
- Rate Limit：30 / IP / day
- Data Stored：`users(user_type='anonymous')`、`sessions`

### POST `/api/waitlist`

- Auth Required：可选
- Request Body：`email` 必填；`role`、`biggestPaymentProblem`、`sourcePage`、`featureInterest` 可选
- Rate Limit：10 / IP or session / day
- Data Stored：`waitlist_subscribers`
- 合规说明：仅用户主动提交 waitlist 时保存 email；不保存 generator 输入。

### POST `/api/events`

- Auth Required：可选
- 用途：若不使用第三方 analytics，前端可提交一方事件。
- Data Stored：`analytics_events`，保存 event name/page/tone/bounded metadata/ip_hash。

## 数据库 Schema

### users

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | anonymous user id |
| user_type | TEXT | anonymous |
| email | TEXT | P0 通常为空 |
| name | TEXT | 预留 |
| plan | TEXT | free |
| role | TEXT | user |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### sessions

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | session id |
| user_id | TEXT | users.id |
| expires_at | TEXT | 过期时间 |
| created_at | TEXT | 创建时间 |
| last_seen_at | TEXT | 最近访问 |

### waitlist_subscribers

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | 记录 ID |
| email | TEXT | 用户提交邮箱 |
| role | TEXT | 用户角色 |
| biggest_payment_problem | TEXT | 用户痛点 |
| source_page | TEXT | 来源页面 |
| feature_interest | TEXT | Pro 假门兴趣 |
| ip_hash | TEXT | hash 后 IP |
| created_at | TEXT | 创建时间 |

### usage_logs

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | 记录 ID |
| user_id | TEXT | 用户 ID，可空 |
| anon_id | TEXT | 匿名 actor hash |
| ip_hash | TEXT | hash 后 IP |
| action | TEXT | 使用类型 |
| cost_units | INTEGER | 消耗额度 |
| status | TEXT | success / rejected / validation 等 |
| metadata | TEXT | bounded JSON，不含 raw prompt |
| created_at | TEXT | 创建时间 |

### quota_counters

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | actor/action/period/bucket |
| actor_type | TEXT | anonymous / user |
| actor_id | TEXT | actor id |
| action | TEXT | generate / waitlist / login |
| period | TEXT | daily / hourly |
| used | INTEGER | 已用 |
| quota_limit | INTEGER | 限额 |
| reset_at | TEXT | 重置时间 |
| updated_at | TEXT | 更新时间 |

### tasks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | task id |
| task_type | TEXT | generate_payment_reminder |
| status | TEXT | completed / future async status |
| input_hash | TEXT | 输入 hash，不是原文 |
| output_r2_key | TEXT | P0 空 |
| error_code | TEXT | 错误码 |
| created_at | TEXT | 创建时间 |
| finished_at | TEXT | 完成时间 |

### analytics_events / audit_logs

- `analytics_events`：可选一方 analytics 事件。
- `audit_logs`：未来人工开通/权限调整审计预留。

## Usage / Quota 规则

### Anonymous

- 每日限制：3 generation / UTC day
- 每小时限制：3 generation / UTC hour
- Waitlist：10 submits / day
- Login/session 创建：30 / day
- 高成本功能：允许，但必须经过 quota；当前无 AI key 时 fallback 低成本
- 是否允许：P0 允许匿名免费 beta

### Free User

- P0 无真实账号；匿名 session 视作 free beta actor
- 每日限制：3 generation / day
- 每月限制：P0 未设置
- 高成本功能限制：generator 每次扣 1 unit
- 是否需要登录：不需要；建议创建匿名 session 以稳定 quota UI

### Pro User

- P0 无 Pro 购买，只有 waitlist
- P1 定价报告建议：Pro Solo 300 generations/month、30/day soft limit；Pro Plus 1500/month、100/day soft limit
- 当前后端未激活 Pro entitlement，避免和 P0 合规/定价冲突

## Rate Limit

- IP 级别：generation hourly + daily；login daily
- User/session 级别：generation daily；waitlist daily
- API 级别：见 API contract
- 高成本任务限制：generator 先扣 quota 再调用 provider/fallback
- 异常处理：provider 失败默认 fallback；若 `ALLOW_TEMPLATE_FALLBACK=false` 则返回 `503 PROVIDER_UNAVAILABLE`

## 支付流程

P0 不接支付，符合定价和合规报告：

1. Pricing report 建议 P0：Free Beta + Pro waitlist，不建议直接上正式付费。
2. Compliance report 明确 P0：不处理支付、不接 Stripe、不订阅。
3. 当前后端未创建 `/api/checkout` 或 `/api/webhook/stripe`，避免前端/用户误认为已可购买。
4. P1 如接 Stripe，必须新增 server-side Checkout + signed Webhook + orders/subscriptions schema + `/api/me` entitlement 更新。

## 环境变量清单

不要输出真实值，只列变量名和用途。

| 变量名 | 用途 | 必需 |
|---|---|---|
| SESSION_SECRET | 签名 session cookie、IP hash | 是，已配置 |
| AI_PROVIDER_API_KEY | AI provider server-side key | P0 真实 AI 生成需要；当前未配置 |
| AI_PROVIDER_BASE_URL | OpenAI-compatible endpoint | 否，已用 var 默认 |
| AI_MODEL | 生成模型名 | 否，已用 var 默认 |
| TURNSTILE_SECRET_KEY | Cloudflare Turnstile 验证 | 建议，当前未配置 |
| STRIPE_SECRET_KEY | Stripe 服务端密钥 | P0 不需要 |
| STRIPE_WEBHOOK_SECRET | Stripe Webhook 验签 | P0 不需要 |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | P0 不需要 |
| GOOGLE_CLIENT_SECRET | Google OAuth Secret | P0 不需要 |

## 数据流与合规一致性

- 用户输入：clientName、invoiceAmount、daysOverdue、projectType、optional invoiceNumber/paymentLink/clientRelationship。
- 后端处理：校验长度、URL、unsafe 词；按 quota 扣 1 unit。
- 第三方 API：如配置 `AI_PROVIDER_API_KEY`，表单字段会发给 AI Provider；当前未配置，未发送第三方 AI。
- 数据存储：不保存 raw generator input/output；只保存 input hash、usage/quota、waitlist 主动提交数据。
- 保存时间：当前未实现自动清理；建议 P1 加 scheduled retention cleanup。
- 删除机制：P0 需通过 support 邮箱人工删除 waitlist；P1 可加 `/api/privacy/delete-request`。
- 与合规报告冲突项：无 P0 冲突；但 AI provider、analytics、retention、Turnstile 仍需上线前更新 Privacy/Terms 中的具体服务说明。

## 与工程羊 Agent 的联调说明

- 前端需要调用的 API：
  - `POST /api/auth/login`：初始化匿名 quota session，可选但推荐。
  - `GET /api/usage`：显示每日 3 次 quota。
  - `POST /api/generate-payment-reminder`：替换当前 mock generator。
  - `POST /api/waitlist`：替换当前 modal mock success。
  - `POST /api/events`：如需要一方 analytics。
- Mock 可替代接口：若后端不可用，前端可保留现有 mock，但不能当生产数据。
- 必须等待后端完成的接口：真实 AI 生成需要 `AI_PROVIDER_API_KEY`；当前 fallback 已可联调结构。
- 错误码说明：`VALIDATION_ERROR`、`QUOTA_EXCEEDED`、`RATE_LIMITED`、`PROVIDER_UNAVAILABLE`、`TURNSTILE_FAILED`。
- Loading / Error / Success 状态建议：
  - 402：显示每日额度用完，引导明天再来 / Pro waitlist。
  - 429：显示请求过快，提示稍后重试。
  - 503：显示生成服务暂不可用，保留输入。

## 已完成

- 生成后端项目：`/Users/hzh/projects/freelancer-reply/backend/`
- 写入 `package.json`、`tsconfig.json`、`wrangler.toml`
- 写入 Worker API：`backend/src/index.ts`
- 写入 D1 migration：`backend/migrations/0001_initial.sql`
- 写入机器可读 API 合约：`backend/docs/api-contract.json`
- 创建 D1：`freelancer-reply-db` / `b21efcc1-446d-448c-a6e5-67450b3a0087`
- 创建 Queue：`freelancer-reply-tasks`
- 写入 Cloudflare Secret：`SESSION_SECRET`（未输出值）
- 执行 D1 remote migration：`0001_initial.sql ✅`
- 部署 Worker：`freelancer-reply-api`
- 验证 API：health/login/me/usage/generate/waitlist

## 未完成

- R2 bucket 未创建：Cloudflare 账号未启用 R2，API code `10042`。
- 自定义域名未绑定：`api.freelancerreply.com` 无法推断 Zone，API code `10082`。
- `AI_PROVIDER_API_KEY` 未配置：当前生成使用 template fallback，不是真实 AI。
- Turnstile 未配置：`TURNSTILE_SECRET_KEY` 缺失；当前依赖 quota/rate-limit，不含 bot challenge。
- 前端尚未改成真实 API 调用。

## 验证证据

- `npm install`：PASS，0 vulnerabilities
- `npm run typecheck`：PASS
- `npx wrangler d1 migrations apply freelancer-reply-db --remote`：`0001_initial.sql ✅`
- `npx wrangler d1 execute ... SELECT name FROM sqlite_master...`：表已创建：`users`、`sessions`、`waitlist_subscribers`、`usage_logs`、`quota_counters`、`rate_limits`、`tasks`、`audit_logs`、`analytics_events`
- `npm run deploy`：PASS，Worker Version ID `d13be13f-ca10-49c8-b212-55e17d4ce78d`
- API smoke：
  - `/api/health`：200
  - `/api/auth/login`：200，Set-Cookie present
  - `/api/auth/me`：200，authenticated true after cookie
  - `/api/usage`：200，daily generation limit 3
  - `/api/generate-payment-reminder`：200，`meta.source=template_fallback`，remaining quota 2
  - `/api/waitlist`：200，D1 waitlist count increased
- D1 counts after smoke：`users=3`、`sessions=3`、`usage_logs=3`、`waitlist=1`、`tasks=2`

## 风险

- [backend-risk] 当前 AI 生成未接真实 AI key，输出是 fallback 模板；可联调结构，不代表真实 AI 输出质量已验证。
- [cost-risk] 上线真实 AI 前必须配置 Turnstile 或更强 bot 防护，否则 3/day IP quota 仍可能被分布式刷量绕过。
- [compliance-risk] Privacy/Terms 需补充真实 AI Provider、Turnstile、Cloudflare D1/Workers、retention/delete 机制。
- [security-risk] 当前只配置 `SESSION_SECRET`；不要把 AI/Stripe/OAuth secret 写入前端或仓库。
- [infra-risk] R2 未启用；如 P1 需要存储历史/导出/文件，必须先启用并绑定 R2。
- [domain-risk] `freelancerreply.com` Zone 未确认接入当前 Cloudflare 账号，自定义域名未绑定。

## 待验证信息

- [待验证] `freelancerreply.com` Zone 是否已接入当前 Cloudflare 账号。
- [待验证] 是否使用 `api.freelancerreply.com` 还是 `freelancerreply.com/api/*` 作为最终 API 入口。
- [待验证] AI Provider 具体服务、模型、数据保留政策、DPA/隐私边界。
- [待验证] Turnstile site key / secret key。
- [待验证] 前端真实 API 联调与 CORS 在正式域名下是否通过。

## 给灰太狼挑战 Agent 的说明

- 重点测试 API：`/api/generate-payment-reminder`、`/api/waitlist`、`/api/usage`
- 重点测试支付场景：P0 无支付；应确认页面不能误导用户为已可购买
- 重点测试额度滥用：同 IP/session 连续 4 次 generate 应触发 402/429；无 cookie 情况应按 IP hash 限制
- 重点测试登录状态：`/api/auth/login` 只应生成匿名 session，不应声称 Google login 或账号系统已完成
- 重点测试错误状态：缺字段、非法 paymentLink、unsafe_input、quota exhausted、provider unavailable
- 重点测试合规：生成内容不得声称法律威胁、自动发送、保证收款；结果区必须保留 disclaimer

## Gate Recommendation

**WARN**

## Reason

后端核心代码、D1、Queue、Secret、migration、workers.dev deploy、API smoke 已真实完成并验证，足以进入前端联调。但仍不能给 Production PASS：R2 未启用、自定义域名未绑定、真实 AI key/Turnstile 未配置、Privacy/Terms 需按真实 provider 更新。因此建议 **WARN / 可进入联调，不建议直接 production launch PASS**。
