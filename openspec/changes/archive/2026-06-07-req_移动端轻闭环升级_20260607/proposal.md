## Why / 背景

Forge-OS 已经完成桌面端轻量收集箱、阶段分组和派生成长证据，但移动端仍需要把这些能力转成适合手机的轻闭环：30 秒内能知道今天该做什么、临时想法放在哪里、待澄清事项如何处理、周推进是否留下证据、系统同步是否健康。

根据 `docs/product/forge-os-expert-agent-review.md` 的移动端策略，本次不把桌面完整澄清器搬到手机，不新增第五个主导航，也不新增 Android 专属数据模型。移动端继续保持 `今日 / 推进 / 记录 / 系统` 四入口，只补轻量提示、轻量澄清、证据摘要和健康摘要。

## What Changes / 变更内容

- 今日页增加移动端使用节奏提示，说明早上、白天、晚上各自做什么。
- 推进页增加待澄清队列，复用现有 `inboxItems`，支持澄清为今日任务、收纳任务或灵感，并支持删除。
- 推进页增强本周证据摘要，展示完成任务、未完成任务、能力加分和相关反思数量。
- 系统页增加移动端数据健康摘要，展示本地数据、待澄清、同步状态、冲突和本机/同步关系。
- 增加结构测试，确保移动端升级不新增第五主导航、不新增移动专属持久模型、不修改 V3/Electron/Android 存储契约。

## Capabilities / 能力范围

### New Capabilities / 新增能力

- `移动端轻闭环升级`: 约束移动端节奏提示、待澄清处理、派生证据摘要和只读健康摘要。

### Modified Capabilities / 修改能力

- `安卓移动端应用`: 补充移动端轻量闭环要求。
- `手机端网页适配`: 补充移动视口下的节奏、待澄清和证据摘要布局要求。

## Impact / 影响范围

- 影响移动端组件：`src/features/mobile/MobileTodayForge.tsx`、`src/features/mobile/MobileWeekProgress.tsx`、`src/features/mobile/MobileAppShell.tsx`。
- 影响样式：`src/index.css` 的移动端 CSS 段。
- 影响测试：新增移动端轻闭环结构测试。
- 不影响桌面 Dashboard、V3 adapter、V3 merge、Electron IPC、Android 私有存储接口、`AppState` 持久化结构和移动端四主入口枚举。
