# HANDOFF.md — FreelancerReply Site Design Handoff

> 输出 Agent：美设羊 Agent  
> Skill：site-design-student  
> 项目：FreelancerReply  
> 输入：`product-definition-prd.md`、`pricing-calibration-report.md`、`compliance-review.md`、`landing-page-copy.md`  
> 状态：PASS TO FRONTEND / WARN FOR LAUNCH

---

# 1. 结论

**Gate Recommendation：PASS TO FRONTEND / WARN FOR LAUNCH**

- [事实] PRD、定价、合规、定稿文案都已存在，文案状态为 `PASS TO DESIGN / WARN FOR LAUNCH`。
- [事实] P0 范围明确：免费 Beta、每日 3 次生成、无登录、无支付、不自动发送邮件、不保存历史、不做 CRM / 发票 / Gmail OAuth。
- [设计判断] 首页应做成“可信的 freelancer 小工具 + 清楚的邮件草稿工作台”，不要做成 AI SaaS 大首页，也不要做成债务催收 / 发票系统。
- [设计判断] 推荐主方向：**Calm Inbox Desk / 安静的收件箱工作台**。
- [待验证] 最终品牌名、域名、contact email、AI provider、analytics、waitlist 存储、日志策略、Cookie 策略仍需上线前确认。

---

# 2. 设计基础

- 产品名称：FreelancerReply `[待确认最终品牌名]`
- 首页主关键词：freelance email generator
- 首个工具页关键词：late payment reminder email generator
- 目标用户：English-speaking solo freelancers who need to write awkward client emails, starting with overdue invoice reminders.
- 一句话定位：FreelancerReply helps freelancers write polite, professional client emails — starting with late payment reminders they can review, edit, copy, and send themselves.
- 页面目标：让用户 3 秒内理解产品，点击并使用免费 late payment reminder generator。
- 主要转化动作：Generate a late payment reminder / Generate a free reminder。
- 次级转化动作：Join Pro waitlist。
- 关键安全边界：Nothing is sent automatically；Review and edit before sending；Not legal/financial/accounting/debt collection advice。

---

# 3. 竞品视觉分析

> 证据来源：浏览器实看 + 搜索结果摘要。以下将 `[事实]` 页面可见表现与 `[设计判断]` 分开。

| 竞品 | [事实] 视觉特点 | [事实] 页面结构 | [设计判断] 问题 | 我们如何避开 |
|---|---|---|---|---|
| CanYouPayThat — Invoice Reminder Email Generator | 黑白高对比、粗线框、brutalist 风格；表单左侧、生成结果右侧三列；按钮和卡片多为硬边框；CTA 黑底白字。 | Hero 简短；工具区首屏很强；Friendly / Professional / Firm 三张结果卡；下方黑底自动提醒 SaaS CTA；FAQ accordion；Footer legal 清楚。 | 很有记忆点，但偏“invoice reminder / 自动提醒 SaaS”；Firm 文案含 late fees / service interruptions，法律边界偏紧；黑白硬边对新手 freelancer 可能略冷。 | 不走强 brutalist；保留“表单 + 结果并列”的清晰工具结构，但改成更温和的 inbox / draft desk 视觉；Final Notice 必须显著加 review warning。 |
| Eonebill — Payment Reminder Generator | 大面积蓝色渐变 Hero；白色圆角卡片；双栏工具区：左表单、右邮件预览；蓝紫 CTA；标准 SaaS 卡片和图标。 | Hero 有 AI 输入框；Tone selector、invoice fields、email preview、Copy / Download；Cookie banner；SEO 内容、样例卡、How It Works、FAQ、工具矩阵、底部大 CTA。 | 工具体验完整，但蓝紫渐变 + 圆角卡片 + 三列 benefits 容易有通用 SaaS / AI 工具模板味；还有“Stop Chasing Payments Manually”转重 AR / automation。 | 首页不要用蓝紫渐变作为主身份；不要把产品讲成自动化收款系统；保留邮件预览可信感，但配色更克制，信息层级更 freelancer-friendly。 |
| Taskade — AI Payment Reminder Email Generator | 米色背景；居中大 Hero；机器人 emoji；巨大 Taskade agent preview；霓虹粉 CTA；大量 “AI app / agent” 标签和平台导航。 | 先引导 Start with AI；嵌入 Taskade agent preview；长内容解释；下方 AI generator 卡片矩阵。 | 品牌平台感很强，但对“我要马上写催款邮件”的用户来说任务路径被 Taskade 平台稀释；机器人 emoji 和 AI agent 话术有明显 AI 工具站味；还暗示 schedule / send。 | 不以“AI Agent”做主视觉；不出现机器人 emoji；Hero 第一屏直接给用户填表，不让平台概念压过用户任务。 |
| River — Late-Payment Reminder | 淡灰蓝背景；居中 serif 标题；青绿色小 CTA；长文章型落地页；大段正文；卡片圆角柔和。 | Hero + Write Reminder CTA；正文解释；What Makes Payment Reminders Work；What You Get；How It Works；FAQ；底部 CTA。 | 气质专业、安静，但首页工具入口不够强，正文密度高，像 blog/resource page；部分文案较强势，容易接近法律/催收建议。 | 借鉴其“calm / professional”气质和 serif 温度，但首页必须把工具入口提前到首屏；法律边界更克制，不用强压用户的催收叙事。 |
| Invoicer.ai — Payment Reminder Generator | 搜索摘要显示工具页包含评分、Generated Email、copy/download、AI Reminder Assistant、Reminder Level、Invoice Details，并强引导 Try Invoicer Free。 | 工具 + SaaS 引流；自动提醒 / invoice app CTA 明显。 | 更像 invoice SaaS 的免费引流工具；可能让用户感觉要进入发票系统，而不是轻量写邮件。 | FreelancerReply 不展示 invoice dashboard、AR pipeline、客户账龄图；只展示邮件草稿、tone、copy、quota。 |

