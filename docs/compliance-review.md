# 护村羊合规审查报告

> 范围：基于 PRD `/Users/hzh/projects/freelancer-reply/docs/product-definition-prd.md`。
> 性质：产品层面的合规与风险审查，不是正式法律意见。
> 关键原则：以下内容只按 PRD 已描述行为起草；未确认事项均标为 `[待确认] / [需用户确认]`，不编造第三方、存储地区、保留期限、退款政策或法律结论。

---

## 结论

**WARN / PASS TO MVP**

可以进入 MVP，但必须严格冻结首版范围：

- 只做 `Late Payment Reminder Email Generator for Freelancers`
- 不登录
- 不自动发送邮件
- 不做 CRM
- 不做发票系统
- 不做支付
- 不保存 generator 输入，除非用户加入 waitlist 并同意
- AI 输出必须带免责声明和安全约束

如果后续加入登录、保存客户、自动提醒、品牌语气、订阅、Stripe、邮件发送、发票或催收流程，合规等级和法律页面都要重新审查。

---

## 风险等级

- 等级：**中风险**
- 理由：
  - [事实] 产品会让用户输入 `client name`、`invoice amount`、`days overdue`、`project type`、可选 `invoice number`、`payment link`、`client relationship`。
  - [事实] 产品会调用 AI 生成催款邮件、Final Notice 和 Short DM / SMS。
  - [事实] PRD 明确有 waitlist，收集 email、role、biggest payment problem。
  - [事实] PRD 明确需要 analytics 埋点。
  - [事实] PRD 明确不做登录、不上传文件、不自动发送邮件、不接 Stripe、不保存历史记录、不做法律催收建议。
  - [风险] 催款、Final Notice、late fee、合同义务、service suspension、collections 等语境可能接近法律/合同边界，必须限制输出。
  - [风险] 用户输入可能包含商业敏感信息、客户姓名、发票金额、发票编号和支付链接。
  - [风险] AI 输出可能不准确、过激、涉及法律威胁或误导用户。

不是低风险，因为涉及 AI 生成、用户业务数据、waitlist 邮箱、analytics 和第三方 API。
不是高风险，前提是 P0 严格不做法律建议、催收流程、自动发送、支付、CRM、发票系统、身份验证或高权益自动化决策。

---

## 产品行为摘要

- 是否注册：**否** `[事实]`
- 是否登录：**否** `[事实]`
- 是否上传文件：**否** `[事实]`
- 是否存储用户输入：Generator 输入默认不保存；waitlist 信息会保存 `[产品声明]`
- 是否调用 AI API：**是**，AI API 为 OpenAI / 其他模型供应商 `[产品声明][待确认]`
- 是否生成内容：**是**，生成催款邮件、Subject line、Email body、Short DM / SMS `[事实]`
- 是否处理支付：P0 不处理支付，不接 Stripe `[事实]`
- 是否订阅：P0 无订阅；未来可能有 Pro Solo / Pro Plus `[产品假设][待确认]`
- 是否自动续费：P0 无 `[事实]`
- 是否使用分析工具：**是**，PRD 要求埋点，但具体工具未确认 `[事实][待确认]`
- 是否发送邮件：产品不自动发送邮件；用户自行复制后发送 `[事实]`
- 是否使用邮件通知：未说明 `[待确认]`
- 是否使用 Cookie：如 analytics / session / rate limit 使用 cookie 或 localStorage，则需要披露 `[待确认]`
- 是否限流：需要 IP / session 限流 `[产品声明]`
- 是否有 abuse 防护：需要简单 abuse 防护、敏感提示词过滤 `[产品声明]`

---

## 数据流

