# 智策羊产品定义与 PRD

> 项目：FreelancerReply  
> 阶段：产品定义与 PRD  
> 输入报告：`/Users/hzh/projects/freelancer-reply/docs/opportunity-analysis.md`  
> 输出 Agent：智策羊 Agent  
> 状态：WARN / PASS TO MVP

---

## 结论

**WARN / PASS TO MVP**

可以进入 MVP 产品定义与后续文案、设计、开发阶段，但有硬边界：

> 第一版只做一个核心工具页：**Late Payment Reminder Email Generator for Freelancers**。  
> 不做完整 SaaS、不做登录、不做自动发送、不做发票系统、不做 CRM。

理由：

- [事实] 上游机会报告已明确推荐首版切口：`Late Payment Reminder Email Generator for Freelancers`。
- [事实] SERP 实扫可见搜索结果中同时存在 AI generator 工具页、模板 / 博客页、发票 / AR SaaS 引流页。
- [观察] 竞品多是泛 `payment reminder` 或发票 SaaS 引流，真正“只服务 freelancer 的尴尬客户沟通”定位还可以更聚焦。
- [风险] 搜索量未在本阶段验证，付费意愿也未验证；因此 Gate 给 **WARN / PASS TO MVP**，不是无条件 PASS。

---

## 产品概述

- 产品名称：**FreelancerReply**
- 主关键词：
  - 首页：`freelance email generator`
  - 首个工具页：`late payment reminder email generator`
- 目标市场：英文市场自由职业者
- 站点类型：**工具站 + 内容型 SEO 辅助页**
- 一句话定位：

> **FreelancerReply helps freelancers write awkward client emails — starting with polite late payment reminders that protect the relationship and help them get paid.**

中文解释：

> FreelancerReply 是一个面向英文自由职业者的客户沟通邮件生成器。首版先解决最痛、最尴尬、最容易搜索的问题：如何礼貌、专业、不伤关系地催逾期发票付款。

---

## SERP 搜索意图分析

### 核心查询 1：`late payment reminder email generator`

**搜索意图：工具型 + 即时解决**

用户不是想读长文，而是想马上得到一封能复制的邮件。

- [观察] SERP 中出现 Taskade、Eonebill、Invoicer.ai、CanYouPayThat、River、Landolio、Fastbooks 等工具页。
- [观察] 页面标题普遍包含 `Payment Reminder Generator`、`Invoice Reminder Email Generator`、`Late-Payment Reminder`。
- [观察] 工具页通常提供：invoice details 输入、overdue days / due date、tone 选择、generated email、copy button、FAQ、引流到自动提醒 / 发票 / AR 产品。

**用户任务：**

> 我现在有客户没付款，我不知道怎么开口，请直接帮我写一封合适的英文邮件。

### 核心查询 2：`freelance invoice reminder email`

**搜索意图：模板型 + 自由职业场景**

用户更关心“作为 freelancer 怎么催客户”，不是企业 AR 流程。

- [观察] Bonsai 页面直接定位为 `How to write payment reminder emails to freelance clients`。
- [观察] SERP 中也出现模板页、博客页、Reddit 讨论，说明用户会寻找 copy-paste 模板。
- [观察] Bonsai、FreeAgent 等更偏“教育用户 + 引流到财务产品”。

**用户任务：**

> 我是 freelancer，我不想显得 rude，也不想影响客户关系，但我需要把钱要回来。

### 核心查询 3：`overdue invoice reminder email`

**搜索意图：模板 / 指南型 + escalation sequence**

用户想知道不同逾期阶段应该怎么写。

- [观察] ChaserHQ、FreeAgent、LeanPay 等强调 reminder sequence。
- [观察] 常见阶段：due soon、due now、1–3 days overdue、7–14 days overdue、30+ days overdue、final notice。
- [观察] 这类页面通常较长，适合 SEO，但用户仍需要自己改写。

**用户任务：**

> 逾期几天、几周、一个月时，语气应该怎么升级？

### 搜索意图总结

| 查询类型 | 用户想完成的任务 | 内容形态 | 我们应对方式 |
|---|---|---|---|
| `late payment reminder email generator` | 立即生成可复制邮件 | 工具页 | 首版主攻 |
| `freelance invoice reminder email` | 找 freelancer 语境下的表达 | 工具 + 示例 | 强调 for freelancers |
| `overdue invoice reminder email` | 找阶段化模板 | 教程 / 模板 | 页面内提供 Gentle / Firm / Final sequence |
| `payment reminder email to client` | 泛客户催款邮件 | 模板 / SaaS | 可做 SEO 辅助，但不做首版主词 |
| `polite payment reminder email` | 不想冒犯客户 | 模板 / 工具 | 强调 relationship-safe |

---

## 用户定义

### ICP 1：新手自由职业者