## 竞品共同套路

- [事实] 多数竞品都把工具入口放得比较高，常见结构是：Hero → 表单/预览 → 样例/How It Works → FAQ → SaaS CTA。
- [事实] 常见 UI 是左表单、右结果预览，或三列 tone/result 卡。
- [事实] 多数页面会把免费工具导向更重的 invoice / AR / automation 产品。
- [设计判断] 这给 FreelancerReply 的机会是：**更轻、更聚焦、更像 freelancer 的写作工具，而不是收款系统。**

---

# 4. 反 AI 味约束表

| 必须避免 | 为什么危险 | 替代方案 | 前端实现说明 |
|---|---|---|---|
| 大面积紫蓝渐变 Hero | 竞品 Eonebill 已使用，且容易像通用 AI SaaS。 | 使用 warm paper / ink / muted teal 的低饱和工作台风格。 | 背景用 `#F7F3EC` / `#F5F7F6`，只在 CTA 和选中态使用 teal。 |
| 机器人、魔法棒、抽象 3D 球 | 会把产品变成“AI 玩具”，降低催款邮件场景的严肃可信度。 | 使用 inbox draft、invoice slip、tone tabs、copy button 等真实 UI 符号。 | Hero 图用生成结果 mock，不用 3D mascot。 |
| 夸张 glassmorphism / 毛玻璃 | 对自由职业者催款任务无意义，影响可读性。 | 纸张、邮件草稿、轻边框、柔和阴影。 | 卡片 `border: 1px solid #DFE5E1`，shadow 极轻。 |
| 三列完全对称 Feature 卡堆叠 | AI 模板站常见套路，信息层级弱。 | 用 bento：左侧大工具卡，右侧小 proof/boundary cards，下方 staggered benefits。 | Benefits 可 2+2 或大卡 + 小卡，不要 3 个等宽卡到底。 |
| 所有按钮一个样 | CTA 权重不清。 | Primary、Secondary、Quiet、Danger/Warning 四级。 | Primary 用 solid teal；Secondary 用 outline；legal / waitlist 用 text/ghost。 |
| 把 Pro 画成已可购买 | 合规和定价风险。 | Pricing 中明确 badge：Waitlist / Planned，不出现 checkout。 | Pro CTA 只打开 waitlist modal，不接支付。 |
| “自动提醒 / 自动发送”视觉强化 | P0 不自动发送，容易误导。 | 反复用 “Copy, review, send yourself”。 | 结果区 Copy button 明显；不要有 Send button。 |
| 红色催收 / debt collection 视觉 | 会让产品像威胁工具，降低 freelancer 信任。 | 使用 calm warning：amber note + neutral text。 | Final Notice warning 用 amber `#B7791F`，不要整块红色。 |
| 假截图 / 假用户评价 | 无证据背书会降低可信度。 | 展示真实可实现的 example input/output 和 quota。 | 不写用户数、评分、logo wall，除非后续真实获得。 |

---

# 5. 3 个设计方向

## 方向 A：Calm Inbox Desk（推荐）

