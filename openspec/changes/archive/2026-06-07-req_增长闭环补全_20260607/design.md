## Context / 背景

Forge-OS 当前已经有任务、灵感、反思、能力、月度 OKR 和周复盘，但用户打开桌面端时仍缺少“先收进来，再澄清”的第一步。现有 `inboxItems` 能被任务看板拖入日期列，说明系统已有可复用的收集容器；本次只补一个轻量入口和澄清操作，不引入新模型。

同时，模块管理当前按平铺列表展示，无法表达 Forge 的“定向 -> 捕捉 -> 执行 -> 复盘 -> 成长证据 -> 维护”节奏。成长证据也已经散落在任务、反思、能力和目标中，本次以派生视图把它们显示出来。

## Goals / Non-Goals / 目标与非目标

**Goals / 目标:**

- Dashboard 首屏提供轻量收集条和待澄清列表。
- 收集项可以澄清为今日任务、收纳任务、灵感，或直接删除。
- 模块管理按 Forge 阶段分组展示，不改变模块 ID 或持久化字段。
- 周复盘、反思库和月度 OKR 能看到派生证据入口。
- 使用结构测试验证入口和边界。

**Non-Goals / 非目标:**

- 不新增一级页面或恢复原版完整 ActionDesk。
- 不支持收集项转 Objective、KR、Calendar、Habit 或 Entertainment。
- 不新增桌面专属 capture 模型。
- 不新增 `EvidenceRecord`、不修改 `AppState`、V3 adapter 或 V3 merge。
- 不改变移动端四入口和 Android 存储/返回/输入法行为。

## Decisions / 设计决策

1. **收集入口复用 `inboxItems`。**
   - 选择：在 OKR slice 增加轻量 `addInboxItem(content)` action，写入现有 `inboxItems`。
   - 理由：`inboxItems` 已经参与任务板拖拽与持久化，普通想法可作为无 objective 的待澄清项存在。
   - 未选择：新增 `captureItems` 或桌面专属模型。该方案会扩大持久化和同步契约。

2. **澄清操作调用现有实体 action。**
   - 今日任务和收纳任务使用 `addTask`；灵感使用 `addInspiration`；删除使用 `removeFromInbox`。
   - 这样不会增加实体种类，也能保持移动端和桌面端共享同一批任务/灵感。

3. **模块分组只在展示层计算。**
   - 选择：`ModulePicker` 内定义阶段配置，按现有 `ModuleMeta.id` 分组展示。
   - 理由：符合“不改 `ModuleId` 和持久化语义”的边界。

4. **成长证据全部派生。**
   - 选择：从 tasks、weeklyReviews、reflections、objectives、abilities 派生摘要。
   - 理由：当前阶段只需要看见证据，不需要独立证据生命周期。

## Risks / Trade-offs / 风险与取舍

- 普通 inbox 和 OKR inbox 共用容器可能造成文案混淆 → 将文案改为“待澄清”，并在来源处区分 OKR/能力/收集箱。
- 派生证据不具备独立编辑能力 → 本阶段符合低风险 MVP，后续如需证据实体再单独评审契约。
- 结构测试不能替代交互测试 → 本阶段仍会用浏览器做关键页面手工验证，并跑完整构建 gate。
