## Context / 背景

Forge-OS Android 端是 WebView 壳承载 Vite/React 生产资源。白屏类问题可能来自资源路径、WebView 加载、打包资源、设备安装状态或运行时异常。单纯检查进程是否启动不足以证明界面可用，因此需要结合真机启动和截图像素分析。

本次变更在已有 Android 构建与安装能力之上补充轻量 smoke gate，目标是让开发者在每次改动 Android、移动端布局、WebView 资源或 COS 系统页后，可以用一个命令获得快速反馈和截图证据。

## Goals / Non-Goals / 目标与非目标

**Goals / 目标:**

- 提供一个项目内置命令，验证已构建 APK 能在已连接 Android 设备上安装和启动。
- 验证 Dashboard、System 和 COS 设置区域截图不是白屏。
- 保存截图证据，便于人工复核 UI 回归。
- 避开本机环境中 `adb install` 可能卡住的问题，使用 `adb push` + `pm install -r -t`。
- 不引入重型测试依赖，保持脚本可在当前 Node/ADB 环境下运行。

**Non-Goals / 非目标:**

- 不替代单元测试、OpenSpec validate、lint 或 production build。
- 不实现 Appium/Midscene 级别的复杂交互自动化。
- 不验证 COS 网络连通性、云端数据正确性或签名服务可用性。
- 不清理或重置用户设备上的 Forge-OS 数据。
- 不强制处理多设备并发测试，只支持通过 `ANDROID_SERIAL` 或 `--device=` 选择设备。

## Decisions / 设计决策

1. 使用 ADB 作为唯一移动端自动化边界。

   - 理由：当前需求只需要安装、启动、点击、滑动和截图，ADB 足够覆盖，且无需引入 Appium 服务、WebDriver 或视觉 AI 运行时。
   - 脚本通过 `ANDROID_HOME`、`ANDROID_SDK_ROOT`、用户默认 Android SDK 路径或 `ADB` 环境变量定位 adb。

2. 使用 `pm install -r -t` 替代直接 `adb install`。

   - 理由：当前设备环境中 `adb install -r` 曾出现长时间卡住；先 push 到 `/data/local/tmp/` 再调用包管理器安装更可控。
   - `-t` 允许安装 debug/test APK，符合当前“仅本机安装 APK”的发布目标。

3. 截图使用 `adb exec-out screencap -p`。

   - 理由：避免先写入设备再 pull 的两步流程，减少设备临时文件残留。
   - 截图保存到 `.gstack/android-smoke/latest/`，包含 `dashboard.png`、`system.png` 和 `system-cos.png`。

4. 白屏检测使用 PNG 像素分析。

   - 脚本解析 PNG IHDR/IDAT，使用 Node 内置 `zlib.inflateSync` 解码像素。
   - 在截图中心区域采样，计算亮度标准差 `lumaStdDev` 和粗粒度颜色桶数量 `colorBuckets`。
   - 如果亮度方差或颜色桶过低，则视为疑似白屏并失败。
   - 这种检测不能证明 UI 完美，但能有效阻止“纯白/纯色占位页却进程启动成功”的假通过。

5. 测试路径覆盖核心 smoke 面。

   - 启动后先截 Dashboard，验证主页面不是白屏。
   - 点击系统页入口后截 System，验证导航和系统页可达。
   - 滑动到 COS 设置区域后截 `system-cos`，验证本次 Android/COS 相关核心区域可见。

6. 保持脚本可配置但不过度抽象。

   - 默认使用 `android/app/build/outputs/apk/debug/app-debug.apk`。
   - 支持 `--apk=<path>`、`--out=<path>`、`--device=<serial>` 和 `--skip-install`。
   - 不新增配置文件；当前项目规模下命令行参数足够。

## Risks / Trade-offs / 风险与取舍

- 像素检测可能无法识别“页面内容错误但不白屏” -> 本脚本只作为 smoke gate，仍需要单元测试和人工截图复核。
- 坐标点击依赖当前移动端导航布局 -> 使用相对屏幕坐标降低设备差异，但如果导航结构大改，需要同步更新脚本。
- 不清空设备数据 -> 保留真实使用状态更接近用户环境，但无法保证截图完全一致。
- 不引入 Appium/Midscene -> 降低维护成本，但暂不支持语义级控件断言和复杂交互路径。

## Rollout / 推进方式

1. 新增脚本和 npm 命令。
2. 新增结构测试，锁定安装、启动、截图、白屏检测和跳过安装参数。
3. 在已连接 Android 设备上运行 `npm run android:smoke`。
4. 保存截图证据到 `.gstack/android-smoke/latest/`。
5. 将该命令作为 Android UI、WebView 资源或移动端布局改动后的建议验证步骤。