- 风格关键词：warm paper、inbox draft、solo-friendly、calm professional、copy-first。
- 第一印象：这是一个安静、可信、不会替我乱发邮件的 freelancer 写作工作台。
- 适合原因：
  - [设计判断] late payment reminder 是高焦虑任务，需要降低压力而不是制造刺激。
  - [设计判断] 纸张/邮件草稿视觉能直接解释产品，不需要抽象 AI 图。
  - [设计判断] 可以把合规边界自然放进工具 UI：Nothing sent automatically、Review before sending、Not legal advice。
- 配色：warm ivory `#F7F3EC`、ink `#17211C`、muted teal `#1C8C7A`、sage `#DDE8E2`、amber `#B7791F`。
- 字体：标题用 `Fraunces` 或 `Newsreader`（柔和 editorial），正文用 `Inter` 或 `IBM Plex Sans`。
- Hero：左侧文案 + CTA，右侧 “email draft workspace” mock；工具入口紧接 Hero 或 Hero 内嵌。
- 风险：若 serif 用得过重，可能像 blog；需保证工具卡足够强。

## 方向 B：Freelancer Field Notes

- 风格关键词：notebook、margin notes、client notes、annotation、editorial utility。
- 第一印象：像自由职业者自己的客户沟通笔记本，温和、私密、可编辑。
- 适合原因：
  - [设计判断] 适合突出“review and edit before sending”。
  - [设计判断] 可用批注式 warning 处理合规，不显得恐吓。
- 配色：off-white、graph-paper blue、pencil gray、muted coral for warnings。
- 字体：`IBM Plex Sans` + `IBM Plex Mono` 小标签。
- Hero：一张带批注的邮件草稿 + 右侧 tone chips。
- 风险：如果做成过度手帐风，会降低专业感；不能太 playful。

## 方向 C：Lean Payment Studio

- 风格关键词：precise、minimal、tool-first、monochrome + teal、structured.
- 第一印象：这是一个快速、清楚、低干扰的邮件生成器。
- 适合原因：
  - [设计判断] 最利于前端快速实现和 SEO 页面扩展。
  - [设计判断] 表单、结果、Pricing 表格都很清楚。
- 配色：white、slate、light gray、teal、amber。
- 字体：`Inter` 或 `Geist Sans`，可配 `Geist Mono`。
- Hero：更工具化，首屏直接表单 + preview。
- 风险：容易接近默认 Tailwind 工具站；需要靠品牌微细节区分，如邮件纸张边缘、tone ladder、copy-first mock。

## 推荐选择

**推荐方向 A：Calm Inbox Desk。**

理由：它比方向 B 更专业，比方向 C 更有品牌气质，同时避开 Eonebill 的蓝紫 AI SaaS 和 CanYouPayThat 的强黑白催收感。

---

# 6. 首页页面结构设计

## 6.1 Header

- 布局：左 Logo；中部导航：Late Payment Reminder / Examples / Pricing / FAQ；右侧 `Pro waitlist` ghost + `Generate reminder` primary。
- 高度：72px desktop，mobile 56–64px。
- 视觉：白/ivory 半透明不需要；建议纯色 + 细 border。
- 必须避免：不要放 Sign in，因为 P0 不登录。

## 6.2 Hero

- 布局：desktop 两栏 52/48。
  - 左：eyebrow `Free beta • 3 generations/day`，H1，PAS copy 简化，subhead，CTA，安全微文案。
  - 右：Hero Image / interactive mock，展示输入字段 + 三个输出版本 tabs。
- H1：`Freelance Email Generator for Awkward Client Conversations`
- Primary CTA：`Generate a late payment reminder`
- Secondary CTA：`See example email`
- 工具入口：首屏右侧 mock 可点击；Hero 下方立即出现真实 Tool Entry 卡。
- 背景：warm paper，少量邮件纸张纹理或细网格；不要渐变球。
- 视觉重点：CTA + “Nothing is sent automatically”。

## 6.3 Tool Entry / Product Entry

- 布局：一个大卡，desktop 左表单 / 右空状态或 example output；mobile 表单在上，结果预览在下。
- 输入：Client name、Invoice amount、Days overdue、Project type、Tone。
- Tone：Segmented control，Friendly / Professional / Firm / Final Notice；Final Notice 带小 amber warning dot。
- CTA：`Generate reminder` sticky at bottom of card on mobile。
- 状态展示：
  - Empty：`Enter your invoice details to generate a reminder email you can review and copy.`
  - Loading：skeleton email lines + `Drafting your reminder…`
  - Success：tabs/cards：Gentle、Firm、Final Notice，各含 Subject / Email / Short DM。
  - Error：inline alert，不要全屏错误。
  - Quota：右上角 pill：`2 of 3 free generations left today`。
- 安全提示：表单底部小 note：`Avoid entering sensitive financial, legal, or personal information that is not needed for the draft.`