| 阶段 | 数据 | 处理方 | 用途 | 是否存储 | 保存时间 | 状态 |
|---|---|---|---|---|---|---|
| 用户输入 | Client name、invoice amount、days overdue、project type、tone | 用户 / FreelancerReply 前端 | 生成催款邮件 | 默认不保存 | 不保存 `[产品声明]`，实际实现待验证 | `[事实][待验证]` |
| 用户输入，可选 | Invoice number、payment link、client relationship | 用户 / FreelancerReply 前端 | 提高生成结果相关性 | 默认不保存 | 不保存 `[产品声明]`，实际实现待验证 | `[事实][待验证]` |
| AI 生成请求 | 用户填写的表单字段、系统 prompt、输出约束 | FreelancerReply 后端 / AI Provider | 生成邮件、subject、short DM | 站点默认不保存；AI provider 是否保留待确认 | AI provider 政策 `[待确认]` | `[产品声明][待确认]` |
| AI 生成结果 | Gentle / Firm / Final Notice、subject、body、short message | FreelancerReply / 用户浏览器 | 展示、复制、重新生成 | 默认不保存 | 页面会话内展示；是否落日志待确认 | `[事实][待验证]` |
| Waitlist | email、role、biggest payment problem、source page、created_at | FreelancerReply / waitlist 存储服务 | 产品验证、后续联系 | 是 | `[待确认]` | `[事实][待确认]` |
| Analytics | page_view、generator_started、generator_completed、copy_clicked、tone_selected、regenerate_clicked、waitlist_clicked、waitlist_submitted、pro_feature_clicked、error_shown | Analytics 工具 / FreelancerReply | 产品分析、转化分析 | 是或由第三方保存 | `[待确认]` | `[事实][待确认]` |
| Rate limit | IP / session、ip_hash、count、window_start | FreelancerReply 后端 / rate limit 存储 | 防刷、控制 AI 成本 | 是，可能短期保存 | `[待确认]` | `[产品声明][待确认]` |
| 日志 | IP、请求时间、错误、User-Agent、API 错误信息 | Hosting / backend / error logging | 安全、排障、滥用检测 | 可能保存 | `[待确认]` | `[待确认]` |
| Cookie / localStorage | session id、anonymous id、analytics cookie、consent 状态 | 浏览器 / Analytics 工具 | 会话、分析、限流、偏好 | 可能保存 | `[待确认]` | `[待确认]` |
| 支付系统 | 无 P0 支付数据 | 无 | 无 | 否 | 不适用 | `[事实]` |
| 邮件发送 | 用户复制内容后自行发送 | 用户自己的邮箱 / DM 平台 | 用户自行联系客户 | FreelancerReply 不发送 | 不适用 | `[事实]` |

---

## 数据处理表

| 数据类别 | 示例 | 来源 | 用途 | 是否敏感 | 是否发送第三方 | 是否保存 | 用户控制 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 客户信息 | Client name、client relationship | 用户输入 | 生成更自然的邮件 | 中等，可能是商业关系信息 | 是，发送给 AI Provider `[待确认具体供应商]` | 默认不保存 | 用户可不填或删除页面内容 | `[事实][待确认]` |
| 发票信息 | Amount、invoice number、days overdue、payment link | 用户输入 | 生成催款上下文 | 中等，可能是商业敏感信息 | 是，发送给 AI Provider `[待确认]` | 默认不保存 | 用户可避免输入真实编号 / 链接 | `[事实][待确认]` |
| 项目信息 | Service / project type | 用户输入 | 生成邮件内容 | 低到中 | 是，发送给 AI Provider `[待确认]` | 默认不保存 | 用户可概括填写 | `[事实][待确认]` |
| 生成内容 | Subject、email body、DM/SMS | AI 输出 | 展示、复制 | 取决于用户输入 | 由 AI Provider 生成 | 默认不保存 | 用户审阅后自行使用 | `[事实][待确认]` |
| Waitlist 邮箱 | email | 用户提交 | 等待名单、产品通知 | 个人数据 | 可能发送给 waitlist / email 服务 `[待确认]` | 是 | 需要退订 / 删除联系方式 | `[事实][待确认]` |
| Waitlist 画像 | role、biggest payment problem | 用户提交 | 用户研究、产品验证 | 低到中 | 可能发送给 waitlist / analytics 服务 `[待确认]` | 是 | 需提供删除请求渠道 | `[事实][待确认]` |
| Analytics 事件 | copy_clicked、tone_selected、pro_feature_clicked | 自动收集 | 产品分析 | 低到中 | 是，如果使用第三方 analytics | 是或第三方保存 | Cookie/analytics 披露；opt-out 待确认 | `[事实][待确认]` |
| 技术日志 | IP、User-Agent、错误日志 | 自动收集 | 安全、防刷、排障 | 个人数据 / 设备数据 | 可能由 hosting / logging provider 处理 | 可能保存 | 删除请求机制待确认 | `[待确认]` |
| Rate limit 数据 | IP hash、session id、count | 自动收集 | 防滥用、成本控制 | 个人数据或准个人数据 | 可能由 Redis / edge provider 处理 `[待确认]` | 是，短期 | 保留期限待确认 | `[产品声明][待确认]` |
| 支付数据 | 卡号、账单地址、交易记录 | 无 P0 | 无 | 高 | 无 P0 | 无 P0 | 不适用 | `[事实]` |

---

## 第三方服务清单

