## Why / 背景

`docs/product/forge-os-expert-agent-review.md` 的 Android 专项要求明确指出：Android 返回优先级应为先关弹层、再退模块、再退出 App；输入法弹出时保存/取消仍可点；大字体和 TalkBack 下主入口、任务操作、同步状态可读。

当前移动端已经完成轻闭环能力，但部分弹层/面板仍是组件内部状态，系统返回不一定优先关闭这些临时 UI。新增的轻闭环控件也需要进一步补强无障碍标签，便于真机复审时用 TalkBack 和大字体验证。

## What Changes / 变更内容

- 增加移动端临时面板返回处理 hook，用于在面板打开时接入浏览器历史，使 Android 返回优先关闭面板。
- 将今日任务输入面板、推进页周复盘面板、收纳安排面板、记录页 composer、系统完整工具面板接入该返回处理。
- 为移动端底部导航、待澄清操作、系统健康摘要等补充更明确的 `aria-label`、`aria-live` 或 `role`。
- 增加结构测试，确保返回优先级和可访问性边界被锁定。

## Capabilities / 能力范围

### New Capabilities / 新增能力

- `移动端返回与无障碍收尾`: 约束移动端临时面板返回优先级、输入面板可关闭性和 TalkBack 可读性。

### Modified Capabilities / 修改能力

- `安卓移动端应用`: 补充 Android 返回优先级和 TalkBack 可读性场景。
- `手机端网页适配`: 补充移动视口弹层关闭和可读状态要求。

## Impact / 影响范围

- 影响移动端组件：`src/features/mobile/MobileTodayForge.tsx`、`src/features/mobile/MobileWeekProgress.tsx`、`src/features/mobile/MobileCaptureHub.tsx`、`src/features/mobile/MobileAppShell.tsx`。
- 新增移动端工具 hook：`src/features/mobile/useMobilePanelHistory.ts`。
- 影响测试：新增结构测试。
- 不影响 V3 同步、数据模型、Android 原生存储、Electron IPC 或移动端四主入口。