## 6.4 Problem Section

- 布局：左 H2 + 正文，右 “blank inbox / awkward follow-up” 小插图或 quote-style problem cards。
- 视觉表达：不要哭脸 emoji；用真实场景语句：`Too soft` / `Too strong` / `Blank inbox`。
- 标题：`Chasing late payments feels awkward — especially when you want to keep the client.`

## 6.5 Benefits Section

- 布局：bento 结构。
  - 大卡：`Stop rewriting the same uncomfortable email`
  - 小卡：tone match、multiple versions、copy email or short DM。
- 卡片样式：浅纸色背景、细线边框、不同尺寸但统一网格。
- 图标风格：线性小图标，避免 emoji。

## 6.6 Features Section

- 布局：两列：左“Built for freelancer client communication”，右 feature list。
- 信息层级：每个 feature 用 Feature / Advantage / Benefit 但视觉上合并成短标题 + 一行解释。
- 必须突出：`Nothing is sent automatically` 作为单独信任卡。

## 6.7 How It Works

- 布局：三步 horizontal timeline；mobile vertical。
- 步骤：Enter basics → Generate drafts → Review, edit, and send yourself。
- Safety note：放在三步后浅 amber/teal note 中。

## 6.8 Use Cases

- 布局：一张 Available Now 大卡 + 三到四张 Coming Soon 小卡。
- Available：Late Payment Reminder，CTA `Generate a late payment reminder`。
- Coming Soon：Proposal Follow-Up、Scope Creep、Testimonial Request、Price Increase。
- 必须：Coming Soon badge 显著，不能像已可用。

## 6.9 Example Output

- 布局：左 Example Input，右 Example Output。
- 视觉：像真实邮件 preview，带 subject、email body、short DM tabs。
- 目的：信任 + SEO + 预期管理。
- Disclaimer：`This is an example draft. Always check the invoice details, client context, and your own agreement before sending.`

## 6.10 Pricing / Waitlist

- 布局：三列 plan cards，但 Free Beta 要更高权重；Pro Solo / Pro Plus 灰白卡 + Waitlist badge。
- Free Beta：$0、3 generations/day、No account required；CTA `Generate a free reminder`。
- Pro Solo：$9/mo or $90/year，badge `Waitlist / planned for P1`，CTA `Join the Pro Solo waitlist`。
- Pro Plus：$19/mo or $190/year，badge `Optional P1/P2 waitlist`，CTA `Join the Pro Plus waitlist`。
- 限制说明展示方式：每张卡分 Included / Limits / Not included；不要把限制藏 tooltip。
- Safety copy：定价区底部明确：P0 不接支付，未来付费前公布 billing/refund/provider。

## 6.11 FAQ

- 布局：单列 accordion，最大宽度 760–820px。
- 默认展开前 2 个：free beta、does it send automatically。
- Legal FAQ 不隐藏：Is this legal advice? / Do you store invoice or client details? 必须可见。

## 6.12 Final CTA

- 布局：左文案，右小工具入口或 CTA stack。
- H2：`Draft the reminder today. Decide on Pro later.`
- CTA：Primary `Generate a free reminder`，Secondary `Join the Pro waitlist`。
- Safety line：`AI-generated drafts may not fit your specific contract, client relationship, or local rules. Review and edit before sending.`

## 6.13 Footer / Legal

- Footer links：Late Payment Reminder Generator、Pricing、FAQ、Privacy Policy、Terms of Service、Cookie Policy、Refund Policy、Contact `[待确认]`。
- Footer disclaimer：必须保留。
- Data microcopy：保留但不要写绝对不存储，除非工程验证。

---

# 7. 视觉规范

## 字体

- 主标题字体：`Fraunces` 或 `Newsreader`。
- 正文字体：`Inter`。
- UI / 数字 / quota：`Inter`，可选少量 `IBM Plex Mono` 用于标签。
- 选择理由：[设计判断] Serif 给“写邮件 / editorial / thoughtful”温度；Inter 保证表单与工具可读性。

## 配色 Tokens

```css
:root {
  --color-bg: #F7F3EC;
  --color-surface: #FFFEFA;
  --color-surface-muted: #F1F5F2;
  --color-ink: #17211C;
  --color-text: #2F3A35;
  --color-muted: #6E7974;
  --color-border: #DDE5DF;
  --color-primary: #1C8C7A;
  --color-primary-dark: #126B5D;
  --color-primary-soft: #DDEEEA;
  --color-accent: #C9894A;
  --color-warning: #B7791F;
  --color-warning-bg: #FFF7E6;
  --color-error: #B42318;
  --color-error-bg: #FFF1F0;
}
```