| 服务 | 用途 | 处理的数据 | 是否必须披露 | 状态 |
|---|---|---|---|---|
| AI Provider：OpenAI / 其他模型供应商 | 生成催款邮件、subject、short DM | 用户输入的表单字段、prompt、可能的上下文、生成结果 | 是，Privacy / Terms / AI Disclaimer 必须披露 | `[产品声明][待确认具体供应商]` |
| Analytics 工具 | page_view、生成、复制、语气选择、waitlist、pro feature 点击等事件分析 | 匿名 ID、事件、页面、设备/IP 可能被收集 | 是，Privacy / Cookie Policy 必须披露 | `[事实需要 analytics][待确认具体工具]` |
| Waitlist 存储服务 | 保存 email、role、problem | 邮箱、职业角色、痛点文本、来源页面 | 是，Privacy 必须披露 | `[事实有 waitlist][待确认具体服务]` |
| Hosting / CDN | 托管网站、处理请求 | IP、User-Agent、请求日志、错误日志 | 是，Privacy 中建议披露 | `[待确认]` |
| Backend / Database | API、waitlist、rate limit、events | 表单请求、waitlist、rate limit、日志 | 是 | `[待确认]` |
| Rate limit / Abuse 防护服务 | IP/session 限流、bot 防护 | IP、session、请求频率、可能的设备信息 | 是 | `[产品声明][待确认具体服务]` |
| CAPTCHA / Turnstile | 防刷和滥用 | IP、浏览器信息、挑战结果 | 如果使用则必须披露 | `[待确认]` |
| Email service | waitlist 确认或通知 | email、邮件发送状态 | 如果使用则必须披露 | `[待确认]` |
| Payment provider | P0 不使用 | 无 | P0 不需要；未来接入必须披露 | `[事实：P0 不接 Stripe]` |

---

## 必需法律页面

### Privacy Policy

- 需要程度：**必须**
- 建议路由：`/privacy`
- 理由：有用户输入、AI API、waitlist 邮箱、analytics、IP / session 限流和日志。
- 必须覆盖：
  - Generator 输入默认不保存 `[产品声明，需实现验证]`
  - 输入会发送给 AI Provider `[待确认供应商]`
  - Waitlist 数据会保存
  - Analytics 和 cookies / localStorage
  - 日志、IP、限流
  - 用户删除 / 联系渠道
  - 保留期限 `[待确认]`
  - 第三方服务清单 `[待确认具体服务]`

### Terms of Service

- 需要程度：**必须**
- 建议路由：`/terms`
- 理由：AI 生成内容、用户可能把生成邮件用于真实客户沟通、催款内容接近合同 / 法律边界。
- 必须覆盖：
  - 不是法律建议
  - 不保证收回欠款
  - 用户负责审阅和发送
  - 不得用于骚扰、威胁、欺诈、违法催收
  - 用户不得输入不必要的敏感信息
  - 服务可能出错或不可用
  - AI 输出不保证准确、合法、适合具体合同或司法辖区

### Cookie Policy

- 需要程度：**建议独立页面，至少 Privacy 内必须有 Cookie section**
- 建议路由：`/cookies`
- 理由：PRD 明确需要 analytics；可能使用 session、anonymous id、rate limit、cookie consent。

### Refund Policy

- 需要程度：**P0 可简版说明“当前无付费服务”；未来付费前必须更新**
- 建议路由：`/refund`
- P0 建议：当前 beta 免费，不收款，因此没有退款；未来引入付费前更新政策。

### Disclaimer

- 需要程度：**必须**
- 位置：工具页结果区、FAQ、Terms，或独立 `/disclaimer`
- 必须写：
  - This is not legal advice.
  - Review before sending.
  - Do not rely on generated emails as legal, financial, accounting, or debt collection advice.
  - Mention late fees, suspension, or legal action only if you have verified your contract and applicable rules.

### AI Content Policy

- 需要程度：**建议必须**
- 位置：可以并入 Terms，也可独立 `/ai-content-policy`
- 必须覆盖：AI 输出可能不准确、用户负责审核、禁止生成骚扰/威胁/欺诈/违法催收内容、不保证原创性/适用性/合法性/收款结果。

### Acceptable Use Policy

- 需要程度：**建议并入 Terms**
- 理由：虽不上传文件、不公开 UGC，但用户输入和 AI 输出可能被用于不当催收、骚扰、欺诈。

---

## 支付与订阅检查

- 是否订阅：P0 否 `[事实]`
- 是否一次性付费：P0 否 `[事实]`
- 是否自动续费：P0 否 `[事实]`
- 是否提供退款：P0 不适用 `[事实]`
- 是否允许取消：P0 不适用 `[事实]`
- 是否处理发票：P0 否 `[事实]`
- 是否使用 Stripe：P0 否 `[事实]`
- 是否有未来收费假设：是，Pro Solo `$7–$9/mo`，Pro Plus `$15–$19/mo` `[产品假设][待确认]`

