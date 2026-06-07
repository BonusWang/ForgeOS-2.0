## 1. Tests / 测试

- [x] 1.1 新增增长闭环结构测试，覆盖桌面收集入口、模块阶段分组、派生成长证据和不新增持久实体边界。
- [x] 1.2 运行新增测试并确认它在实现前失败。

## 2. Desktop Capture / 桌面收集入口

- [x] 2.1 在 OKR slice 中补充复用 `inboxItems` 的轻量普通收集 action。
- [x] 2.2 新增 Dashboard 桌面收集组件，支持新增、删除、澄清为今日任务、收纳任务和灵感。
- [x] 2.3 将收集组件接入 Dashboard 首屏，并调整 inbox 文案为待澄清入口。

## 3. Phase Grouping / 阶段分组

- [x] 3.1 在模块管理中按 Forge 阶段分组展示现有模块。
- [x] 3.2 确认分组只改变展示，不改变 `ModuleId`、`enabledModules` 或持久化字段。

## 4. Derived Growth Evidence / 派生成长证据

- [x] 4.1 增强周复盘“本周证据”，展示完成任务、未完成任务、能力加分和相关反思。
- [x] 4.2 在反思库新增派生成长证据档案。
- [x] 4.3 在月度 OKR 页预留本月证据入口。

## 5. Verification / 验证

- [x] 5.1 运行新增结构测试并确认通过。
- [x] 5.2 运行 `openspec validate --all --strict --no-interactive`。
- [x] 5.3 运行 `node --test tests/*.test.ts`。
- [x] 5.4 运行 `npm run lint`。
- [x] 5.5 运行 `npm run build`。
- [x] 5.6 运行 `npm run android:build`。
- [x] 5.7 如有 ADB 设备，运行 `npm run android:smoke`；如无设备，记录降级说明。

> 降级说明：2026-06-07 `adb devices` 未列出设备，因此未执行 `npm run android:smoke` 安装与截图；已完成 APK debug 构建。