## 组件风格

- 按钮：
  - Primary：solid teal，48px height desktop，44px mobile，radius 12。
  - Secondary：ivory/white with border，same height。
  - Quiet：text + underline on hover。
  - Warning CTA：不使用红色，除非错误。
- 输入框：48px 高，radius 10，border `#DDE5DF`，focus ring teal 2px。
- 卡片：radius 18，大卡 shadow `0 18px 50px rgba(23,33,28,.08)`，小卡更轻。
- 标签：pill，radius 999，font 12–13px，Free beta 用 teal soft，Coming soon 用 muted gray，Warning 用 amber soft。
- 表格 / Pricing：卡片化，不做 dense enterprise table。
- 弹窗：waitlist modal 480–560px，标题清楚，consent microcopy 可见。
- FAQ：accordion 行高足够，触摸区至少 44px。
- Toast：右下角 desktop / bottom mobile，`Copied to clipboard.`。

## 间距与圆角

- 页面最大宽度：1180px；阅读内容最大宽度：760–820px。
- Section 间距：desktop 96–120px；mobile 56–72px。
- Grid gap：24px desktop；16px mobile。
- 卡片圆角：16–20px；输入 10–12px；按钮 12px。
- 首屏垂直 padding：96px desktop；56px mobile。

## Accessibility

- 正文最小 16px；工具输入 label 14px，但 helper text 不低于 13px。
- 对比度：Primary button 文本必须 AA；muted text 不用于关键信息。
- Focus state：所有 input、button、accordion、tabs 必须有可见 focus ring。
- Touch target：mobile 44px 以上。
- Motion：loading skeleton 不要闪烁过强；尊重 `prefers-reduced-motion`。

---

# 8. 首页页面生成 Prompt

```text
你现在执行 FreelancerReply 首页的高保真网站视觉设计生成。请输出一个可交给前端实现的 landing page 设计源，不要只给漂亮概念图。

项目：FreelancerReply
市场：英文市场 solo freelancers
主关键词：首页 freelance email generator；首个工具页 late payment reminder email generator
一句话定位：FreelancerReply helps freelancers write polite, professional client emails — starting with late payment reminders they can review, edit, copy, and send themselves.
当前阶段：P0 Free Beta；不登录、不支付、不自动发送、不保存历史、不做发票系统、不做 CRM。

设计方向：Calm Inbox Desk
视觉关键词：warm paper, calm inbox, email draft workspace, solo-friendly, professional, copy-first, relationship-aware.
必须避免：purple/blue AI gradients, robot mascot, abstract 3D blobs, glassmorphism, generic SaaS cards, debt collection red warnings, fake testimonials, checkout UI, automatic sending UI.

页面结构：
1. Header：Logo FreelancerReply；nav: Late Payment Reminder, Examples, Pricing, FAQ；右侧 Pro waitlist ghost + Generate reminder primary。不要 Sign in。
2. Hero：左侧 H1 "Freelance Email Generator for Awkward Client Conversations"；PAS copy；subhead；Primary CTA "Generate a late payment reminder"；Secondary CTA "See example email"；microcopy "Nothing is sent automatically. You stay in control of what gets sent." 右侧展示 email draft workspace mock：简化输入字段、tone chips、Gentle/Firm/Final Notice tabs、Copy buttons。
3. Tool Entry：大卡，左表单 Client name / Invoice amount / Days overdue / Project type / Tone，右侧 empty/result preview。显示 quota pill "3 free generations/day" 和安全提示 "Avoid entering sensitive financial, legal, or personal information that is not needed for the draft." CTA "Generate reminder"。
4. Problem：标题 "Chasing late payments feels awkward — especially when you want to keep the client." 讲 too soft / too strong / blank inbox。
5. Benefits：bento layout，四个 benefits，不要三张完全对称卡。
6. Features：Built for freelancer client communication, not corporate collections；包含 Nothing is sent automatically 作为信任卡。
7. How It Works：Enter basics → Generate drafts → Review, edit, and send yourself；下方 not legal advice note。
8. Use Cases：Late Payment Reminder available now；Proposal Follow-Up / Scope Creep / Testimonial Request / Price Increase coming soon，必须有 Coming Soon badge。
9. Example Output：左 example input，右 subject/email/short DM preview；带 disclaimer。
10. Pricing：Free Beta 重点卡，$0，3 generations/day；Pro Solo $9/mo or $90/year waitlist；Pro Plus $19/mo or $190/year optional P1/P2 waitlist。明确 Pro not available in current beta；无支付按钮。
11. FAQ：accordion；必须含 free、daily limit、automatic sending、legal advice、data storage、Pro availability。
12. Final CTA："Draft the reminder today. Decide on Pro later." CTA Generate a free reminder / Join Pro waitlist。
13. Footer：Privacy, Terms, Cookie Policy, Refund Policy, Contact [待确认]；footer disclaimer visible。

视觉规范：
- Background #F7F3EC，surface #FFFEFA，ink #17211C，primary teal #1C8C7A，warning amber #B7791F，border #DDE5DF。
- Header/body UI font Inter；headlines use Fraunces or Newsreader if available.
- Cards use 16-20px radius, subtle shadow, thin border.
- Buttons: primary teal solid, secondary outline, ghost text.
- Do not use large AI gradients, 3D shapes, robot emoji, fake ratings, fake logos, or "guaranteed payment" language.

关键状态必须设计：empty, loading, success, error, quota reached, sensitive input warning, final notice warning, waitlist modal, mobile layout.

Mobile：Hero order = headline, CTA, mini tool card, trust note. Tool form full-width; result tabs horizontal scroll or stacked cards; sticky bottom Generate button only while form visible. Pricing cards stack with Free Beta first.

输出要求：
- 提供 desktop 和 mobile layout说明。
- 提供 design tokens。
- 提供 component specs。
- 保留所有合规短句：Nothing is sent automatically / Review and edit before sending / This is not legal, financial, accounting, or debt collection advice / Free beta includes 3 generations per day / Pro is not available in the current beta。
- 所有未确认内容标 [待确认]，不要编造用户评价、品牌资产、真实 screenshots 或支付能力。
```

