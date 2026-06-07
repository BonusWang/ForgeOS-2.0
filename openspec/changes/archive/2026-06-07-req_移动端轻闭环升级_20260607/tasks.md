## 1. Tests / 测试

- [x] 1.1 新增移动端轻闭环结构测试，覆盖今日节奏、待澄清澄清、周证据、系统健康和四入口边界。
- [x] 1.2 运行新增测试并确认它在实现前失败。

## 2. Today Rhythm / 今日节奏

- [x] 2.1 在 `MobileTodayForge` 增加早上、白天、晚上轻量使用节奏提示。
- [x] 2.2 确认节奏提示不读取或写入新的 ritual 模型。

## 3. Mobile Clarification / 移动待澄清

- [x] 3.1 在 `MobileWeekProgress` 读取 `inboxItems`、`removeFromInbox` 和 `addInspiration`。
- [x] 3.2 在推进页展示待澄清队列和数量。
- [x] 3.3 支持澄清为今日任务、收纳任务、灵感和删除。

## 4. Weekly Evidence / 周证据

- [x] 4.1 在推进页派生完成任务、未完成任务、能力加分和相关反思数量。
- [x] 4.2 在周推进摘要区展示本周证据。

## 5. Mobile System Health / 移动系统健康

- [x] 5.1 在移动系统页派生只读健康摘要。
- [x] 5.2 将健康摘要展示在系统页工具入口之前，不新增修复/重置动作。

## 6. Verification / 验证

- [x] 6.1 运行新增结构测试并确认通过。
- [x] 6.2 运行 `openspec validate --all --strict --no-interactive`。
- [x] 6.3 运行 `node --test tests/*.test.ts`。
- [x] 6.4 运行 `npm run lint`。
- [x] 6.5 运行 `npm run build`。
- [x] 6.6 运行 `npm run android:build`。
- [x] 6.7 如有 ADB 设备，运行 `npm run android:smoke`；如无设备，记录降级说明。

> 降级说明：2026-06-07 `adb devices` 未列出设备，因此未执行 `npm run android:smoke` 安装与截图；已完成 APK debug 构建。