### 页面中必须明确说明

- “Free while in beta” 不等于永久免费。
- 不得写 “free forever”，除非真实承诺。
- 如果展示未来 Pro 功能，只能说 waitlist / coming soon / interest check。
- 假门按钮如 `Save this client`、`Schedule reminder`、`Export email sequence`、`Use my brand voice` 必须清楚说明当前未开放，点击后是加入 waitlist，不是立即可用功能。
- 在真正接入支付前，必须补 Payment provider、billing entity、price、renewal cycle、auto-renewal notice、cancellation path、refund eligibility、tax / invoice handling、account deletion 后订阅和数据如何处理。

---

## AI 内容安全检查

### AI 生成内容类型

- Gentle Reminder email
- Firm Reminder email
- Final Notice email
- Subject line
- Short DM / SMS version

### 是否可能出错

**是。** 风险包括：输出事实错误、语气过强、生成法律威胁、暗示合同义务、暗示 late fee、暗示用户有权暂停服务、生成不适合某司法辖区的催款表述、让用户误以为是法律建议。

### 是否可能涉及版权

风险较低到中。生成的是通用商务邮件，不属于高版权风险内容生成，但不能承诺 “copyright-free” 或 “commercially safe”。

### 是否允许商用

可以建议用户在自行审阅、修改并承担责任后用于自己的客户沟通；不应承诺 “safe for commercial use” 或 “legally compliant”。

### 用户责任

用户必须审阅和修改 AI 输出，确认发票、金额、日期、合同条款准确，只在有依据时提 late fee、合同条款、暂停服务或法律行动，自行从自己的邮箱 / DM 工具发送，不把输出用于骚扰、威胁、欺诈或违法催收，不输入不必要的敏感财务、法律或个人信息。

### 平台责任边界

平台应明确：不提供法律、财务、会计、债务催收或专业建议；不自动发送邮件；不代表用户联系客户；不保证用户能收回欠款；不保证输出准确、完整、合法、适合特定司法辖区或合同；不保证 AI 输出不会与其他文本相似。

### 必须加入的免责声明

建议在工具结果区显示短版：

> This email is AI-generated and may not fit your specific contract, client relationship, or local rules. It is not legal, financial, accounting, or debt collection advice. Review and edit before sending. Mention late fees, suspension, or legal action only if you have verified that you are allowed to do so.

---

## 文案禁区

以下表述不得在页面、SEO title、FAQ、CTA、结果页、广告或社媒中使用，除非有充分依据：

- `100% accurate`
- `guaranteed to get paid`
- `guaranteed payment`
- `legally compliant`
- `legally safe`
- `legal advice`
- `replaces a lawyer`
- `debt collection advice`
- `automated collections`
- `automates collection`
- `sends emails for you`
- `copyright-free`
- `commercially safe`
- `plagiarism-free`
- `official`
- `certified`
- `unlimited without limits`
- `free forever`
- `no data collected`，除非完全属实
- `anonymous`，如果使用 analytics、IP 日志、waitlist 或 rate limit
- `secure`，除非有明确安全措施说明
- `we do not store anything`，除非 logs、analytics、waitlist、AI provider retention 都已验证

### 推荐替代表述

- “Generate a draft you can review and edit.”
- “Nothing is sent automatically.”
- “Use your own judgment before sending.”
- “Not legal advice.”
- “Designed to sound professional and relationship-aware.”
- “Free while in beta.”
- “We do not save generator inputs by default.” 仅在实现验证后使用。
- “Avoid entering sensitive financial, legal, or personal information.”

---

## 上线前合规 Checklist

