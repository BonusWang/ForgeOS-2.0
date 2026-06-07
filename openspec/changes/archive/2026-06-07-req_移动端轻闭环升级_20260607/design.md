## Context / 背景

移动端当前已经有 `MobileTodayForge`、`MobileWeekProgress`、`MobileCaptureHub` 和 `MobileAppShell` 四个核心入口。已有能力覆盖今日快速任务、推进页任务维护、收纳箱、记录页灵感/反思、系统同步入口。桌面端新增的轻量收集箱和派生成长证据需要以移动端适配方式补进来，而不是复制桌面布局。

## Goals / Non-Goals / 目标与非目标

**Goals / 目标:**

- 今日页给出早上/白天/晚上移动使用节奏，帮助用户知道打开手机后先做什么。
- 推进页提供待澄清队列，复用 `inboxItems`，支持转今日任务、转收纳任务、转灵感、删除。
- 推进页提供本周证据摘要，派生完成任务、未完成任务、能力加分和相关反思。
- 系统页提供只读数据健康摘要，不必展开完整系统页也能看到同步和本地状态。
- 保持移动端四主入口不变。

**Non-Goals / 非目标:**

- 不新增第五个移动主导航。
- 不恢复桌面完整 `ActionDesk` 或完整 `InboxClarifier`。
- 不支持移动端把收集项转 Objective、KR、Calendar、Habit 或 Entertainment。
- 不新增 `MobileCaptureItem`、`EvidenceRecord` 或 Android 专属实体。
- 不修改 V3 adapter、V3 merge、Electron IPC、Android 私有存储和 `AppState` 持久化结构。

## Decisions / 设计决策

1. **待澄清队列放在推进页。**
   - 选择：在 `MobileWeekProgress` 的周推进之后、收纳箱之前展示待澄清队列。
   - 理由：推进页已经负责收纳箱和周任务维护，是手机端轻量澄清的自然位置。
   - 未选择：放在今日页。今日页应保持“今日承诺”和状态记录，不宜塞入跨周澄清列表。

2. **复用现有实体 action。**
   - 今日任务与收纳任务使用 `addTask`，灵感使用 `addInspiration`，删除使用 `removeFromInbox`。
   - 这样保持与桌面端一致，不引入移动专属持久模型。

3. **证据和健康摘要全部派生。**
   - 本周证据从 tasks、reflections 和 ability fields 派生。
   - 系统健康从 tasks、inboxItems、reflections、inspirations、syncConfig、syncStatus、v3SyncConflicts 派生。
   - 不新增 store 字段，不触发同步动作。

4. **今日节奏是展示文案，不是完成率模型。**
   - 使用轻量 chips/rows 表达早上、白天、晚上。
   - 不新增 ritual 数据模型，不统计完成率。

## Risks / Trade-offs / 风险与取舍

- 推进页信息密度变高 → 待澄清队列使用短卡片和紧凑操作，保持收纳箱仍可见。
- 系统摘要可能被误解为诊断修复 → 只展示只读状态，不提供修复/重置/立即同步动作。
- 结构测试不能替代真机截图 → 本次仍跑 Android build；ADB 无设备时继续按现有 smoke 降级路径记录。