---

# 9. Logo / Hero / OG 图提示词

## Logo Prompt

```text
Create a clean wordmark logo for “FreelancerReply”, a calm AI-assisted email drafting tool for freelancers. Style: professional, warm, lightweight, trustworthy. Visual idea: a small abstract mark combining an email envelope and a reply arrow, with a subtle paper/inbox feel. Avoid robots, magic sparkles, 3D objects, aggressive payment/collection symbols, dollar signs, legal/gavel imagery, and generic AI gradient logos. Use muted ink black and teal accents. The logo should work as a horizontal header logo and as a square app icon. Minimal vector style, high legibility at small sizes, no mockup background.
```

## Hero Image Prompt

```text
Design a high-fidelity website hero illustration/mockup for “FreelancerReply”, a freelancer client email generator. Show a calm email drafting workspace on a warm paper background: a compact form with fields for Client name, Invoice amount, Days overdue, Project type, and Tone; next to it, a polished email draft preview with tabs labeled Gentle, Firm, Final Notice and visible Copy buttons. Include small trust microcopy: “Nothing is sent automatically” and “Review before sending.” Visual style: warm ivory surface, muted teal accents, thin borders, subtle paper shadows, professional and solo-friendly. Avoid blue-purple AI gradients, robot mascots, abstract 3D blobs, fake analytics dashboards, invoice accounting charts, automatic send buttons, legal threat visuals, and debt collection imagery. The image should feel like a real product UI, not a marketing illustration.
```

## OG Image Prompt

```text
Create an Open Graph image for FreelancerReply, 1200x630. Layout: warm ivory background with a simple email draft card on the right and bold headline on the left: “Freelance Email Generator for Awkward Client Conversations”. Subtext: “Draft polite late payment reminders you can review, edit, copy, and send yourself.” Add a small FreelancerReply wordmark with muted teal reply-envelope icon. Include a small pill: “Free beta • 3 generations/day”. Style: clean editorial product UI, trustworthy, calm, freelancer-friendly. Avoid fake testimonials, ratings, logos, robot icons, purple AI gradients, 3D shapes, and any suggestion that emails are sent automatically.
```

## Icon Set Prompt

```text
Create a small consistent line icon set for FreelancerReply: email draft, reply arrow, tone slider, copy button, shield/check, clock, waitlist, warning note. Style: 1.75px stroke, rounded line caps, muted ink with teal accent, no filled emoji style, no aggressive finance or legal symbols.
```

---

# 10. 关键状态设计

## Generator States