- 用户：
  - [假设] 刚开始接单的 freelance designer、developer、copywriter、VA、marketer。
  - 月收入约 $500–$3k。
- 场景：
  - 客户发票逾期；
  - 不知道如何催款；
  - 害怕语气太强，影响复购或评价。
- 痛点：
  - 不知道英文商务邮件怎么写；
  - 怕显得 desperate / rude；
  - 没有自己的模板库；
  - 经常用 ChatGPT 但 prompt 不稳定。
- 当前替代方案：
  - Google 搜模板；
  - ChatGPT；
  - Bonsai / FreeAgent 博客模板；
  - Reddit 搜别人怎么写。
- 付费可能性：低到中，更适合免费工具获取流量、复制行为和 waitlist。
- 可触达性：高。可通过 Reddit、X、SEO、freelance 社群触达。

### ICP 2：成熟自由职业者

- 用户：
  - [假设] 已有稳定客户的 solo freelancer / consultant。
  - 月收入约 $3k–$15k。
- 场景：
  - 多客户同时推进；
  - invoice follow-up、proposal follow-up、scope creep response 经常发生；
  - 希望自己看起来专业、边界清楚。
- 痛点：
  - 重复写类似邮件浪费时间；
  - 想维护统一语气；
  - 客户关系有价值，不想因为催款破坏长期合作；
  - 可能想保存客户、品牌语气、自动提醒。
- 当前替代方案：
  - ChatGPT / Claude；
  - 自己维护 Google Docs / Notion 模板；
  - Bonsai / HoneyBook / FreshBooks；
  - 手写邮件。
- 付费可能性：中到高。若后续提供 saved clients、brand voice、reminder sequence、client communication toolkit，有机会付费。
- 可触达性：中。可通过内容 SEO、freelance newsletter、X、Reddit、Product Hunt 触达。

### ICP 3：小型 agency / solo agency

- 用户：
  - [假设] 2–10 人小团队、solo agency owner、boutique studio。
  - 月收入约 $5k–$30k。
- 场景：
  - 多客户、多项目、多成员；
  - 需要统一客户沟通标准；
  - 发票、催款、scope creep、handoff 都需要流程化。
- 痛点：
  - 团队沟通不一致；
  - 客户管理分散；
  - 需要自动提醒、权限、历史记录、模板库。
- 当前替代方案：
  - HoneyBook、Bonsai、FreshBooks、Wave、Stripe Invoicing；
  - Notion / Google Docs 模板；
  - CRM / PM 工具。
- 付费可能性：高。
- 可触达性：中。
- 不作为首版主力原因：
  - 需求会迅速膨胀到 CRM、团队协作、自动发送、发票系统；
  - 首版工程成本和合规风险明显上升；
  - 不适合单工具 MVP 验证。

---

## 主力用户

**选择：ICP 1 + ICP 2 的交界用户：英文市场个人自由职业者，尤其是正在遇到逾期付款问题的 freelancer。**

更具体：

> 首版优先服务：正在追一笔逾期发票、但不想显得尴尬或冒犯客户的个人 freelancer。

理由：

1. [事实] 上游报告推荐第一阶段只做 late payment reminder。
2. [观察] SERP 中已有泛工具，但 freelancer-specific 语境仍有机会。
3. [观察] 用户任务非常明确：输入 invoice 信息 → 得到可复制邮件。
4. [假设] 新手 freelancer 会带来免费使用量，成熟 freelancer 更可能转 waitlist / 付费。
5. [产品取舍] 如果优先 agency，会把 MVP 拉向 SaaS 后台、团队协作和自动化，首版失控。

---

## 竞品与替代方案

