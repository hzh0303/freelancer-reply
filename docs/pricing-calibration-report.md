# 钱袋羊定价校准报告：FreelancerReply

> 项目：FreelancerReply  
> 阶段：03-pricing / 定价与商业模型校准  
> 输入：  
> - `/Users/hzh/projects/freelancer-reply/docs/opportunity-analysis.md`  
> - `/Users/hzh/projects/freelancer-reply/docs/product-definition-prd.md`  
> 输出 Agent：钱袋羊 Agent  
> 状态：WARN / 带风险继续  

---

## 结论

**WARN / 带风险继续**

一句话账房判断：

> 首版不建议直接上正式付费。  
> P0 应该做 **免费 Beta + 限流 + Pro 假门 / waitlist**。  
> 等验证 `copy_clicked`、`pro_feature_clicked`、`waitlist_submitted` 后，再上线 Stripe 付费。

原因：

- [事实] PRD 明确首版只做一个工具页：`Late Payment Reminder Email Generator for Freelancers`。
- [事实] SERP 竞品里有大量免费 generator / template / invoice SaaS 引流页。
- [事实] 单工具付费弱，PRD 也已标记为风险。
- [估算] GPT-4.1 mini 级别每次生成成本很低，但免费层如果无限开放，仍会被刷出 API 成本。
- [判断] 当前真正要验证的不是“用户愿不愿意立刻订阅”，而是：
  - 用户是否生成；
  - 是否复制；
  - 是否点击 Pro 功能；
  - 是否愿意留邮箱。

---

## 推荐收费模型

| 项目 | 建议 |
|---|---|
| 推荐模型 | **Beta free + daily quota + Pro waitlist → 后续 subscription** |
| P0 是否接支付 | **不建议** |
| P1 支付模型 | subscription |
| 辅助模型 | 可测试 one-time template pack，但不作为主模型 |
| 不推荐 | credits 作为首版主模型 |
| 不推荐 | Lifetime 首版上线 |
| 不推荐 | ads_affiliate 作为主收入 |

### 理由

**推荐 subscription：**

- [假设] 成熟 freelancer 的付费点不是“一封催款邮件”，而是持续的客户沟通工具：
  - saved clients；
  - brand voice；
  - reminder sequence export；
  - proposal follow-up；
  - scope creep response；
  - testimonial request；
  - 多工具矩阵。
- [判断] 如果后续做成 freelancer client communication toolkit，订阅比单次 credits 更容易理解。

**不推荐首版 credits：**

- [事实] 当前 P0 只有一个工具页。
- [判断] 让用户为几封催款邮件买 credits，转化阻力大。
- [风险] 低客单 credits 包还会被 Stripe 固定手续费吃掉利润。

**不推荐 P0 ads_affiliate 为主：**

- [判断] SEO 流量未验证，广告收入太薄。
- [可选] 可以后续挂发票 SaaS、freelancer 工具 affiliate，但不能指望首版养活站点。

---

## 竞品定价表

> 说明：以下价格来自公开 pricing 页 / 搜索结果实扫，价格会变化，上线前应再复核一次。