| 状态 | UI 表达 | 文案 |
|---|---|---|
| Empty | 右侧邮件纸张空态，淡线 skeleton | Enter your invoice details to generate a reminder email you can review and copy. |
| Loading | 邮件行 skeleton + small spinner，禁用 CTA | Drafting your reminder… Creating Gentle, Firm, and Final Notice versions. |
| Success | 三个 tabs/cards + copy buttons + disclaimer | Your reminder drafts are ready. Review, edit, then copy the version that fits your client relationship. |
| General Error | 表单上方 inline alert，保留输入 | Something went wrong while generating your draft. Please try again, or simplify the details you entered. |
| AI Provider Error | 右侧结果区 error card | The generator is temporarily unavailable. Please try again in a few minutes. |
| Input Too Long | 字段下方错误 + summary | Some details are too long. Please shorten the client name, project type, or optional details. |
| Sensitive Input Warning | modal or inline amber warning before generation | Avoid entering sensitive financial, legal, personal, or confidential information that is not needed for the draft. |
| Final Notice Warning | Final Notice tab top amber note | Review Final Notice wording carefully. Do not mention late fees, service suspension, collections, or legal action unless verified. |
| Quota Reached | result area card + waitlist CTA | You’ve reached today’s free beta limit. Join the Pro waitlist or come back tomorrow. |
| Copy Success | toast | Copied to clipboard. |
| Copy Error | toast + fallback | Could not copy automatically. Please select the text and copy it manually. |

## Waitlist Modal

- Title：Want higher limits and saved client tools?
- Fields：Email、role、client email struggle、pricing interest。
- Consent microcopy visible；contact email placeholder `[CONTACT_EMAIL 待确认]`。
- Success state：You’re on the waitlist.
- Error state：Could not join the waitlist.

---

# 11. 移动端建议

- Hero：单列；H1 不超过 3–4 行；CTA 紧跟 subhead；安全微文案不低于 13px。
- 工具入口：表单全宽；Tone 选择用 2x2 segmented grid；Generate button 可在表单可见时底部 sticky。
- Results：Gentle / Firm / Final Notice 使用 tabs + 当前卡片；不要三列横向压缩。
- Pricing：Free Beta 第一张；Pro cards 折叠 Included / Limits；Waitlist badge 必须显著。
- FAQ：accordion 单列；默认展开前两个。
- Footer：legal links 分组，不要太小；Contact `[待确认]` 保留。
- Cookie banner：如果启用，mobile 不应遮挡 Generate CTA；必须可关闭 / Essential only。

---

# 12. 给工程羊 Agent 的前端交付说明

## 推荐技术栈

- [假设] Next.js / React + Tailwind CSS 或 CSS Modules 均可。
- 如果使用 Tailwind：不要默认 `blue-600 + rounded-xl + shadow-lg` 全站套模板；请写 design tokens。
- SEO 内容、FAQ、Example Output 必须 SSR 或静态可见，不能全部 client-only。

## 页面优先级

1. `/late-payment-reminder-email-generator` 工具页：最高优先级。
2. `/` 首页：Hero + Tool Entry + Example + Pricing + FAQ。
3. `/privacy`、`/terms`、`/cookies`、`/refund`：上线前必须不 404。
4. `robots.txt`、`sitemap.xml`、canonical、schema。

## 组件拆分建议

- `Header`
- `HeroSection`
- `GeneratorEntryCard`
- `GeneratorForm`
- `ToneSelector`
- `QuotaPill`
- `EmailDraftPreview`
- `ResultTabs`
- `CopyButton`
- `SafetyNotice`
- `ProblemSection`
- `BenefitBento`
- `FeatureList`
- `HowItWorks`
- `UseCaseCards`
- `ExampleOutput`
- `PricingCards`
- `FAQAccordion`
- `WaitlistModal`
- `FooterLegal`
- `Toast`

## 需要重点还原的视觉

- 首屏 “Calm Inbox Desk” 气质：warm paper + real product UI mock。
- Tool Entry：这是转化核心，不能弱化成普通 CTA 卡。
- Copy button、tone selector、quota counter、disclaimer 必须清楚。
- Pricing 的 Free Beta 限制与 Pro waitlist 状态必须明显。

## 可以简化的视觉

- 背景纹理可以省略。
- Hero mock 可以先用真实组件静态化，不必做复杂插画。
- Bento 动效可以不做。
- 图标可以先用 lucide/react-icons，但保持线性一致。

## 不要牺牲的体验

- 3 秒内看懂产品。
- Generate CTA 可见。
- Mobile 表单可用。
- 结果可复制。
- Error / quota / warning 不丢失用户输入。
- Legal / privacy / terms / refund 入口清楚。
- 不出现 “Send email” 按钮或任何自动发送误导。

---

# 13. 风险