| 类型 | 名称 | 用户为什么用它 | 弱点 | 我们的机会 |
|---|---|---|---|---|
| AI 工具页 | Taskade AI Payment Reminder Email Generator | 大品牌、AI 生成、可作为泛 AI generator | 页面偏泛 business，不够 freelancer-specific；CTA 引到 Taskade 工作区 | 更聚焦 freelancer awkward client communication |
| AI 工具页 / SaaS 引流 | Eonebill Payment Reminder Generator | 表单完整，有 tone、invoice details、email preview、copy/download | 主要为 Eonebill AR / invoicing SaaS 引流；偏 business / AR | 首版不卖重 AR，只解决一封邮件 |
| AI 工具页 | Invoicer.ai Payment Reminder Generator | 有 reminder level、invoice details、copy/download、AI assistant | 偏 invoice tool 生态；语气和场景更通用 | 强调 freelancer relationship-safe、DM/SMS 多渠道 |
| AI 工具页 / SaaS 引流 | CanYouPayThat Invoice Reminder Email Generator | 一次给 Friendly / Professional / Firm 三种版本；适合自由职业者和 agency | 产品名偏 payment chasing，可能聚焦自动 reminder；已有 first 3 clients 免费 | 我们可更轻、更像 email generator 矩阵，而非 invoice reminder SaaS |
| AI 工具页 | River Late-Payment Reminder | 文案强，明确提 freelancer、Upwork、agency clients，强调不伤关系 | 需要 signup；更像 AI writing product 引流 | 我们首版可免登录、即时生成、copy-first |
| 工具页 | Landolio Payment Reminder Generator | 字段细，有 UK statutory rights、tone、payment plan、work suspension | 偏 UK 法规和商业工具；复杂选项可能吓到新手 | 首版避免法律复杂性，默认不提 late fee / legal threats |
| 工具页 | Fastbooks Payment Reminder Generator | 极简表单、邮件预览、copy | 输出较模板化，差异较弱 | 输出 3 段 sequence + short DM/SMS |
| 模板 / Blog | Bonsai | 直接服务 freelance clients，教育用户，导向 Bonsai | 用户需要自己改写；产品较重 | 把模板变成即时生成工具 |
| 模板 / Blog | FreeAgent | 提供 due soon / due now / overdue / very late 模板 | 偏 small business / accounting；不是即时生成 | 用表单自动填充并生成 tone-appropriate 邮件 |
| 模板 / Blog / AR SaaS | ChaserHQ | sequence guide 很强，SEO 内容丰富 | 面向 AR / finance team，非个人 freelancer | 做轻量 freelancer 版本，不进入 AR 复杂流程 |
| 通用替代 | ChatGPT / Claude | 免费/低成本，用户熟悉 | 需要会写 prompt；输出可能过激、啰嗦或不稳定 | 专门 UX + 安全约束 + copy-ready 输出 |
| 手动模板 | Google Docs / Notion | 可复用，完全可控 | 需要维护和改写，不适合临时紧急场景 | 用结构化输入降低改写成本 |

---

## 产品定位

- 对谁：英文市场个人自由职业者。
- 解决什么问题：帮他们在客户逾期付款时，快速生成礼貌、专业、清晰、可复制的英文催款邮件。
- 相比什么替代方案：
  - 相比 Google 模板：不用自己改写。
  - 相比 ChatGPT：不用写 prompt，输出更稳定、更安全。
  - 相比 Bonsai / FreshBooks / HoneyBook：不需要完整财务或客户管理系统。
  - 相比泛 Payment Reminder Generator：更懂 freelancer 的客户关系和尴尬语境。
- 差异化：
  1. **Freelancer-specific**：不是泛 business / AR。
  2. **Relationship-safe**：默认不激进、不乱提法律、不乱提 late fee。
  3. **Sequence-first**：一次生成 Gentle / Firm / Final Notice。
  4. **Email + Short DM/SMS**：适合 email、Upwork、Fiverr、WhatsApp、LinkedIn DM 等后续扩展。
  5. **未来可扩展成客户沟通工具矩阵**：proposal follow-up、scope creep、testimonial request 等。

---

## 功能范围

### P0：首版必须做

#### P0-1：首页 `/`

- 目标：
  - 让用户 3 秒内知道：这是 freelancer client email generator。
  - 引导进入首个核心工具页。
- 必须包含：
  - Hero；
  - 主 CTA：Generate a late payment reminder；
  - 工具矩阵预告，但首版只开放 late payment；
  - 核心场景说明；
  - 邮箱 waitlist；
  - FAQ；
  - SEO 基础内容。

#### P0-2：工具页 `/late-payment-reminder-email-generator`

- 目标：用户输入逾期发票信息，生成可复制的催款邮件。
- 表单字段控制在 6 个左右：

必填：

1. Client name
2. Invoice amount
3. Days overdue
4. Service / project type
5. Tone：Friendly / Professional / Firm / Final notice

可选 / Advanced：

6. Invoice number
7. Payment link
8. Client relationship：New client / Repeat client / Long-term client

#### P0-3：AI 生成结果

一次生成 3 个版本：

1. Gentle Reminder
2. Firm Reminder
3. Final Notice

每个版本包含：

- Subject line
- Email body
- Short DM / SMS version
- Copy button

输出约束：

- professional；
- polite；
- concise；
- clear ask；
- relationship-safe；
- freelancer-like；
- 不默认生成法律威胁；
- 不默认声称 late fee；
- 不默认说“根据合同你必须……”，除非用户明确提供合同条款；
- 不制造虚假紧急性；
- 不建议骚扰式催款。

#### P0-4：复制与反馈行为

- Copy full email
- Copy subject
- Copy short DM
- Regenerate
- Tone change
- 可选：thumbs up / thumbs down

#### P0-5：示例输入输出

页面必须展示一个完整 example：

输入：

```text
Client name: Sarah
Invoice amount: $850
Days overdue: 12
Project type: Website redesign
Tone: Professional
```

输出：

- Subject line
- Email body
- Short DM

目的：

