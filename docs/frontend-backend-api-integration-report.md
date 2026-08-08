# FreelancerReply 前后端 API 联调报告

## 结论

**WARN / API 联调通过，已接入真实后端 fallback 生成接口。**

- [事实] 前端已从 mock generator 改为调用 Cloudflare Workers 后端 API。
- [事实] 当前后端未接入 AI key，`/api/generate-payment-reminder` 返回 `meta.source = template_fallback`，用于结构联调通过。
- [事实] 已发现并修复 1 个后端联调问题：`generate` 原先在输入校验前扣 hourly/daily quota，导致无效请求也可能消耗额度/被 rate limit 抢先拦截。现已改为先校验和 Turnstile，再扣 quota。
- [事实] 已部署后端修复与前端 API 接入到 workers.dev。
- [待验证] 正式域名 `freelancerreply.com` / `api.freelancerreply.com` 尚未绑定，正式域名 CORS 仍需绑定后复测。

## 部署信息

| 项目 | URL | Version |
|---|---|---|
| Backend API | `https://freelancer-reply-api.huangzhenhui0303.workers.dev` | `a30a03c9-3e8a-4ecd-b2ca-1467a5f00f5e` |
| Frontend | `https://freelancer-reply.huangzhenhui0303.workers.dev` | `17d92d62-af90-4234-acdd-696866f053ea` |

## 已接 API

| 前端功能 | API | 状态 | 说明 |
|---|---|---|---|
| 初始化匿名 quota session | `POST /api/auth/login` | 已接 | `credentials: include`，失败不阻断生成，后端可 IP fallback |
| 读取 quota | `GET /api/usage` | 已接 | 显示今日免费剩余次数 |
| 生成 reminder | `POST /api/generate-payment-reminder` | 已接 | 当前为 `template_fallback`，AI key 未配置 |
| Pro waitlist | `POST /api/waitlist` | 已接 | 替换原 modal mock success |

## 直接 API 验证

### Health

- `GET /api/health`：200
- D1：true
- Queue：true
- R2：false（P0 不阻塞）
- AI provider：false（预期，未配置 AI key）

### CORS

请求：

- `OPTIONS /api/generate-payment-reminder`
- Origin：`https://freelancer-reply.huangzhenhui0303.workers.dev`

结果：204

关键响应头：

- `access-control-allow-origin: https://freelancer-reply.huangzhenhui0303.workers.dev`
- `access-control-allow-credentials: true`
- `access-control-allow-methods: GET, POST, OPTIONS`
- `access-control-allow-headers: content-type, authorization`

### Session / Usage / Generate / Waitlist

联调脚本结果：

- `POST /api/auth/login`：200，Set-Cookie present
- `GET /api/auth/me` with cookie：200，`authenticated=true`，`plan=free_beta`
- `GET /api/usage`：200，返回 daily limit 3
- `POST /api/generate-payment-reminder`：200
  - `gentle` / `firm` / `finalNotice` 均有内容
  - `meta.source=template_fallback`
  - `meta.inputStored=false`
- `POST /api/waitlist`：200，`stored.email=true`，`stored.generatorInput=false`

## 修复的问题

### backend-risk-001：输入校验顺序晚于 quota 扣减

- 发现方式：远端联调 invalid `paymentLink` 时，接口返回 `429 RATE_LIMITED`，而不是预期 `400 VALIDATION_ERROR`。
- 根因：`handleGenerate` 先执行 hourly/daily quota consume，再 parse / validate JSON body。
- 影响：无效请求可能消耗 quota，也可能因为 rate limit 抢先返回 429，前端无法准确展示输入错误。
- 修复：调整顺序为：
  1. `requireSessionSecret`
  2. `getActor`
  3. parse JSON
  4. validate input
  5. Turnstile check（如启用）
  6. consume hourly quota
  7. consume daily quota
  8. generate fallback / AI
- 验证：远端 invalid `paymentLink` 已返回：
  - HTTP 400
  - `code=VALIDATION_ERROR`
  - `message=paymentLink must be a valid URL.`

### backend-risk-002：Turnstile secret 启用时 token 可缺失