| 竞品 | 类型 | Free 层 | 入门价 | Pro / 中档价 | 用量限制 / 备注 | 对 FreelancerReply 的启发 |
|---|---|---:|---:|---:|---|---|
| Taskade | 泛 AI workspace / generator | 有 Free | $10/mo 年付 | $25/mo Business | Pro 含 50,000 AI credits/月；年付省 50% | 泛 AI 工具价格锚点高，但不是垂直 freelancer 工具 |
| Bonsai | Freelancer business suite | 有试用 | $15/user/mo 月付；$9/user/mo 年付 | $25–39/user/mo 月付 | CRM、发票、合同、client portal | 完整 freelancer SaaS 起价 $15/mo 左右，FreelancerReply 不能比它还像重 SaaS |
| Invoicer.ai | Invoice SaaS + AI | 14 天免费试用 | $12/mo；$8/mo 年付 | $25/mo；$20/mo 年付 | Basic 每日 50 documents，AI assistant light use | 发票 SaaS 的 AI 辅助入门锚点约 $8–12/mo |
| Can You Pay That | 自动发票提醒 | Free：3 clients / 10 invoices/mo | $12/mo；$120/year | $29/mo；$290/year | Starter 50 clients / 250 invoices/mo；Pro 2,000 invoices/mo | 直接竞品的轻 SaaS 起价 $12/mo，且 Free 很明确有限额 |
| Wave | Accounting / invoicing | Starter $0 | Pro $19/mo | $190/year | 自动 late payment reminders 属于 Pro | 免费发票工具很强，付费点在自动化和财务流程 |
| FreshBooks | Accounting / invoice SaaS | 通常试用 / 促销 | 常规 Lite 约 $23/mo | Plus 约 $43/mo | 年付约 10% 折扣 | 重财务工具价格高，不适合 P0 正面对打 |
| HoneyBook | Clientflow / CRM | 通常试用 | $36/mo 月付；$29/mo 年付 | $59/mo；$49/mo 年付 | proposals、contracts、payments、automation | 面向成熟 creative business，价格远高于单工具 |
| ChatGPT / Claude | 通用替代 | 有免费或低价使用路径 | $20/mo 左右常见 | 更高团队价 | 用户需自己写 prompt | 最大替代品；FreelancerReply 必须靠专用 UX 和安全输出取胜 |
| 免费模板博客：Bonsai / FreeAgent / ChaserHQ 等 | SEO 模板 / 内容 | 免费 | N/A | N/A | 用户自己复制改写 | 说明单封邮件内容本身很难收费 |

### 竞品锚点结论

- **免费 generator 很多**：P0 硬付费墙不合理。
- **轻 invoice reminder SaaS 起价约 $12/mo**：FreelancerReply 如果只做邮件生成，首个 Pro 不宜高于 $12/mo。
- **完整 freelancer SaaS 起价约 $15–36/mo**：这是未来上限锚点，不是 P0 价格锚点。
- **真正可收费的是自动化 / 保存 / 品牌语气 / 多场景矩阵**，不是单封 email。

---

## 成本模型

### 单次生成成本假设

P0 每次生成：

- 3 个 email versions：
  - Gentle Reminder；
  - Firm Reminder；
  - Final Notice。
- 3 个 short DM / SMS versions。
- JSON 输出。
- 不保存用户输入。
- 不发送邮件。

### AI 成本估算

使用 PRD 推荐的 **GPT-4.1 mini 级别**。

公开价格锚点：

| 模型 | Input | Output | 状态 |
|---|---:|---:|---|
| GPT-4.1 mini | $0.40 / 1M tokens | $1.60 / 1M tokens | [事实 / 需上线前复核] |

### Token 假设

| 项目 | Token |
|---|---:|
| System prompt + guardrails + form input | 1,500 input tokens |
| 3 emails + 3 short messages + JSON | 1,300 output tokens |
| 基础 AI 成本 | $0.00268 / 次 |
| 乘以 1.5 安全系数 | $0.00402 / 次 |
| 加 analytics / DB 粗略成本 | $0.00403 / 次 |

> [估算] 单次生成成本暂按 **$0.004 / generation** 记账。  
> 当前定价可以作为草案，但上线支付配置前必须用真实 token 日志复核。

### 成本表

| 成本项 | 单次成本 | 说明 | 状态 |
|---|---:|---|---|
| AI API | $0.00268 | 1,500 input + 1,300 output tokens，GPT-4.1 mini 价格 | [估算] |
| AI 安全系数后 | $0.00402 | 包含 prompt 增长、失败重试、偶发更长输出 | [估算] |
| Analytics / DB | $0.00001 | 事件写入、匿名 usage 记录，P0 可忽略但保守计入 | [估算] |
| 托管 | 近似 $0 | Cloudflare Pages / Workers 免费额度内 | [估算] |
| 存储 | 近似 $0 | P0 不保存生成输入，仅 waitlist | [估算] |
| 带宽 | 近似 $0 | 文本工具，带宽很低 | [估算] |
| 支付手续费 | 月付约 2.9% + $0.30 | Stripe 类卡支付费用 | [估算 / 需按支付地区确认] |