- 支撑 SEO；
- 让用户不填表前也知道结果质量；
- 给搜索引擎可索引文本。

#### P0-6：Waitlist / 假门

在结果后展示：

> Want automatic invoice reminders?  
> Join the waitlist to save clients, schedule reminders, and send follow-ups automatically.

字段：

- email
- role：designer / developer / marketer / consultant / other
- biggest payment problem，可选

假门按钮：

- Save this client
- Schedule reminder
- Export email sequence
- Use my brand voice

点击后进入 waitlist，不实际提供功能。

#### P0-7：Analytics

必须埋点：

1. page_view
2. generator_started
3. generator_completed
4. copy_clicked
5. tone_selected
6. regenerate_clicked
7. waitlist_clicked
8. waitlist_submitted
9. pro_feature_clicked
10. error_shown

判断逻辑：

| 行为 | 解释 |
|---|---|
| 访问多但不生成 | Hero / 表单阻力 / 搜索意图错配 |
| 生成多但不复制 | 输出质量不足 |
| 复制多但不留邮箱 | 免费价值成立，付费点弱 |
| pro feature 点击多 | 自动提醒 / 保存客户值得验证 |
| Final Notice 使用多 | 用户有更严重催收场景，合规要加强 |

#### P0-8：基础风控

- IP / session 限流；
- 简单 abuse 防护；
- AI 输出 schema 校验；
- 敏感提示词过滤；
- 明确 disclaimer：不是法律建议；
- 不保存用户输入，除非用户加入 waitlist 并同意。

### P1：后续增强

P1 只在 P0 有真实使用数据后做。

1. Proposal Follow-up Email Generator：`/proposal-follow-up-email-generator`
2. Scope Creep Response Generator：`/scope-creep-response-generator`
3. Testimonial Request Email Generator：`/testimonial-request-email-generator`
4. Client Onboarding Email Generator：`/client-onboarding-email-generator`
5. Price Increase Email Generator：`/price-increase-email-generator`
6. Brand voice / preferred tone
7. Saved snippets
8. Reminder sequence export
9. Profession-specific pages

### NOT-DO：当前不做

首版坚决不做：

1. 不做用户登录。
2. 不做客户管理 CRM。
3. 不做自动发送邮件。
4. 不做 Gmail OAuth。
5. 不做 Outlook OAuth。
6. 不做 Stripe 自动收款。
7. 不做发票生成系统。
8. 不做账务 / bookkeeping。
9. 不做保存历史记录。
10. 不做团队协作。
11. 不做多语言。
12. 不做 Chrome 插件。
13. 不做 DOCX / PDF 导出。
14. 不做 late fee 自动计算。
15. 不做法律催收建议。
16. 不做 collections / small claims workflow。
17. 不做复杂后台。
18. 不做完整 freelancer client communication SaaS。
19. 不做完整 email sequence scheduler。
20. 不做任何“保证帮你收回欠款”的承诺。

---

## 首页 IA

### 1. Hero

目标：3 秒内说明“给谁 + 解决什么 + 立刻可用”。

- H1：`Freelance Email Generator`
- Subheadline：`Write awkward client emails without sounding awkward.`
- 辅助说明：`Generate polite late payment reminders, proposal follow-ups, and client replies for freelancers.`
- Primary CTA：`Generate a late payment reminder`
- Secondary CTA：`See examples`

首屏不要堆所有功能。首屏只推第一个工具。

### 2. Tool Entry

首页内嵌一个轻量工具入口卡片：

- `Late Payment Reminder Email Generator`
- 字段简化：Client name / Amount / Days overdue / Tone
- CTA：`Generate reminder`

点击后跳转工具页，并带 query params 或预填状态。

### 3. Problem

标题：

> Chasing late payments feels awkward — especially when you want to keep the client.

要讲三个问题：

- You did the work, but the invoice is overdue.
- You do not want to sound rude or desperate.
- Generic templates do not fit your client relationship.

### 4. Benefits

1. Sound professional, not pushy.
2. Get a clear subject line and email body.
3. Choose the right tone for the overdue stage.
4. Copy an email or short DM in seconds.

### 5. How It Works

1. Enter invoice details.
2. Choose tone.
3. Get Gentle / Firm / Final versions.
4. Copy and send from your own inbox.

强调：

> Nothing is sent automatically.

### 6. Use Cases

首版首页只开放第一个，其余显示 waitlist / coming soon。

- Late payment reminders — available now
- Proposal follow-ups — coming soon
- Scope creep responses — coming soon
- Testimonial requests — coming soon
- Price increase emails — coming soon

### 7. Example Output

展示一封短的、专业的生成结果。

目的：增强信任、让用户看到输出质量、支撑 SEO。

### 8. Pricing Preview / Waitlist

首版可以写：

> Free while in beta.

然后加：

> Want saved clients, brand voice, and automatic reminder sequences? Join the waitlist.

