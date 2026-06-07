## ADDED Requirements
> 中文：新增需求

### Requirement: Android smoke test command installs and launches APK / Android 冒烟命令安装并启动 APK

系统 MUST（必须）提供一个项目内命令，用于在已连接 Android 设备上安装并启动当前 debug APK。

#### Scenario: Developer runs Android smoke test / 开发者运行 Android 冒烟测试

- **WHEN** 开发者运行 `npm run android:smoke`
- **THEN** 系统使用 ADB 找到已连接 Android 设备
- **AND** 系统安装 `android/app/build/outputs/apk/debug/app-debug.apk`
- **AND** 系统启动 `com.forgeos.app/.MainActivity`

#### Scenario: Install avoids direct adb install hang / 安装规避直接 adb install 卡住

- **WHEN** 脚本安装 APK
- **THEN** 系统先将 APK push 到设备临时路径
- **AND** 系统通过 `pm install -r -t` 安装该 APK

### Requirement: Android smoke test captures evidence screenshots / Android 冒烟测试采集截图证据

系统 MUST（必须）在冒烟测试过程中保存关键页面截图，供后续人工复核和问题定位。

#### Scenario: Smoke test saves key screenshots / 冒烟测试保存关键截图

- **WHEN** 冒烟测试运行完成
- **THEN** 系统在 `.gstack/android-smoke/latest/` 保存 Dashboard 截图
- **AND** 系统保存 System 页面截图
- **AND** 系统保存 System COS settings 区域截图

### Requirement: Android smoke test detects likely blank screens / Android 冒烟测试检测疑似白屏

系统 MUST（必须）对关键截图执行自动白屏检测，避免仅凭进程启动成功误判 APK 可用。

#### Scenario: Screenshot is visually non-blank / 截图不是视觉白屏

- **WHEN** 系统采集 Dashboard、System 或 System COS settings 截图
- **THEN** 系统解析 PNG 像素数据
- **AND** 系统计算中心区域亮度方差和颜色桶数量
- **AND** 如果截图疑似纯白、纯色或低变化空白画面，命令失败并输出原因

### Requirement: Android smoke test remains lightweight / Android 冒烟测试保持轻量

系统 MUST（必须）在不引入重型移动端测试框架的前提下完成基础 smoke gate。

#### Scenario: Smoke test uses existing local tooling / 冒烟测试使用现有本地工具

- **WHEN** 项目新增 Android smoke test
- **THEN** 系统不要求启动 Appium、WebDriver、Midscene 或视觉 AI 服务
- **AND** 系统只依赖 Node 内置模块和 Android platform-tools

### Requirement: Android smoke test is configurable for local devices / Android 冒烟测试可配置本地设备

系统 MUST（必须）允许开发者在常见本地测试场景中调整 APK、设备或输出目录。

#### Scenario: Developer overrides smoke test inputs / 开发者覆盖冒烟测试输入

- **WHEN** 开发者传入 `--apk=<path>`、`--out=<path>`、`--device=<serial>` 或 `--skip-install`
- **THEN** 系统按对应参数执行 smoke test
- **AND** 默认路径仍适用于标准 debug APK 验证流程