- 发现方式：代码审查。
- 根因：原逻辑仅在 `TURNSTILE_SECRET_KEY && body.turnstileToken` 时验证；如果配置了 secret 但请求不传 token，会跳过验证。
- 修复：如果 `TURNSTILE_SECRET_KEY` 存在但 body 无 `turnstileToken`，返回 `403 TURNSTILE_FAILED`。
- 当前状态：P0 未启用 Turnstile；修复已部署，不影响当前 fallback 联调。

## 前端实现变更

新增：

- `frontend/src/lib/api.ts`
  - `createAnonymousSession()`
  - `getUsage()`
  - `generatePaymentReminder()`
  - `submitWaitlist()`

修改：

- `frontend/src/components/tool/Generator.tsx`
  - 从 mock result 改成真实 API call
  - 保留 pre-submit preview，不作为正式结果
  - submit 成功后结果区使用 API response snapshot
  - quota 使用后端 `meta.quota` / `/api/usage`
  - waitlist modal 改成真实 `POST /api/waitlist`
  - API loading / error / success 状态已接
- `frontend/eslint.config.mjs`
  - 忽略 `.wrangler/**`，避免 preview 产物被 lint 扫描
- `.gitignore`
  - 忽略 `.dev.vars`

## 本地前后端联调验证

本地后端：`http://127.0.0.1:8789`  
本地前端 OpenNext preview：`http://127.0.0.1:8788`

验证结果：

- `npm run typecheck`（backend）：PASS
- `npm run lint && npm run build`（frontend）：PASS
- `SMOKE_BASE_URL=http://127.0.0.1:8788 npm run test`：PASS
  - routes：8
  - widths：320 / 375 / 390 / 768 / 1024
  - consoleErrors：[]
- Playwright generator API path：PASS
  - `/api/auth/login`：200
  - `/api/usage`：200
  - `/api/generate-payment-reminder`：200
  - 页面出现 `Your reminder drafts are ready.`
  - 页面显示 `template fallback until AI is connected`
- Playwright waitlist API path：PASS
  - `/api/auth/login`：200
  - `/api/usage`：200
  - `/api/waitlist`：200
  - 页面出现 `You’re on the waitlist.`

## 部署后联调验证

部署后前端：`https://freelancer-reply.huangzhenhui0303.workers.dev`  
部署后 API：`https://freelancer-reply-api.huangzhenhui0303.workers.dev`

Playwright deployed generator：PASS

- `/api/auth/login`：200
- `/api/usage`：200
- `/api/generate-payment-reminder`：200
- consoleErrors：[]
- 页面结果状态：ready=true
- source copy：显示 template fallback
- quota copy：显示 free generations left today

Playwright deployed waitlist：PASS

- `/api/auth/login`：200
- `/api/usage`：200
- `/api/waitlist`：200
- consoleErrors：[]
- 页面结果状态：success=true

## 仍需云枢羊处理

- 配置真实 `AI_PROVIDER_API_KEY` 前，生成质量仍只是模板 fallback。
- 绑定正式 API 域名后，复测 CORS：
  - `https://freelancerreply.com`
  - `https://www.freelancerreply.com`
  - `https://api.freelancerreply.com`
- Turnstile 上线前需提供 site key + secret key，并让前端提交 `turnstileToken`。
- 如果正式域名和 API 域名不同站点，需复核 cookie `SameSite` 策略；当前 workers.dev / 自定义子域名路径在 P0 可用，但正式域名绑定后必须重新验证 session cookie。
- AI provider 接入后，需要重新验证：
  - provider timeout
  - fallback 开关
  - unsafe output sanitizer
  - 20 条样例输出合规性

## Gate Recommendation

**WARN**

## Reason

API 结构联调与前端真实调用已通过，且已修复一个会影响用户错误提示和额度扣减的后端问题。当前可以继续进入 AI provider / Turnstile / 正式域名配置阶段。仍不能给 PASS，因为真实 AI 未接入、正式域名未绑定、Turnstile 未配置、正式域名 CORS 与 cookie 策略未复测。