- [ ] `/privacy` 已上线且 footer 可访问
- [ ] `/terms` 已上线且 footer 可访问
- [ ] `/cookies` 已上线，或 Privacy 中有明确 Cookie / Analytics section
- [ ] `/refund` 已上线，或 Terms 中说明 P0 无付费无退款
- [ ] 工具页结果区有 AI / non-legal-advice disclaimer
- [ ] FAQ 中回答 “Is this legal advice?”，答案明确为 No
- [ ] FAQ 中回答 “Do you store my invoice or client details?”
- [ ] Generator 输入默认不入库已由工程验证
- [ ] AI 请求日志不保存完整用户输入，或已明确披露 `[待确认]`
- [ ] AI Provider 数据处理和保留政策已确认
- [ ] Analytics 工具已确认并披露
- [ ] Waitlist 存储服务已确认并披露
- [ ] Hosting / CDN / logging provider 已确认并披露
- [ ] IP / session 限流数据保留期限已确认
- [ ] 用户可联系删除 waitlist 数据
- [ ] 有真实 contact email / support URL `[待确认]`
- [ ] 不出现 “guaranteed to get paid”
- [ ] 不出现 “legal advice / legally compliant / legally safe”
- [ ] 不出现 “copyright-free / commercially safe”
- [ ] 不出现 “free forever”
- [ ] 假门功能明确标注 waitlist / coming soon
- [ ] 不自动发送邮件
- [ ] 不做 Gmail / Outlook OAuth
- [ ] 不做 Stripe / payment
- [ ] 不做发票生成或账务建议
- [ ] 不默认生成 late fee、合同义务、法律威胁或催收建议
- [ ] Final Notice 输出经过安全规则测试
- [ ] 至少 20 条 AI 测试样例完成风险评估 `[PRD 已列待验证]`
- [ ] robots / sitemap / canonical 已配置
- [ ] legal routes 不 404
- [ ] Cookie consent 是否需要已按目标市场和工具确认 `[待确认]`

---

## 风险

### [privacy-risk]

- 用户可能输入客户姓名、发票金额、发票编号、支付链接。
- 即使不保存，也会发送给 AI Provider。
- Analytics 和 logs 可能收集 IP、设备、事件。
- Waitlist 明确保存 email 和问题描述。

### [ai-content-risk]

- Final Notice 可能被用户视为法律催收文本。
- AI 可能生成过激、错误、虚假或不适合具体合同的内容。
- 不能承诺结果准确、合法、能收回欠款。

### [compliance-risk]

- Privacy Policy 必须匹配实际数据流，尤其是 AI Provider、analytics、waitlist、logs、rate limit。
- 如果实现中实际保存了 generator 输入，但页面说不保存，会形成重大隐患。
- 假门功能必须避免误导。

### [payment-risk]

- P0 无支付，风险低。
- 未来 Pro / subscription 前必须重审 Refund、Terms、Privacy、billing UX、cancellation UX。
- 不能提前写不存在的 Stripe、订阅、退款规则。

### [content-safety-risk]

- 不得生成骚扰、威胁、诈骗、冒充、歧视、非法催收内容。
- 不得默认建议 late fee、service suspension、small claims、collections、legal escalation。
- 用户必须自行审核。

---

## 待验证信息

- [待确认] 最终品牌名是否为 `FreelancerReply`
- [待确认] 运营主体 / 公司名称
- [待确认] 联系邮箱或 support URL
- [待确认] 目标市场是否仅英文市场，是否主要面向 US / UK / EU / 全球
- [待确认] AI Provider：OpenAI 还是其他模型供应商
- [待确认] AI Provider 是否保留输入 / 输出、保留多久、是否用于训练
- [待确认] Analytics 工具：GA4、Plausible、PostHog、Vercel Analytics、Umami、其他
- [待确认] Waitlist 存储：数据库、Airtable、ConvertKit、Beehiiv、Resend、Loops、Supabase、其他
- [待确认] Hosting / CDN：Vercel、Cloudflare、Netlify、其他
- [待确认] 是否使用 CAPTCHA / Turnstile
- [待确认] 是否使用 error tracking，如 Sentry
- [待确认] 是否使用 cookie consent banner
- [待确认] generator 输入是否真的完全不入库
- [待确认] 后端日志是否包含完整 request body
- [待确认] AI 请求是否记录 prompt / response
- [待确认] rate limit 数据保存多久
- [待确认] waitlist 数据保存多久
- [待确认] 用户如何删除 waitlist 数据
- [待确认] 是否会发送 waitlist 邮件
- [待确认] 邮件服务商
- [待确认] 是否存在 affiliate、ads、retargeting pixel
- [待确认] 未来是否会接入 Stripe / Paddle / Lemon Squeezy
- [待确认] 是否需要 GDPR / UK GDPR / CCPA 特定条款，取决于目标市场和流量来源

---

# Privacy Policy 草稿

> 路由建议：`/privacy`
> 状态：MVP 草稿。上线前必须替换 `[待确认]` 占位符，并按实际第三方服务复核。

## Privacy Policy

Last updated: `[待确认]`

FreelancerReply (`“we,” “us,” or “our”`) provides an AI-assisted email drafting tool for freelancers. This Privacy Policy explains what information we collect, how we use it, and what choices you have.

This policy applies to `FreelancerReply` and the website located at `[DOMAIN 待确认]`.

## 1. Information We Collect

### Information you enter into the generator

When you use the late payment reminder email generator, you may enter information such as:

- Client name
- Invoice amount
- Days overdue
- Service or project type
- Tone preference
- Invoice number, if provided
- Payment link, if provided
- Client relationship, if provided

You should avoid entering sensitive financial, legal, personal, or confidential information that is not necessary to generate an email draft.

`[产品声明]` We do not intend to store generator inputs by default.
`[待确认]` This must be verified against the actual implementation, server logs, AI logs, and analytics setup.

### Waitlist information

If you join the waitlist, we may collect:

- Email address
- Role, such as designer, developer, marketer, consultant, or other
- Your biggest payment problem, if you choose to provide it
- Source page and submission time

We use this information to understand product interest and contact you about FreelancerReply.

### Usage and analytics information

We may collect usage events such as:

- Page views
- Generator started
- Generator completed
- Copy clicked
- Tone selected
- Regenerate clicked
- Waitlist clicked
- Waitlist submitted
- Pro feature clicked
- Error shown

Depending on the analytics tool used, this may include device information, approximate location, IP address, browser type, referring page, and anonymous identifiers.

`[待确认]` Analytics provider and exact data collected.

### Technical and security information

We may collect technical information such as:

- IP address or hashed IP
- User-Agent
- Session identifiers
- Request timestamps
- Rate limit counters
- Error logs

We use this information to protect the service, prevent abuse, troubleshoot errors, and control AI usage costs.

## 2. How We Use Information

We use information to:

- Generate AI-assisted email drafts
- Display generated results to you
- Provide copy and regenerate features
- Operate waitlist functionality
- Understand product usage
- Prevent spam, abuse, and excessive automated requests
- Improve the product
- Respond to support or deletion requests
- Maintain security and reliability

## 3. AI Processing

FreelancerReply uses an AI provider to generate email drafts.

When you submit the generator form, the information you provide may be sent to our AI provider to produce the generated email, subject line, and short message.

AI provider: `[OpenAI / other provider 待确认]`
Provider data retention: `[待确认]`
Whether provider uses data for training: `[待确认]`

Do not enter information you are not comfortable sending to an AI service.

## 4. Third-Party Services

We may use third-party services for:

- AI generation: `[待确认]`
- Analytics: `[待确认]`
- Waitlist storage: `[待确认]`
- Hosting / CDN: `[待确认]`
- Email delivery: `[待确认，如使用]`
- Abuse prevention or CAPTCHA: `[待确认，如使用]`
- Error monitoring: `[待确认，如使用]`

These providers may process information according to their own privacy policies.

## 5. Cookies and Similar Technologies

We may use cookies, localStorage, sessionStorage, or similar technologies for:

- Essential site functionality
- Session and rate limiting
- Analytics
- Remembering preferences or consent choices

`[待确认]` Specific cookies and analytics tools must be listed before launch.

For more details, see our Cookie Policy at `/cookies`, if available.

## 6. Data Retention

We keep information only as long as reasonably necessary for the purposes described in this policy.

Current retention status:

- Generator inputs: intended not to be stored by default `[待确认 implementation]`
- Generated outputs: intended not to be stored by default `[待确认 implementation]`
- Waitlist data: `[待确认]`
- Analytics data: `[待确认]`
- Technical logs: `[待确认]`
- Rate limit data: `[待确认]`

## 7. Your Choices and Rights

Depending on your location, you may have rights to:

- Access information we hold about you
- Request correction
- Request deletion
- Object to certain processing
- Opt out of certain analytics or marketing communications

To make a request, contact us at `[CONTACT_EMAIL 待确认]`.

If you joined the waitlist, you may request deletion of your waitlist information.

## 8. Children

FreelancerReply is not intended for children. We do not knowingly collect information from children under the age required by applicable law.

## 9. International Users

FreelancerReply may be accessed internationally. Your information may be processed in countries other than where you live, depending on our hosting, AI, analytics, and database providers.

`[待确认]` Hosting region and provider locations.

## 10. Changes to This Policy

We may update this Privacy Policy as the product changes. If we make material changes, we will update the “Last updated” date and, where appropriate, provide additional notice.

## 11. Contact

Contact: `[CONTACT_EMAIL 待确认]`
Website: `[DOMAIN 待确认]`

---

# Terms of Service 草稿

> 路由建议：`/terms`
> 状态：MVP 草稿。上线前必须由产品负责人确认 contact、主体、目标市场，并避免写入未实现功能。

## Terms of Service

Last updated: `[待确认]`

These Terms of Service (`“Terms”`) govern your use of FreelancerReply, an AI-assisted email drafting tool for freelancers.

By using FreelancerReply, you agree to these Terms. If you do not agree, do not use the service.

