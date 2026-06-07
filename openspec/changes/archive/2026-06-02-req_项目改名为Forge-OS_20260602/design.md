# Project Rename to Forge-OS Design / 项目改名为 Forge-OS 设计

## Context / 背景

当前产品展示名是 `Forge`，仓库已改为 `Forge-OS`。为了让产品名更贴近“确认自己的目标，并围绕目标持续锻造自己”的长期定位，展示层命名需要同步为 `Forge-OS`。

## Goals / Non-Goals / 目标与非目标

目标：

- 用户可见品牌统一为 `Forge-OS`。
- 文档和仓库链接指向 `BonusWang/Forge-OS`。
- 构建产物使用 `Forge-OS` 命名。
- 数据目录保持不变，避免用户数据丢失。

非目标：

- 不改动目标管理、OKR、周复盘等业务流程。
- 不迁移 AppData 目录。
- 不引入新的品牌视觉设计。

## Decisions / 设计决策

1. UI 展示使用 `Forge-OS`，仓库和 npm 包 slug 使用 `forge-os`。
2. Electron `productName` 使用 `Forge-OS`，构建产物使用 `Forge-OS-${version}-${arch}.${ext}`。
3. `DATA_DIR_NAME` 保持 `Forge`，并在文档中说明这是为了保留现有本地数据。
4. 顶部品牌和 slogan 继续加 `translate="no"`，避免浏览器误翻译品牌。

## Risks / Trade-offs / 风险与取舍

- 展示名和数据目录不完全一致，但这能最大限度保护已有数据。
- 后续如果确实要迁移数据目录，应单独走数据迁移需求，而不是和品牌改名混在一起。