不要首屏强调付费，避免削弱免费工具转化。

### 9. FAQ

首页 FAQ 建议：

1. Is FreelancerReply free?
2. Does it send emails automatically?
3. Can I use it for Upwork or Fiverr clients?
4. Is this legal advice?
5. What client emails will be supported next?
6. Do you store my invoice or client details?

### 10. Final CTA

标题：

> Stop rewriting the same awkward email.

CTA：

> Generate a late payment reminder

---

## 工具页 IA

URL：

```text
/late-payment-reminder-email-generator
```

页面结构：

1. Hero
   - H1：`Late Payment Reminder Email Generator for Freelancers`
   - Subtitle：`Generate polite overdue invoice reminders that help you get paid without damaging the client relationship.`
2. Generator Form
3. Generated Results
   - Gentle Reminder
   - Firm Reminder
   - Final Notice
   - Short DM / SMS
4. Example
5. When to Send Each Reminder
6. Tips for Freelancer Payment Reminders
7. FAQ
8. Related Tools / Coming Soon
9. Final CTA / Waitlist

---

## SEO 页面矩阵

### 主页面

| 页面 | URL | Index | 主关键词 | 用户任务 | CTA |
|---|---|---:|---|---|---|
| 首页 | `/` | index | `freelance email generator` | 找 freelancer 客户邮件生成工具 | Generate late payment reminder |
| Late Payment 工具页 | `/late-payment-reminder-email-generator` | index | `late payment reminder email generator` | 生成逾期发票催款邮件 | Generate email |

### 长尾页面：P0 可准备内容，P1 再扩展

| 页面 | URL | Index | 主关键词 | 用户任务 | CTA |
|---|---|---:|---|---|---|
| Freelance invoice reminder | `/freelance-invoice-reminder-email` | index / P1 | `freelance invoice reminder email` | 找 freelancer 催款邮件模板 | Use generator |
| Overdue invoice reminder | `/overdue-invoice-reminder-email` | index / P1 | `overdue invoice reminder email` | 找逾期发票邮件写法 | Generate reminder |
| Polite payment reminder | `/polite-payment-reminder-email` | index / P1 | `polite payment reminder email` | 想礼貌催款 | Generate polite reminder |
| Payment reminder to client | `/payment-reminder-email-to-client` | index / P1 | `payment reminder email to client` | 给客户写付款提醒 | Generate email |
| Final payment reminder | `/final-payment-reminder-email` | index / P1 | `final payment reminder email` | 写最后通知 | Generate final notice |

### 职业长尾页面：P1 / P2

| 页面 | URL | Index | 主关键词 | 用户任务 | CTA |
|---|---|---:|---|---|---|
| Designer reminder | `/freelance-designer-payment-reminder-email` | index / P1 | `freelance designer payment reminder email` | 设计师催客户付款 | Generate designer reminder |
| Developer reminder | `/freelance-developer-payment-reminder-email` | index / P1 | `freelance developer payment reminder email` | 开发者催款 | Generate developer reminder |
| Copywriter reminder | `/copywriter-payment-reminder-email` | index / P1 | `copywriter payment reminder email` | 文案自由职业者催款 | Generate reminder |
| Consultant reminder | `/consultant-payment-reminder-email` | index / P1 | `consultant payment reminder email` | 顾问催款 | Generate reminder |
| Social media manager reminder | `/social-media-manager-payment-reminder-email` | index / P2 | `social media manager payment reminder email` | 社媒经理催款 | Generate reminder |

### 对比页面：P2，不进首版

| 页面 | URL | Index | 目标关键词 | 说明 |
|---|---|---:|---|---|
| FreelancerReply vs ChatGPT | `/freelancerreply-vs-chatgpt` | index / P2 | `chatgpt payment reminder email` | 对比专用工具与通用 AI |
| FreelancerReply vs Bonsai templates | `/freelancerreply-vs-bonsai-payment-reminder-templates` | index / P2 | `bonsai payment reminder email` | 谨慎做，避免侵权和攻击性 |
| FreelancerReply vs invoice software | `/freelancerreply-vs-invoice-software` | index / P2 | `invoice reminder software for freelancers` | 强调轻量替代 |

### 教程页面：P1

| 页面 | URL | Index | 主关键词 | 用户任务 |
|---|---|---:|---|---|
| How to remind a client to pay | `/how-to-remind-a-client-to-pay-an-invoice` | index | `how to remind a client to pay an invoice` | 学催款步骤 |
| When to send payment reminders | `/when-to-send-payment-reminders` | index | `when to send payment reminder` | 判断时间点 |
| How to ask for payment politely | `/how-to-ask-for-payment-politely` | index | `how to ask for payment politely` | 学语气 |
| What to do if client ignores invoice | `/client-ignores-payment-reminder` | index | `client ignoring invoice reminder` | 了解下一步，但避免法律建议 |