### 免费用户成本边界

按 **$0.00403 / 次生成** 计算：

| 免费额度 | 单用户每日成本 | 单用户 30 天极限成本 |
|---:|---:|---:|
| 3 次 / 日 | $0.0121 | $0.36 |
| 5 次 / 日 | $0.0201 | $0.60 |
| 10 次 / 日 | $0.0403 | $1.21 |

账房判断：

- 3 次 / 日：安全。
- 5 次 / 日：可以 Beta 测试，但需要 Turnstile / IP 限流。
- 10 次 / 日：对免费层偏高，不建议 P0 默认开放。

---

## Free 层设计

## P0 Beta Free

| 项目 | 建议 |
|---|---|
| 价格 | $0 |
| 是否登录 | 不登录 |
| 每日额度 | **3 次 / IP / session / day** |
| 单次输出 | Gentle + Firm + Final Notice，各含 email + short DM |
| 可用功能 | Generate、Copy、Regenerate、Tone change |
| 不开放 | 保存客户、历史记录、brand voice、自动提醒、导出 sequence |
| 数据保存 | 默认不保存 generator 输入 |
| Waitlist | 结果页后展示 |
| 防滥用 | IP hash、session id、Turnstile、速率限制、异常 UA 拦截 |

### 为什么不是 5 次免费？

- [判断] 首版用户主要任务是解决当前一笔逾期发票。
- 一次生成已经给 3 个版本，3 次生成等于 9 封邮件版本 + 9 条短消息。
- 3 次足够体验价值。
- 如果免费给 5–10 次，用户可以把工具当通用免费 AI email writer 用，转化会弱。

### 推荐免费层文案

```text
Free beta: generate up to 3 late payment reminder sets per day.
Each set includes Gentle, Firm, and Final Notice versions.
```

不要写：

```text
Unlimited AI email generation
```

---

## Pro 层设计

## P1 Pro Solo

| 项目 | 建议 |
|---|---|
| 月付价格 | **$9/mo** |
| 年付价格 | **$90/year** |
| 年付折扣 | 约 16.7%，即 2 个月免费 |
| 目标用户 | 成熟 solo freelancer |
| 月生成额度 | **300 generations / month** |
| 日软限制 | 30 generations / day |
| 单次输出 | 3 email versions + 3 short messages |
| 核心权益 | saved client snippets、brand voice、sequence export、多工具矩阵 |
| 不承诺 | 自动发送邮件、法律建议、保证收款 |
| 超额处理 | 软提示升级 / 等下月，不建议 P1 做 usage overage billing |

### Pro Solo 成本毛利

按 $9/mo、300 次生成计算：

| 项目 | 金额 |
|---|---:|
| 月收入 | $9.00 |
| 估算 Stripe 手续费 | $0.561 |
| 到账净额 | $8.439 |
| 300 次 AI 变量成本 | $1.209 |
| 毛利 | $7.230 |
| 毛利率 | 约 80.3% |
| 盈亏平衡生成次数 | 约 2,094 次 / 月 |

账房判断：

- 300 次 / 月很安全。
- 即使放到 500 次 / 月，毛利率仍约 71.4%。
- 但不建议写无限，因为用户可能把它当通用 email generator 刷。

---

## 可选 P1 / P2 Pro Plus