## 1. What FreelancerReply Does

FreelancerReply helps users draft client communication emails, starting with late payment reminder emails for freelancers.

The service may generate:

- Subject lines
- Email bodies
- Gentle, firm, and final reminder versions
- Short DM / SMS drafts

FreelancerReply does not send emails automatically. You are responsible for reviewing, editing, copying, and sending any message yourself.

## 2. No Legal, Financial, Accounting, or Debt Collection Advice

FreelancerReply does not provide legal, financial, accounting, tax, debt collection, or professional advice.

Generated content is a draft only. It may not fit your contract, client relationship, jurisdiction, or legal rights.

You should review and edit all generated content before using it. If you are unsure about late fees, contract rights, service suspension, collections, legal action, or disputed invoices, consult a qualified professional.

## 3. AI-Generated Content

FreelancerReply uses AI to generate drafts. AI output may be inaccurate, incomplete, inappropriate, or unsuitable for your situation.

We do not guarantee that generated content is:

- Accurate
- Complete
- Legally compliant
- Suitable for your contract
- Suitable for your jurisdiction
- Original
- Copyright-free
- Commercially safe
- Guaranteed to help you get paid

You are responsible for how you use generated content.

## 4. User Responsibilities

You agree that you will:

- Review and edit generated drafts before sending
- Verify all invoice details, dates, amounts, and contract terms
- Mention late fees only if your contract and applicable rules allow them
- Mention service suspension or legal escalation only if you have verified that you are allowed to do so
- Use your own judgment before contacting a client
- Avoid entering unnecessary sensitive information
- Comply with applicable laws and platform rules

## 5. Prohibited Uses

You may not use FreelancerReply to:

- Harass, threaten, intimidate, or abuse others
- Send misleading or fraudulent payment demands
- Impersonate another person or business
- Generate illegal debt collection messages
- Generate discriminatory, hateful, or harmful content
- Violate contracts, platform rules, or applicable laws
- Upload or enter information you do not have the right to use
- Attempt to bypass rate limits or abuse the AI service
- Scrape, reverse engineer, or overload the service

## 6. User Inputs

You are responsible for the information you enter into FreelancerReply.

Do not enter sensitive financial, legal, personal, confidential, or regulated information unless necessary and appropriate.

`[产品声明]` We do not intend to store generator inputs by default. However, inputs may be processed by our AI provider and may appear in technical systems such as server requests or logs depending on implementation. See our Privacy Policy for details.

## 7. Waitlist and Coming Soon Features

Some features may be shown as waitlist, beta, preview, or coming soon features. These may include saved clients, automatic reminders, brand voice, export, or other Pro features.

Unless explicitly stated as available, these features are not part of the current service and may never launch.

## 8. Payments

FreelancerReply is currently free while in beta and does not process payments. `[事实基于 PRD P0]`

If paid plans are introduced, we will update these Terms and any applicable Refund Policy before charging users.

Do not rely on pricing previews or waitlist prompts as a guarantee that a paid feature will be launched at a specific price or date.

## 9. Service Availability

We may modify, suspend, or discontinue the service at any time. The service may be unavailable due to maintenance, errors, AI provider issues, rate limits, or other causes.

## 10. Intellectual Property

FreelancerReply and its website, design, branding, prompts, and software are owned by us or our licensors.

You retain responsibility for the content you enter and the way you use generated drafts.

Subject to these Terms, you may use generated drafts for your own client communication after reviewing and editing them. We do not guarantee that generated drafts are original, exclusive, copyright-free, or suitable for every use.

## 11. Disclaimers

The service is provided “as is” and “as available.”

To the fullest extent permitted by law, we disclaim warranties of accuracy, reliability, availability, fitness for a particular purpose, and non-infringement.

## 12. Limitation of Liability

To the fullest extent permitted by law, FreelancerReply will not be liable for indirect, incidental, consequential, special, or punitive damages, or for lost profits, lost revenue, lost data, client disputes, failed payments, or business losses arising from your use of the service.

`[建议律师复核]` Liability wording should be reviewed if the product becomes paid or operates in specific jurisdictions.

## 13. Termination

We may restrict or block access if we believe you have violated these Terms, abused the service, or created risk for us or others.

## 14. Changes to These Terms

We may update these Terms from time to time. The updated version will be posted with a new “Last updated” date.

## 15. Contact

Contact: `[CONTACT_EMAIL 待确认]`
Website: `[DOMAIN 待确认]`

---

# Cookie Policy 草稿

> 路由建议：`/cookies`
> 状态：MVP 草稿。上线前必须填入实际 cookie、localStorage、analytics provider。

