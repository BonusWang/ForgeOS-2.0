## 1. Android Smoke Runner / Android 冒烟脚本

- [x] 1.1 新增 `scripts/run-android-smoke.mjs`，支持自动定位 ADB、检测已连接设备和启动应用。
- [x] 1.2 使用 `adb push` + `pm install -r -t` 安装 debug APK，避免直接 `adb install` 卡住。
- [x] 1.3 支持默认 APK 路径，并提供 `--apk`、`--out`、`--device` 和 `--skip-install` 参数。

## 2. Screenshot Evidence / 截图证据

- [x] 2.1 使用 `adb exec-out screencap -p` 采集 Dashboard 截图。
- [x] 2.2 点击系统页并采集 System 页面截图。
- [x] 2.3 滑动到 COS 设置区域并采集 `system-cos` 截图。
- [x] 2.4 将截图保存到 `.gstack/android-smoke/latest/`。

## 3. Blank Screen Detection / 白屏检测

- [x] 3.1 使用 Node 内置 `zlib.inflateSync` 解析 PNG IDAT 数据。
- [x] 3.2 计算截图中心区域 `lumaStdDev` 和 `colorBuckets`。
- [x] 3.3 当截图疑似纯色或白屏时让 smoke 命令失败并输出诊断信息。

## 4. Project Integration / 项目集成

- [x] 4.1 在 `package.json` 新增 `android:smoke` 命令。
- [x] 4.2 新增 `tests/androidSmokeScript.test.ts`，锁定脚本安装、启动、截图和白屏检测能力。
- [x] 4.3 运行 `npm run android:smoke`，确认已连接 Android 设备上的 Dashboard、System 和 COS settings 截图均非白屏。
- [x] 4.4 运行全量测试、lint 和 Web build，确认新增验证脚本不影响现有工程。