| 项目 | 建议 |
|---|---|
| 月付价格 | **$19/mo** |
| 年付价格 | **$190/year** |
| 年付折扣 | 约 16.7%，即 2 个月免费 |
| 目标用户 | solo agency / 小工作室 |
| 月生成额度 | **1,500 generations / month** |
| 日软限制 | 100 generations / day |
| 核心权益 | 更多 client snippets、更多品牌语气、更多工具页、priority generation |
| 团队功能 | P2 再做，不在 P1 承诺 |
| 自动发送 | 不建议早期承诺 |

### Pro Plus 成本毛利

按 $19/mo、1,500 次生成计算：

| 项目 | 金额 |
|---|---:|
| 月收入 | $19.00 |
| 估算 Stripe 手续费 | $0.851 |
| 到账净额 | $18.149 |
| 1,500 次 AI 变量成本 | $6.045 |
| 毛利 | $12.104 |
| 毛利率 | 约 63.7% |
| 盈亏平衡生成次数 | 约 4,503 次 / 月 |

账房判断：

- 1,500 次 / 月仍可接受。
- 但若用户真每天高频生成，说明产品已经接近 team / agency use case，应转 Business，而不是继续放宽个人套餐。

---

## 年付折扣

推荐统一：

| 套餐 | 月付 | 年付 | 折扣 |
|---|---:|---:|---:|
| Pro Solo | $9/mo | $90/year | 2 个月免费，约 16.7% |
| Pro Plus | $19/mo | $190/year | 2 个月免费，约 16.7% |

不建议首版做 50% 年付折扣。

原因：

- [事实] Taskade 年付省 50%，但它是成熟 workspace，不是单工具 MVP。
- [判断] FreelancerReply 还没有验证 retention，年付大折扣会提前锁定低 ARPU。
- [风险] 早期产品方向可能变化，年付用户权益会拖累迭代。

---

## Lifetime 判断

## 是否建议 Lifetime

**不建议 P0 / P1 上 Lifetime。**

### 原因

| 风险 | 说明 |
|---|---|
| AI 成本持续存在 | Lifetime 收一次钱，API 成本长期发生 |
| 产品形态未定 | 当前还没验证是单工具、矩阵、还是轻 SaaS |
| 用户使用频率未知 | 重度 freelancer / agency 可能长期高频使用 |
| 权益难收回 | Lifetime 用户对后续功能有预期，容易产生支持成本 |
| 单工具价值弱 | 太低亏，太高卖不动 |

### 如果必须测试 Lifetime

只建议作为 **限量 Early Supporter**，且权益严格限制：

| 项目 | 建议 |
|---|---|
| 价格 | **$99–149 one-time** |
| 名额 | 前 50–100 个 |
| 月生成额度 | 500 generations / month |
| 不含 | 自动发送邮件、团队、API、无限历史、法律模板库 |
| 条款 | Lifetime 指当前个人版功能，不保证所有未来团队 / 自动化功能 |
| 风控 | 保留 fair use 与滥用封禁权 |

账房建议：

> 当前不要做 Lifetime。  
> 如果老板强行要做，最低也不要低于 $99，并且必须写明额度边界。

---

## 用量上限设计

### P0 Free

| 限制项 | 建议 |
|---|---:|
| 每 IP 每日生成 | 3 次 |
| 每 session 每小时 | 3 次 |
| 单次最大 client name | 80 chars |
| 单次最大 project type | 120 chars |
| payment link | 只允许 URL 格式，不抓取 |
| invoice amount | 文本展示，不计算、不验证真实付款 |
| regenerate | 计入额度 |
| Final Notice | 可用，但加强 disclaimer |
| CAPTCHA / Turnstile | 第 2 或第 3 次触发 |

### P1 Pro Solo

| 限制项 | 建议 |
|---|---:|
| 月生成 | 300 次 |
| 日软限制 | 30 次 |
| 保存 client snippets | 25 个 |
| brand voice profiles | 3 个 |
| export sequence | 100 次 / 月 |
| 工具页 | late payment + proposal follow-up + scope creep 等 P1 工具 |
| 自动发送 | 不包含 |