### 模板页面：P1

| 页面 | URL | Index | 主关键词 | 用户任务 |
|---|---|---:|---|---|
| Payment reminder email templates | `/payment-reminder-email-templates` | index | `payment reminder email templates` | 复制模板 |
| First payment reminder template | `/first-payment-reminder-email-template` | index | `first payment reminder email template` | 写第一封提醒 |
| Second payment reminder template | `/second-payment-reminder-email-template` | index | `second payment reminder email template` | 写第二封提醒 |
| Final notice template | `/final-payment-reminder-email-template` | index | `final payment reminder email template` | 写最后提醒 |

---

## Route Contract

| Route | Page Type | Index | Keyword | CTA | Schema | Data Needed |
|---|---|---:|---|---|---|---|
| `/` | Homepage | index | `freelance email generator` | Generate reminder | WebSite, SoftwareApplication, FAQPage | 工具列表、示例输出、FAQ |
| `/late-payment-reminder-email-generator` | Tool Page | index | `late payment reminder email generator` | Generate email / Copy | SoftwareApplication, FAQPage, HowTo | 表单字段、AI prompt、示例、FAQ |
| `/api/generate-payment-reminder` | API | noindex | N/A | N/A | N/A | 输入校验、AI 调用、限流 |
| `/api/waitlist` | API | noindex | N/A | N/A | N/A | email、role、problem |
| `/privacy` | Legal | index | `privacy policy` | N/A | WebPage | 数据处理说明 |
| `/terms` | Legal | index | `terms of use` | N/A | WebPage | 使用限制、免责声明 |
| `/robots.txt` | SEO infra | noindex | N/A | N/A | N/A | sitemap 路径 |
| `/sitemap.xml` | SEO infra | noindex | N/A | N/A | N/A | indexable routes |

---

## Data / Material Inventory

| Item | Source | Owner | Freshness | Risk | Required For |
|---|---|---|---|---|---|
| 表单字段定义 | PRD | 产品 | 稳定 | 低 | 工具页 |
| AI prompt / system guardrails | 产品 + 工程 | 产品 / 后端 | 需迭代 | 中 | 生成 API |
| 示例输入输出 | 产品 / 文案 | 文案 | 稳定 | 中 | SEO、首页、工具页 |
| FAQ | SERP + 产品 | 文案 | 需复核 | 中 | SEO |
| Waitlist 文案 | 产品 / 文案 | 文案 | 稳定 | 低 | 转化 |
| Analytics event taxonomy | PRD | 产品 / 工程 | 稳定 | 低 | 数据验证 |
| Legal disclaimer | 护村羊 | 合规 | 必须复核 | 中 | footer、工具页 |
| Privacy policy | 护村羊 | 合规 | 必须复核 | 中 | 上线 |
| Competitor references | SERP 实扫 | 产品 | 会变化 | 低 | 定位、SEO |
| Pricing hypothesis | 产品假设 | 钱袋羊 | 待验证 | 中 | 定价页 / waitlist |

---

## 定价草案

> 注意：这是产品阶段的**定价假设草案**，不是最终定价。需要钱袋羊 Agent 根据 AI 成本、转化预期、竞品价格和支付方案复核。

### 首版建议

**Beta 阶段：免费。**

原因：

- [观察] SERP 中大量竞品工具免费。
- [事实] 上游报告判断单工具付费弱。
- [产品判断] 当前首要目标不是收入，而是验证是否有人生成、复制、留邮箱、点击 pro feature。

### 假门收费点

结果页展示 Pro waitlist：

> Want to save clients, schedule reminders, and use your own brand voice?

可测试的付费兴趣按钮：

1. Save this client
2. Schedule automatic reminders
3. Export email sequence
4. Use my brand voice
5. Generate client-specific follow-up plan

### 未来定价假设

#### Free

- $0
- 每天 3–5 次生成
- Late Payment Reminder 工具
- Copy email / DM
- 不保存历史
- 不登录

适合新手 freelancer 和 SEO 免费流量。

风险：AI 成本被滥用；生成多但不转化。

需要：限流、CAPTCHA 或 Turnstile、异常检测。

#### Pro Solo

- 建议价格：**$7–$9 / month**
- 功能：
  - 更多生成次数；
  - 保存常用 client snippets；
  - brand voice；
  - reminder sequence export；
  - 多个 client communication tools；
  - 无明显水印 / 更好体验。

适合成熟个人 freelancer。

#### Pro Plus / Studio

- 建议价格：**$15–$19 / month**
- 功能：
  - 更多模板；
  - 多项目语境；
  - client notes；
  - advanced tone；
  - reusable templates；
  - maybe team later，但不要首版承诺。

适合 solo agency / small studio。

### 不建议首版做的定价