## Cookie Policy

Last updated: `[待确认]`

This Cookie Policy explains how FreelancerReply uses cookies and similar technologies.

## 1. What Are Cookies?

Cookies are small files stored on your browser or device. Similar technologies include localStorage, sessionStorage, pixels, SDKs, and anonymous identifiers.

## 2. How We May Use Cookies

We may use cookies and similar technologies for:

### Essential functionality

These are used to operate the site, maintain sessions, prevent abuse, remember consent choices, or support rate limiting.

Examples: `[待确认]`

### Analytics

We may use analytics tools to understand how visitors use FreelancerReply, such as page views, generator usage, copy clicks, tone selection, waitlist submissions, and errors.

Analytics provider: `[待确认]`

Analytics may collect information such as:

- Page URL
- Event name
- Browser and device information
- Approximate location
- Referrer
- Anonymous user or session ID
- IP address or truncated IP, depending on provider

### Rate limiting and abuse prevention

We may use cookies, session identifiers, IP-based checks, or similar technologies to prevent spam, bots, and excessive AI usage.

Provider or implementation: `[待确认]`

## 3. Cookies We Use

| Cookie / Technology | Purpose | Provider | Duration | Status |
|---|---|---|---|---|
| Essential session / rate limit identifier | Operate service and prevent abuse | `[待确认]` | `[待确认]` | `[待确认]` |
| Analytics identifier | Measure product usage | `[待确认]` | `[待确认]` | `[待确认]` |
| Consent preference | Remember cookie choices | `[待确认]` | `[待确认]` | `[待确认]` |

## 4. Your Choices

You can control cookies through your browser settings. If cookie consent controls are provided on the site, you can use them to manage non-essential cookies.

`[待确认]` Whether a cookie banner or opt-out mechanism will be implemented.

Blocking some cookies may affect site functionality, analytics accuracy, or abuse prevention.

## 5. Changes

We may update this Cookie Policy when our tools or providers change.

## 6. Contact

Contact: `[CONTACT_EMAIL 待确认]`
Website: `[DOMAIN 待确认]`

---

# Refund Policy 草稿

> 路由建议：`/refund`
> 状态：P0 简版。因为 PRD 明确 P0 不接支付，所以不能编造退款窗口。

## Refund Policy

Last updated: `[待确认]`

FreelancerReply is currently free while in beta.

At this stage:

- We do not charge users.
- We do not process payments.
- We do not offer paid subscriptions.
- We do not provide paid credits.
- We do not collect payment card information.

Because no payments are collected, refunds do not apply at this stage.

Some parts of the website may mention waitlist, beta, preview, or coming soon features. These are not paid purchases and do not create a right to access future paid features.

If FreelancerReply introduces paid plans, subscriptions, credits, trials, or one-time purchases in the future, this Refund Policy will be updated before any charges begin. The updated policy should explain:

- Price and billing cycle
- Payment provider
- Auto-renewal terms, if any
- Cancellation process
- Refund eligibility
- Refund window, if any
- Non-refundable cases, if any
- Taxes and invoices
- Contact method for billing issues

Contact: `[CONTACT_EMAIL 待确认]`

---

## 给村长的建议

建议：**带风险继续 / PASS TO MVP with WARN**

可以继续进入文案、设计、工程阶段，但必须把以下内容作为上线硬门槛：

1. Privacy / Terms 至少必须上线。
2. Cookie / Refund 可以简版，但必须匹配 P0 真实行为。
3. 工具页必须显著写明：
   - Not legal advice
   - Nothing is sent automatically
   - Review before sending
   - Do not include sensitive financial or legal information
4. 工程必须验证：
   - generator 输入默认不保存
   - logs 不意外记录完整 invoice / payment link
   - AI provider 数据处理已披露
5. 任何未来付费、登录、保存客户、自动提醒、邮件发送、发票、Stripe 都需要重新合规审查。

---

## Gate Recommendation

**WARN**

## Reason

给 WARN 的原因：

- [事实] P0 范围控制得比较好：无登录、无上传、无支付、无自动发送、无 CRM、无发票系统。
- [事实] 但产品仍涉及 AI API、用户业务信息、waitlist 邮箱、analytics 和限流日志。
- [风险] 催款邮件尤其是 Final Notice 可能接近法律 / 合同 / 催收边界，必须加免责声明和输出安全约束。
- [待确认] AI Provider、analytics、waitlist 存储、hosting、日志、保留期限、删除机制都未最终确认。
- [结论] 可以进入 MVP，但不能无条件 PASS；上线前必须补齐真实第三方清单、数据保留说明、法律页面和 AI 内容安全提示。
