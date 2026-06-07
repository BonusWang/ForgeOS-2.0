## Why / 背景

Forge-OS 当前系统页已经具备备份、同步和更新能力，但用户仍需要一个更高层的只读判断：本地数据是否存在、同步是否健康、是否有冲突或待上传，以及日常应该按什么节奏使用产品。

根据 `docs/product/forge-os-expert-agent-review.md` 的第一阶段建议，本次先补齐“系统信任与使用节奏”，让用户在不理解底层 V3/COS 细节的情况下，也能判断系统状态并形成每日、每周、每月使用仪式。

## What Changes / 变更内容

- 在系统页增加只读数据健康摘要，展示本地存储、同步启用状态、V3 初始化状态、冲突数、待上传状态、本机存储路径和最近同步/备份信息。
- 在系统页增加折叠式使用指南，覆盖早上、白天、晚上、周末和月底的 Forge-OS 使用节奏。
- 在 README 增加对应的每日、每周、每月使用节奏说明。
- 增加结构测试，确保系统健康摘要和使用指南入口存在，且不引入会修改同步状态或持久化契约的新动作。
- 不新增持久化实体，不修改 `AppState`，不修改 V3 runner、Electron 存储层或 Android 私有存储。

## Capabilities / 能力范围

### New Capabilities / 新增能力

- `系统信任与使用节奏`: 约束系统页只读健康摘要、折叠式使用指南、README 使用节奏和对应结构测试。

### Modified Capabilities / 修改能力

- 无。

## Impact / 影响范围

- 影响系统页展示组件：`src/pages/System.tsx`、`src/features/system/*`。
- 影响系统文案：`src/copy/system-copy.ts`。
- 影响 README 使用说明：`README.md`。
- 影响测试：`tests/syncPanelStructure.test.ts`、`tests/dataBackupPanelStructure.test.ts` 或新增系统页结构测试。
- 不影响数据持久化格式、COS/V3 同步数据契约、Electron IPC、Android 私有存储、`ModuleId` 和现有业务实体。