- 不建议一开始做 annual plan。
- 不建议做 usage-based billing。
- 不建议做复杂 credit 包。
- 不建议承诺自动发送邮件。
- 不建议和 invoice SaaS 正面价格竞争。

---

## 产品验收标准

### 用户任务验收

用户从搜索进入工具页后，应在 60 秒内完成：

1. 理解这是 freelancer 逾期催款邮件工具；
2. 填写 4–6 个字段；
3. 获得 3 个可用版本；
4. 复制至少一个版本；
5. 可选择加入 waitlist。

### P0 成功标准

| 指标 | 初步判断线 | 解释 |
|---|---:|---|
| generator_started / page_view | > 15% | 页面意图匹配 |
| generator_completed / started | > 70% | 表单和生成流程可用 |
| copy_clicked / completed | > 30% | 输出有实际价值 |
| waitlist_submitted / completed | > 3% | 有后续产品兴趣 |
| pro_feature_clicked / completed | > 8% | 可验证付费方向 |

这些阈值是 [假设]，需要实际流量校准。

---

## 给下游 Agent 的交接

### 给钱袋羊 Agent

- 成本相关功能：
  - AI 生成，每次输出 3 个 email versions + 3 个 short DM versions。
  - 需要限流，避免免费工具被刷。
  - 需要估算每次生成 token 成本。
- 可能收费点：
  - saved clients；
  - automatic reminders；
  - brand voice；
  - export sequence；
  - more freelancer email tools。
- 免费层风险：
  - SERP 竞品免费，首版不适合硬付费墙。
  - 若无限免费，AI API 成本不可控。
  - 建议：免费 daily quota + waitlist 假门。
- 定价草案：
  - Beta：Free
  - Pro Solo：$7–$9/mo
  - Pro Plus：$15–$19/mo
- 需要复核：
  - AI 单次生成成本；
  - 免费额度；
  - 是否需要登录后付费；
  - Stripe 是否进入 P1。

### 给护村羊 Agent

- 数据处理：
  - 用户输入可能包含 client name、invoice amount、invoice number、payment link。
  - 这些可能是商业敏感信息。
- 第三方服务：
  - AI API：OpenAI / 其他模型供应商。
  - Analytics。
  - Waitlist 邮箱存储服务。
- AI / 上传 / 支付风险：
  - 不上传文件。
  - 不自动发送邮件。
  - 不处理真实付款。
  - 不接 Stripe 首版。
- 必须加的边界：
  - “This is not legal advice.”
  - “We do not send emails automatically.”
  - “Do not include sensitive financial or legal information.”
  - “Mention late fees only if your contract allows them.”
- 输出风险：
  - 避免法律威胁；
  - 避免虚假承诺；
  - 避免骚扰式催款；
  - 避免具体法律建议。
- 隐私建议：
  - 默认不保存 generator 输入。
  - Waitlist 单独请求同意。
  - Privacy policy 明确 AI provider 数据处理。

### 给妙笔羊 Agent

- 主力用户：英文市场个人 freelancer，正在追一笔逾期发票，但害怕显得 rude。
- 核心痛点：
  - “I need to ask for money without damaging the client relationship.”
  - “I know what I want to say, but not how to say it professionally.”
- 核心卖点：
  - Write awkward client emails without sounding awkward.
  - Generate polite overdue invoice reminders in seconds.
  - Get Gentle, Firm, and Final Notice versions.
  - Copy email or short DM.
- 禁止夸大的点：
  - 不说 guaranteed to get paid。
  - 不说 legally compliant。
  - 不说 replaces a lawyer。
  - 不说 automates collection。
  - 不说 sends emails for you。
- 语气：
  - 清楚、专业、轻量、有同理心；
  - 不要 enterprise SaaS 味太重；
  - 不要恐吓用户；
  - 不要过度 AI buzzword。

### 给美设羊 Agent

- 目标气质：
  - Clean、calm、professional、solo-friendly。
  - 像一个可靠的 freelancer 小工具，不像复杂 finance dashboard。
- 竞品视觉问题：
  - Taskade：品牌视觉强但泛 AI，工具感被平台感稀释。
  - Eonebill / Invoicer.ai：偏 invoice SaaS 引流，商业工具感强。
  - Blog 竞品：内容长，用户要找模板费力。
- 需要避免的风格：
  - 不要做成严肃催收 / debt collection 风格。
  - 不要大量红色 warning。
  - 不要 enterprise dashboard。
  - 不要复杂多栏后台。
  - 不要让用户感觉“我在启动法律流程”。
- 页面设计重点：
  - 表单和结果并列或上下清晰；
  - copy button 明显；
  - tone selector 清楚；
  - 结果卡片区分 Gentle / Firm / Final；
  - 加入安全提示：“Nothing is sent automatically.”

### 给工程羊 Agent

- 必须实现页面：
  1. `/`
  2. `/late-payment-reminder-email-generator`
  3. `/privacy`
  4. `/terms`
  5. `/robots.txt`
  6. `/sitemap.xml`

