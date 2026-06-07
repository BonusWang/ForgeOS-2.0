## Why / 背景

Android APK 已经可以构建和安装，但当前验证主要依赖手动下载、手动打开和人工截图判断。之前出现过手机端白屏问题，因此需要一个轻量、可重复的真机冒烟测试流程，用来快速确认 APK 安装后不是空白页，核心页面和 COS 同步区域可以显示。

## What Changes / 变更内容

- 新增 Android 真机冒烟测试脚本，通过 ADB 安装、启动 Forge-OS APK 并采集截图证据。
- 新增截图白屏检测：解析 PNG 像素，基于亮度方差和颜色桶数量判断页面是否疑似空白。
- 新增固定测试路径：Dashboard、System、System COS settings 三个关键页面/区域。
- 新增 `npm run android:smoke` 命令，便于每次 APK 构建后执行。
- 新增结构测试，防止冒烟测试脚本能力被误删或退化。
- 不引入 Appium、Midscene 或其他重型移动端测试依赖；本次仅覆盖轻量 smoke gate。

## Capabilities / 能力范围

### New Capabilities / 新增能力

- `安卓真机冒烟测试`: 覆盖 Android APK 在真实设备上的安装、启动、关键页面截图、白屏检测、截图证据保存和命令行验证入口。

### Modified Capabilities / 修改能力

- 无。

## Impact / 影响范围

- 影响 `package.json`：新增 `android:smoke` npm script。
- 影响 `scripts/`：新增 Android smoke runner。
- 影响 `tests/`：新增脚本结构测试。
- 影响本地验证产物：生成 `.gstack/android-smoke/latest/*.png` 截图证据。
- 不影响 Android 业务代码、COS 同步算法、数据持久化格式或桌面端构建流程。
