## Why / 背景

`docs/product/forge-os-expert-agent-review.md` 的第一阶段已经补齐系统信任与使用节奏，但增长闭环还缺少三个可见入口：桌面端把混沌想法收进系统的轻量收集条、模块管理按 Forge 阶段理解、以及从现有任务/反思/能力中看见成长证据。

本次变更继续第二、三阶段，保持“轻入口 + 稳契约 + 派生证据”路线：不新增大型页面、不恢复原版 ActionDesk、不新增 `EvidenceRecord` 持久实体，也不修改 V3 同步契约。

## What Changes / 变更内容

- 在 Dashboard 首屏新增轻量桌面收集入口，支持快速新增、删除，以及澄清为今日任务、收纳任务或灵感。
- 调整现有 inbox 文案边界，避免普通想法被误读成 OKR/KR，只把它表达为待澄清入口。
- 模块管理按 Forge 阶段分组展示，但不改变 `ModuleId`、`enabledModules` 和持久化语义。
- 周复盘增强“本周证据”，展示完成任务、未完成任务、能力加分和相关反思。
- 反思库新增派生“成长证据档案”，聚合周复盘、完成目标、能力进展和近期反思。
- 月度 OKR 页预留“本月证据”入口，为后续月度成长报告做产品层铺垫。

## Capabilities / 能力范围

### New Capabilities / 新增能力

- `增长闭环补全`: 约束桌面收集入口、阶段分组展示和派生成长证据。

### Modified Capabilities / 修改能力

- 无。

## Impact / 影响范围

- 影响 Dashboard 展示与 inbox 操作：`src/pages/Dashboard.tsx`、`src/features/capture/*`、`src/store/slices/okrSlice.ts`、`src/features/okr/OKRInboxColumn.tsx`。
- 影响模块管理展示：`src/features/modules/ModulePicker.tsx`。
- 影响派生成长证据展示：`src/pages/WeeklyReview.tsx`、`src/pages/Reflection.tsx`、`src/pages/MonthlyOKR.tsx`、`src/features/evidence/*`。
- 影响测试：新增结构测试，锁定入口、派生边界和不新增持久实体。
- 不影响 V3 adapter、V3 merge、Electron 存储、Android 私有存储、`AppState` 持久化结构或 `ModuleId` 值。