### P1 / P2 Pro Plus

| 限制项 | 建议 |
|---|---:|
| 月生成 | 1,500 次 |
| 日软限制 | 100 次 |
| 保存 client snippets | 200 个 |
| brand voice profiles | 10 个 |
| export sequence | 500 次 / 月 |
| seat | 1–3 seats，超过走 Business waitlist |
| 自动发送 | 单独验证，不默认含 |

### Fair Use 规则

建议文案：

```text
Usage limits reset monthly. FreelancerReply is designed for human freelancer client communication, not automated bulk generation, scraping, resale, or spam. We may temporarily limit accounts that show abusive or automated usage patterns.
```

---

## 支付配置建议

## P0

**不接 Stripe。**

P0 只做：

- Free beta；
- waitlist；
- pro feature click tracking；
- pricing interest survey；
- 可选 fake checkout click，但不要假装已可购买。

### P0 页面可以展示

```text
FreelancerReply is free while in beta.
Want saved clients, brand voice, and reminder sequences?
Join the Pro waitlist.
```

## P1 Stripe 配置

### Products / Prices

| Stripe Product | Price | Billing | Lookup key |
|---|---:|---|---|
| FreelancerReply Pro Solo Monthly | $9 | monthly | `pro_solo_monthly` |
| FreelancerReply Pro Solo Annual | $90 | yearly | `pro_solo_annual` |
| FreelancerReply Pro Plus Monthly | $19 | monthly | `pro_plus_monthly` |
| FreelancerReply Pro Plus Annual | $190 | yearly | `pro_plus_annual` |

### 后端 entitlement 字段

```json
{
  "plan": "free | pro_solo | pro_plus | business",
  "billingStatus": "none | trialing | active | past_due | canceled",
  "billingInterval": "monthly | yearly | none",
  "monthlyGenerationLimit": 3,
  "dailyGenerationLimit": 3,
  "savedClientLimit": 0,
  "brandVoiceLimit": 0,
  "sequenceExportLimit": 0,
  "allowedTools": [
    "late_payment_reminder"
  ],
  "canSaveClients": false,
  "canUseBrandVoice": false,
  "canExportSequence": false,
  "canUseAutomaticReminders": false,
  "fairUseFlag": false,
  "currentPeriodStart": "timestamp",
  "currentPeriodEnd": "timestamp"
}
```

### 推荐 entitlement 矩阵

| 字段 | Free | Pro Solo | Pro Plus |
|---|---:|---:|---:|
| monthlyGenerationLimit | 90 近似，实际按日 3 次 | 300 | 1,500 |
| dailyGenerationLimit | 3 | 30 | 100 |
| savedClientLimit | 0 | 25 | 200 |
| brandVoiceLimit | 0 | 3 | 10 |
| sequenceExportLimit | 0 | 100 | 500 |
| allowedTools | 1 个 | P1 多工具 | P1 / P2 多工具 |
| automatic reminders | false | false | false / waitlist |
| team seats | 0 | 1 | 1–3 |

### 退款规则提示

建议：

- 月付：不主动承诺无条件退款，但可写 **7-day refund window for accidental purchases**。
- 年付：可写 **refund within 7 days if unused or lightly used**。
- 已大量使用 AI 额度后不建议全额退款。
- 必须和合规 Agent 对齐当地消费者保护、税务、订阅取消规则。

### 税务 / Checkout

后端交接给支付实现：

