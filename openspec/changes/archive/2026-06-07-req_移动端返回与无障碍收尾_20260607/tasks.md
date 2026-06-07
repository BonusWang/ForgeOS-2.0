## 1. Tests / 测试

- [x] 1.1 新增移动端返回与无障碍结构测试，覆盖共享返回 hook、面板接入和 TalkBack 标签。
- [x] 1.2 运行新增测试并确认它在实现前失败。

## 2. Panel Back Priority / 面板返回优先级

- [x] 2.1 新增 `useMobilePanelHistory`，在面板打开时 push 临时历史，并在 `popstate` 时关闭。
- [x] 2.2 今日任务输入面板接入返回关闭。
- [x] 2.3 推进页周复盘和收纳安排面板接入返回关闭。
- [x] 2.4 记录页 composer 接入返回关闭。
- [x] 2.5 系统页完整工具面板接入返回关闭。

## 3. Accessibility / 无障碍可读性

- [x] 3.1 底部导航按钮补充明确 `aria-label`。
- [x] 3.2 待澄清操作按钮补充目标明确的 `aria-label`。
- [x] 3.3 系统健康摘要补充 `role="status"` 和 `aria-live`。
- [x] 3.4 输入面板保存/取消/关闭操作保留可读名称。

## 4. Verification / 验证

- [x] 4.1 运行新增结构测试并确认通过。
- [x] 4.2 运行 `openspec validate --all --strict --no-interactive`。
- [x] 4.3 运行 `node --test tests/*.test.ts`。
- [x] 4.4 运行 `npm run lint`。
- [x] 4.5 运行 `npm run build`。
- [x] 4.6 运行 `npm run android:build`。
- [x] 4.7 如有 ADB 设备，运行 `npm run android:smoke`；如无设备，记录降级说明。本次 `adb devices` 无连接设备，已降级为 APK 构建通过 + 待真机复审今日/推进/记录/系统四页。
