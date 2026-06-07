## ADDED Requirements
> 中文：新增需求

### Requirement: Android app can be installed and launched / Android 应用可安装并启动

系统 MUST（必须）提供可安装的 Android App，使用户无需打开浏览器或开发服务即可启动 Forge-OS。

#### Scenario: Installed Android app launches Forge-OS / 已安装 Android 应用启动 Forge-OS

- **WHEN** 用户在 Android 设备上安装并打开 Forge-OS App
- **THEN** 系统显示 Forge-OS 主界面
- **AND** 不依赖 `http://127.0.0.1:5173/`、桌面 Electron 或外部浏览器标签页

#### Scenario: Android app bundles production assets / Android 应用内置生产资源

- **WHEN** Android App 在无开发服务的环境中启动
- **THEN** 系统从应用包内加载前端生产构建资源
- **AND** 页面不会因为缺少 Vite dev server 而空白

### Requirement: Android app supports core Forge-OS workflows / Android 应用支持核心 Forge-OS 工作流

系统 MUST（必须）在 Android App 中保留 Forge-OS 的核心页面和常用模块，使移动端不是只读壳或占位页面。

#### Scenario: User opens core pages on Android / 用户在 Android 打开核心页面

- **WHEN** 用户在 Android App 中使用周看板、反思库、周复盘和系统页
- **THEN** 系统展示与桌面端同源的业务数据
- **AND** 用户可以查看、输入、保存和切换页面

#### Scenario: Android layout remains usable / Android 布局保持可用

- **WHEN** 用户在常见 Android 手机屏幕宽度下使用 Forge-OS App
- **THEN** 主要页面内容可读且可操作
- **AND** 核心按钮、输入框、弹层和导航入口不发生明显重叠或裁切

### Requirement: Android app preserves data offline / Android 应用离线保留数据

系统 MUST（必须）在 Android App 中使用应用私有本地存储保留用户数据，并允许离线读写。

#### Scenario: Android restart preserves local data / Android 重启保留本地数据

- **WHEN** 用户在 Android App 中新增或修改任务、反思、情绪或配置
- **AND** 用户关闭并重新打开 Android App
- **THEN** 系统仍显示用户刚才保存的数据

#### Scenario: Android offline usage continues / Android 离线使用继续工作

- **WHEN** Android 设备没有网络连接
- **THEN** 用户仍可以打开 Forge-OS App 并读写本地数据
- **AND** 系统不因为 COS 同步不可用而阻止本地保存

### Requirement: Android app does not regress desktop behavior / Android 应用不回退桌面行为

系统 MUST（必须）新增 Android App 交付能力时保持现有桌面 Electron 和网页开发入口可用。

#### Scenario: Desktop app remains usable after Android support / 新增 Android 后桌面端仍可用

- **WHEN** 开发者新增或构建 Android App
- **THEN** 桌面 Electron 仍可启动并读取 `%APPDATA%\Forge\alo-data.json`
- **AND** `npm run build` 仍能生成现有网页生产构建
