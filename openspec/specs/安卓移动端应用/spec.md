# 安卓移动端应用 Specification

## Purpose
定义 Forge-OS Android App 的安装启动、本地优先数据、离线操作、移动端核心工作流、输入法适配和返回导航要求。
## Requirements
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
- **THEN** 桌面 Electron 仍可启动并读取 `%APPDATA%\Forge\forge-data.json`
- **AND** `npm run build` 仍能生成现有网页生产构建

### Requirement: Android app displays record times using device-local time / Android 应用使用设备本地时间展示记录时间

系统 MUST 在 Android App 中按设备本地时间展示移动端记录时间，避免将 UTC 存储时间直接暴露给用户。

#### Scenario: Android record history displays local time / Android 记录历史显示本地时间

- **WHEN** 用户在 Android App 的「记录」页新增一条记录
- **THEN** 最近保存列表 MUST 按 Android 设备本地时区显示该记录时间
- **AND** 系统 MUST NOT 因 UTC ISO 字符串导致北京时间显示偏差

#### Scenario: Android app does not require network time sync for display fix / Android 不依赖联网校时修复展示

- **WHEN** Android 设备没有网络连接
- **THEN** 系统 MUST 仍可按设备本地时间展示记录时间
- **AND** 系统 MUST 不要求联网校时才能修复 UTC 展示偏差

### Requirement: Android app supports mobile task operations offline / Android 应用离线支持移动端任务操作

系统 MUST 在 Android App 离线状态下支持移动端任务完成、编辑、移动和删除，并写入应用私有本地存储。

#### Scenario: Android offline task operation persists locally / Android 离线任务操作本地保留

- **WHEN** Android 设备离线且用户在「推进」页完成、编辑、移动或删除任务
- **THEN** 系统 MUST 将操作写入 Android 应用私有本地存储
- **AND** 用户关闭并重新打开 Android App 后 MUST 看到操作结果

#### Scenario: Android task operations keep sync payload shape / Android 任务操作保持同步载荷结构

- **WHEN** Android App 执行移动端任务操作
- **THEN** 系统 MUST 复用现有任务数据结构和 COS 同步载荷
- **AND** 系统 MUST NOT 创建 Android 专属任务模型

### Requirement: Android app respects keyboard resize and font scaling / Android 应用尊重键盘避让与字体缩放

系统 MUST 在 Android App 中让系统软键盘和系统字体缩放参与布局，使移动输入和无障碍阅读保持可用。

#### Scenario: Keyboard resizes the WebView / 软键盘顶起 WebView

- **WHEN** 用户在 Android App 中聚焦任务、灵感或反思输入框
- **THEN** Activity MUST 使用 resize 策略为软键盘让出空间
- **AND** 输入面板和保存操作 MUST 尽量保持在可操作视口内

#### Scenario: WebView keeps system text scaling / WebView 保留系统字体缩放

- **WHEN** 用户在 Android 系统中调整字体大小
- **THEN** Android App MUST 允许 WebView 文本随系统缩放
- **AND** 系统 MUST NOT 通过固定 `setTextZoom(100)` 强制忽略用户字体设置

### Requirement: Android app supports mobile section back navigation / Android 应用支持移动模块返回导航

系统 MUST 在 Android App 的手机端底部导航中维护模块历史，使用户可以用系统返回手势回到上一模块。

#### Scenario: Android back returns to previous section / Android 返回回到上一模块

- **WHEN** 用户在 Android App 中从今日切换到推进、记录或系统
- **AND** 用户触发系统返回
- **THEN** 系统 MUST 回到上一个移动端模块
- **AND** 系统 MUST NOT 因一次模块返回直接退出应用

### Requirement: Android mobile backlog remains offline-capable / Android 收纳箱离线可用

系统 MUST 在 Android App 离线状态下支持移动端收纳箱的查看、维护和安排，并写入应用私有本地存储。

#### Scenario: Android backlog edits persist offline / Android 离线收纳编辑可保留
- **WHEN** Android 设备离线
- **AND** 用户在「推进」页收纳箱新增、编辑、删除或安排任务
- **THEN** 系统 MUST 将操作写入 Android 应用私有本地存储
- **AND** 用户关闭并重新打开 Android App 后 MUST 看到操作结果

#### Scenario: Android backlog keeps existing task payload / Android 收纳保持现有任务载荷
- **WHEN** Android App 执行收纳箱任务操作
- **THEN** 系统 MUST 复用现有任务数据结构
- **AND** 系统 MUST 使用现有同步载荷表达收纳和安排结果
- **AND** 系统 MUST NOT 创建 Android 专属收纳任务模型

### Requirement: Android record page preserves capture and reflection save paths / Android 记录页保留灵感与反思保存路径

系统 MUST 在 Android App 中优化记录页交互时，保留灵感和每日反思的现有保存目标。

#### Scenario: Android inspiration still saves to inspiration vault / Android 灵感仍保存到灵感库
- **WHEN** 用户在 Android App 的「记录」页保存灵感
- **THEN** 系统 MUST 将记录保存到灵感库
- **AND** 系统 MUST 保留用户填写的来源和自定义标签

#### Scenario: Android reflection still saves to reflection library / Android 反思仍保存到反思库
- **WHEN** 用户在 Android App 的「记录」页保存反思
- **THEN** 系统 MUST 将记录保存为每日反思
- **AND** 系统 MUST NOT 将反思保存到灵感库

### Requirement: Android mobile UI optimization does not break core navigation / Android 移动端优化不破坏核心导航

系统 MUST 在本次移动端 UI 优化后继续支持 Android 手机端底部导航和返回手势。

#### Scenario: Optimized pages remain reachable / 优化后页面仍可访问
- **WHEN** 用户在 Android App 中使用底部导航
- **THEN** 用户 MUST 能继续进入今日、推进、记录和系统模块
- **AND** 系统 MUST NOT 新增替代现有四模块的第五个主导航入口

#### Scenario: Android back behavior remains section-based / Android 返回仍按模块回退
- **WHEN** 用户在 Android App 中从一个移动模块切换到另一个移动模块
- **AND** 用户触发系统返回
- **THEN** 系统 MUST 回到上一个移动端模块
- **AND** 系统 MUST NOT 因 UI 优化直接退出应用

### Requirement: Android mobile style preference is local-first / Android 移动端风格偏好本机优先

系统 MUST 允许 Android App 在用户开启本机独立风格后保持当前设备的移动端视觉设置。

#### Scenario: Android local-only style survives restart / Android 本机独立风格重启保留
- **WHEN** 用户在 Android App 中开启本机独立风格并选择移动端视觉风格
- **AND** 用户关闭并重新打开 Android App
- **THEN** 系统 MUST 保持该 Android 设备的移动端风格
- **AND** 系统 MUST NOT 要求联网同步才能恢复本机风格

#### Scenario: Android local-only style does not block data sync / Android 本机风格不阻塞数据同步
- **WHEN** 用户开启本机独立风格
- **AND** 用户继续执行 COS 数据同步
- **THEN** 系统 MUST 继续同步任务、灵感、反思和其他业务数据
- **AND** 系统 MUST NOT 因本机风格偏好阻止 V3 同步