- Stripe Checkout；
- Stripe Customer Portal；
- Stripe Tax 是否开启需用户确认；
- 收集 billing email；
- Webhook 至少处理：
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.paid`
- 不要把 Stripe 状态只存在前端。
- entitlement 必须以后端 webhook 为准。

---

## 上线后验证指标

## P0：免费 Beta 验证

| 指标 | 建议判断线 | 说明 |
|---|---:|---|
| `generator_started / page_view` | > 15% | 页面意图是否匹配 |
| `generator_completed / started` | > 70% | 表单和生成链路是否顺畅 |
| `copy_clicked / completed` | > 30% | 输出是否真的有用 |
| `regenerate_clicked / completed` | < 25% | 太高说明首次输出不稳定 |
| `waitlist_clicked / completed` | > 8% | Pro 兴趣是否存在 |
| `waitlist_submitted / completed` | > 3% | 用户是否愿意留下邮箱 |
| `pro_feature_clicked / completed` | > 8% | saved clients / brand voice / schedule 是否值得做 |
| `error_shown / started` | < 5% | 技术稳定性 |
| `abuse_blocked / total_requests` | 持续监控 | 免费层是否被刷 |
| `copy_clicked by tone` | 观察 | 哪种 tone 最有价值 |

### 付费假门指标

结果页建议放 4 个 Pro 功能按钮：

1. Save this client
2. Schedule automatic reminders
3. Export email sequence
4. Use my brand voice

记录：

| 事件 | 用途 |
|---|---|
| `pro_feature_clicked` | 总体付费兴趣 |
| `pro_feature_clicked.feature_name` | 哪个功能最强 |
| `waitlist_modal_opened` | 假门是否有效 |
| `waitlist_submitted` | 真实意向 |
| `pricing_interest_selected` | 可选收集 $7 / $9 / $12 / $19 价格敏感度 |

### 什么时候可以做 P1 付费

建议同时满足：

- 至少 1,000 个有效工具页访问；
- `generator_completed / started > 70%`；
- `copy_clicked / completed > 30%`；
- `pro_feature_clicked / completed > 8%`；
- `waitlist_submitted / completed > 3%`；
- 至少 50–100 个 waitlist email；
- AI 成本日志确认单次生成成本没有超过 $0.01。

否则：

> 不要急着接 Stripe。先修输出质量、页面定位或付费点。

---

## 毛利与风险

### 最低可接受毛利

| 阶段 | 最低毛利建议 |
|---|---:|
| P0 Free Beta | 不看毛利，看成本上限 |
| P1 Pro Solo | ≥ 70% |
| P1 / P2 Pro Plus | ≥ 60% |
| 长期成熟 SaaS | ≥ 75% 更健康 |

### 主要风险

| 风险 | 等级 | 说明 | 建议 |
|---|---|---|---|
| 单工具付费弱 | P1 | 用户可能只需要一次催款邮件 | 先 waitlist，不急付费 |
| ChatGPT 替代强 | P1 | 用户可自行 prompt | 强化 freelancer-specific、copy-ready、safe tone |
| 免费层被刷 | P1 | AI 成本虽低，但无限会亏 | 每日 3 次 + Turnstile + IP hash |
| 输出普通 | P1 | 生成像模板，用户不复制 | 做 20–50 条样例评测 |
| 法律语气风险 | P1 | final notice、late fee、collections 易出问题 | 默认不提法律、不提 late fee，免责声明 |
| Pro 权益不足 | P2 | 只多给次数不够付费 | Pro 必须有 saved clients / brand voice / sequence export |
| 过早做自动发送 | P1 | Gmail OAuth、deliverability、合规复杂 | P2 前不要做 |
| Lifetime 亏损 | P1 | 长期 AI 成本 + 支持成本 | P0 / P1 禁止 Lifetime |

---

## 推荐套餐矩阵

| Plan | Price | Best for | Usage | Included | Not included |
|---|---:|---|---:|---|---|
| Free Beta | $0 | 临时需要写一封催款邮件的 freelancer | 3 generations/day | Late payment generator、3 versions、copy、short DM | saved clients、brand voice、history、automatic send |
| Pro Solo | $9/mo 或 $90/year | 成熟 solo freelancer | 300 generations/month，30/day | 多工具、saved snippets、brand voice、sequence export | team、automatic reminders、invoice system |
| Pro Plus | $19/mo 或 $190/year | solo agency / 小工作室 | 1,500 generations/month，100/day | 更多 snippets、更多 brand voice、多工具、更高导出额度 | 大团队、API、自动催收、法律流程 |
| Business Waitlist | Contact | agency / team | 定制 | seats、workflow、可能自动提醒 | P1 不承诺 |

---

## 待验证信息

- [待验证] 实际 AI token 用量：需要上线日志记录 input/output tokens。
- [待验证] GPT-4.1 mini 实际供应商价格，上线前复核。
- [待验证] Stripe 实际手续费、税务、可用国家。
- [待验证] 用户是否会为 saved clients / brand voice / sequence export 付费。
- [待验证] `copy_clicked / completed` 是否超过 30%。
- [待验证] `waitlist_submitted / completed` 是否超过 3%。
- [待验证] 竞品价格上线前再扫一遍。
- [待验证] 是否真的需要 Pro Plus；首版可以只放 Pro Solo waitlist。
- [需用户确认] 是否 P0 完全不接支付。
- [需用户确认] 首版是否采用 Stripe 作为未来支付方案。

---

## 给村长的建议

**建议：带风险继续。**

执行顺序建议：

1. P0 不接支付。
2. 上 Free Beta。
3. 每日 3 次免费生成。
4. 结果页放 Pro 假门。
5. 记录 copy、waitlist、pro feature click。
6. 达到验证线后，再做 Pro Solo $9/mo。
7. 不要首版做 Lifetime。
8. 不要写 unlimited。
9. 不要做自动发送邮件。
10. 不要把单工具包装成完整 SaaS。

---

## Gate Recommendation

**WARN**

## Reason

给 WARN，不给 PASS 的原因：

- 成本模型可控，但仍是估算，未接真实 token 日志。
- 竞品中免费工具很多，首版直接收费转化风险高。
- 单工具付费弱，Pro 权益必须依赖后续 saved clients、brand voice、多工具矩阵。
- 当前最该验证的是使用行为和付费兴趣，不是马上上线支付。

最后账房话：

> 这个站可以继续做。  
> 但现在不是收钱阶段，是验证阶段。  
> 免费可以给，但必须限额；Pro 可以设计，但先用假门测；Lifetime 先别碰。

---

## 定价与商业模型校准交接摘要

### 当前结论

- 状态：**DONE / NEEDS_REVIEW**
- 一句话结论：首版免费 Beta 限流验证，P1 再推 $9/mo Pro Solo；P0 不接支付、不做 Lifetime。

### 关键输入

- 项目：FreelancerReply
- 当前阶段：03-pricing
- 上游资料：
  - `/Users/hzh/projects/freelancer-reply/docs/opportunity-analysis.md`
  - `/Users/hzh/projects/freelancer-reply/docs/product-definition-prd.md`

### 本阶段交付物

- 竞品定价表
- 成本模型
- 收费模型
- Free 层设计
- Pro 价格
- 用量上限
- 年付折扣
- Lifetime 判断
- 支付配置建议
- 上线后验证指标

### 质量门槛自检

- [x] 价格有竞品锚点和成本依据
- [x] 免费额度能体验价值但不亏穿
- [x] 没有无约束 unlimited
- [x] CTA 与 P0 waitlist / P1 Stripe 路径一致
- [x] 明确待验证成本与竞品价格

### 风险

- P0：不要首版接支付并承诺 Pro 已可用。
- P1：免费层必须限流，否则 API 成本可被刷。
- P1：单工具付费弱，必须先验证 Pro 假门点击和 waitlist。
- P2：自动发送邮件、Gmail OAuth、invoice/CRM 不进入 P0。

### 给下游的最小必要信息

- 下一阶段：文案、设计、后端 entitlement、Analytics、QA。
- 必须读取：本定价报告、PRD、合规建议。
- 不能假设：不能写 unlimited AI usage；不能假装 P0 有支付；不能承诺自动发送邮件。

[DONE]
