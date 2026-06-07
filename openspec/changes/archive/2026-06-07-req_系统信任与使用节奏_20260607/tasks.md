## 1. Tests / 测试

- [x] 1.1 新增系统信任结构测试，覆盖数据健康摘要、使用指南、README 节奏和只读边界。
- [x] 1.2 运行新增测试并确认它在实现前失败。

## 2. System Page Panels / 系统页面板

- [x] 2.1 新增 `DataHealthPanel`，从现有 store 和平台存储地址派生只读健康摘要。
- [x] 2.2 新增 `UsageRitualPanel`，展示可展开/收起的早上、白天、晚上、周末、月底使用节奏。
- [x] 2.3 将两个面板接入系统页，保持现有关于、更新、备份和 COS 同步入口不丢失。

## 3. Copy and Docs / 文案与文档

- [x] 3.1 在 `systemCopy` 中增加数据健康和使用仪式文案。
- [x] 3.2 更新 README，补充每日、每周、每月使用节奏，并说明不新增独立数据模型。

## 4. Verification / 验证

- [x] 4.1 运行新增结构测试并确认通过。
- [x] 4.2 运行 `openspec validate --all --strict --no-interactive`。
- [x] 4.3 运行 `node --test tests/*.test.ts`。
- [x] 4.4 运行 `npm run lint`。
- [x] 4.5 运行 `npm run build`。