- [design-risk] 如果采用蓝紫渐变 + AI robot，页面会像通用 AI 工具站，差异化弱。
- [design-risk] 如果 Hero 只讲“freelance email generator”但不露出 late payment reminder，用户任务不够具体。
- [copy-risk] Final Notice 容易被误解为法律催收文本，必须持续提示 review / not legal advice。
- [pricing-risk] Pro 必须标 Waitlist / planned，不得像可立即购买。
- [compliance-risk] AI provider、analytics、waitlist、logs、cookie、contact email 未确认，Legal 文案上线前必须和真实实现一致。
- [frontend-risk] 如果结果区全部 client-only 渲染，会削弱 SEO example content。
- [conversion-risk] 工具入口如果低于首屏太多，用户可能只看 Hero 不行动。

---

# 14. 待验证信息

- [待确认] 最终品牌名是否为 FreelancerReply。
- [待确认] 正式域名。
- [待确认] Contact email / support URL。
- [待确认] AI Provider。
- [待确认] Analytics 工具。
- [待确认] Waitlist 存储服务。
- [待确认] Hosting / CDN。
- [待确认] 是否使用 CAPTCHA / Turnstile。
- [待确认] Generator 输入是否完全不入库。
- [待确认] 后端日志是否包含 request body。
- [待确认] Cookie consent 具体实现。
- [待确认] Pro Plus 是否需要在首页展示，或只放 Pro waitlist。

---

# 15. 交付物

- `HANDOFF.md`：完整站点设计交付，包含竞品视觉分析、反 AI 味约束表、3 个设计方向、首页页面生成 Prompt、Logo / OG / Hero 图提示词、组件规范、移动端与关键状态。
- 推荐主视觉方向：Calm Inbox Desk。
- 推荐字体策略：标题使用 Fraunces / Newsreader 等**非默认字体**，正文使用 Inter；确保 **Logo 16px 可辨识**。
- 反模板底线：坚持**非紫蓝白模板**，避免通用 AI SaaS 渐变、机器人、3D 球和默认 Tailwind 卡片堆叠。
- 覆盖范围：desktop 与 mobile 均已给出布局与状态建议。

---

# 16. 验收清单

- [x] PRD、定价、合规、文案已读取。
- [x] 竞品视觉观察已基于浏览器实看 / 搜索结果摘要标注事实与设计判断。
- [x] 至少 3 个设计方向已比较，并明确推荐方向。
- [x] 反 AI 味约束已表格化。
- [x] 首页结构覆盖 Hero、Tool Entry、Problem、Benefits、Features、How It Works、Use Cases、Example、Pricing、FAQ、Final CTA、Footer/Legal。
- [x] Pricing 明确 Free Beta、3 generations/day、Pro waitlist，不假装可购买。
- [x] Legal / Privacy / Terms / Cookie / Refund 入口已设计到 footer。
- [x] desktop 和 mobile 行为均已说明。
- [x] Empty、Loading、Success、Error、Quota、Final Notice warning、Sensitive input warning、Waitlist modal 已覆盖。
- [x] Logo / Hero / OG prompts 已提供。
- [x] 给前端的组件拆分与不可牺牲体验已说明。

---

# 17. 下游交接

## 给工程羊 Agent

- 必须读取：`/Users/hzh/projects/freelancer-reply/docs/HANDOFF.md`、`landing-page-copy.md`、`compliance-review.md`。
- 不可改动的边界：P0 不登录、不接支付、不自动发送、不做 CRM、不做发票系统、不写 unlimited / free forever / guaranteed payment。
- 最高优先级：实现可用工具入口、结果复制、限额提示、免责声明、waitlist modal、Legal footer。
- 可简化项：背景纹理、动效、复杂插图。
- 不可简化项：CTA 可见性、工具表单可用性、合规短句、Pricing 限制说明、移动端表单体验。

## 启动 Prompt

```text
你是工程羊 Agent。请基于 docs/HANDOFF.md、docs/landing-page-copy.md、docs/product-definition-prd.md、docs/compliance-review.md 实现 FreelancerReply P0 首页与 late payment reminder 工具页。严格遵守：不登录、不支付、不自动发送、不保存历史、不做 CRM / 发票系统；保留 Free Beta 3 generations/day、Nothing is sent automatically、Review and edit before sending、Not legal/financial/accounting/debt collection advice。优先实现工具可用性、SEO 可见内容、移动端体验和 legal footer。
```

---

# 18. Gate Recommendation

**PASS TO FRONTEND / WARN FOR LAUNCH**

## Reason

设计阶段可以交给前端实现，因为上游 PRD、定价、合规和文案均已具备，且页面结构、视觉方向、组件规范、状态、Prompt、Legal 入口和移动端行为都已明确。

保留 WARN 的原因不是设计本身无法推进，而是上线前仍需确认真实数据处理、AI provider、analytics、waitlist、日志、cookie、contact email、Privacy / Terms / Refund 是否与工程实现一致。

[DONE]