- 必须实现交互：
  - 表单输入；
  - tone selector；
  - advanced options；
  - generate；
  - loading；
  - error state；
  - generated result；
  - copy buttons；
  - regenerate；
  - waitlist modal；
  - analytics events；
  - basic rate limit。

- SEO 基础要求：
  - 每页唯一 title / description；
  - H1 唯一；
  - FAQ schema；
  - SoftwareApplication schema；
  - canonical；
  - sitemap；
  - robots；
  - index / noindex 正确；
  - 示例输出 SSR 或静态可见，不要全部客户端渲染后才出现。

- 不要实现：
  - 登录；
  - 支付；
  - 邮件发送；
  - Gmail OAuth；
  - 历史记录；
  - CRM；
  - 多工具复杂后台。

### 给云枢羊 Agent

- API 需求：
  - `POST /api/generate-payment-reminder`
  - `POST /api/waitlist`
  - optional：`POST /api/events` 如果 analytics 不走第三方直连。

Generate API 输入：

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

Generate API 输出：

```json
{
  "gentle": {
    "subject": "...",
    "emailBody": "...",
    "shortMessage": "..."
  },
  "firm": {
    "subject": "...",
    "emailBody": "...",
    "shortMessage": "..."
  },
  "finalNotice": {
    "subject": "...",
    "emailBody": "...",
    "shortMessage": "..."
  },
  "disclaimer": "This is not legal advice. Review before sending."
}
```

- Auth 需求：
  - P0 不需要用户 Auth。
  - 后续 Pro / saved clients 才需要 Auth。
- 数据表需求：
  - `waitlist_subscribers`：id、email、role、biggest_payment_problem、source_page、created_at
  - `usage_events` 或接入 analytics：event_name、page、tone、anonymous_id、created_at
  - `rate_limits`：ip_hash、count、window_start
- Usage / Quota 需求：
  - P0 按 IP / session 限制。
  - 建议每日免费生成上限。
  - AI 失败需要 graceful fallback。

---

## 风险

1. [风险] 搜索量未确认，需要进一步验证关键词搜索量、KD、CPC。
2. [风险] 直接工具竞品已不少，不能只做普通 payment reminder generator。
3. [风险] ChatGPT 替代强，必须靠专门 UX、稳定输出、少输入、freelancer-specific 取胜。
4. [风险] 单工具付费弱，首版目标应是验证和获客，不是立即订阅收入。
5. [风险] Final Notice、late fee、service suspension、collection steps 都可能涉及法律或合同语境，默认不生成法律威胁。
6. [风险] AI 输出如果像普通模板，用户不会复制，需要做样例评测。
7. [风险] 首页如果定位太泛，会显得空；首页应直接推 late payment reminder。
8. [风险] MVP 容易膨胀成 SaaS，登录、保存、自动发送、客户管理、支付全部推迟。

---

## 待验证信息

1. [待验证] `freelancerreply.com` 域名最终可注册性。
2. [待验证] 主关键词搜索量：
   - `late payment reminder email generator`
   - `freelance invoice reminder email`
   - `overdue invoice reminder email`
   - `freelance email generator`
3. [待验证] SEO 难度和 Top 10 内容结构。
4. [待验证] AI 输出质量：至少 20 条测试样例，检查自然度、语气、法律风险、copy-readiness。
5. [待验证] 用户是否愿意复制生成结果。
6. [待验证] 用户是否愿意为 saved clients / automatic reminders / brand voice 留邮箱。
7. [待验证] AI API 单次生成成本。
8. [待验证] Waitlist 文案与假门点击率。
9. [需用户确认] 首版技术栈。
10. [需用户确认] 是否使用 `FreelancerReply` 作为最终品牌名。

---

## Gate Recommendation

**WARN / PASS TO MVP**

## Reason

给 **WARN / PASS TO MVP**，不是无条件 PASS，原因如下：

- [事实] 上游机会报告已经有清晰切口、首版页面、功能边界和 NOT-DO。
- [事实] SERP 实扫确认该搜索意图存在大量工具页、模板页和 SaaS 引流页，说明需求真实。
- [观察] 竞品普遍解决“生成 payment reminder email”，但多数偏泛 business / invoice SaaS，FreelancerReply 可以从 freelancer-specific、relationship-safe、sequence-first 切入。
- [风险] 竞品不少，单工具付费弱，搜索量未确认，AI 输出若普通则差异不足。
- [产品判断] 只要严格限制 P0 为一个工具页 + 首页 + waitlist + analytics，就可以进入 MVP；一旦加入登录、自动发送、CRM、发票或支付，MVP 会失控。

最终门禁建议：

> 可以进入下一阶段，但必须冻结首版范围：  
> **只做 Late Payment Reminder Email Generator for Freelancers。**

[DONE]
