## ADDED Requirements
<!-- 中文：新增需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。 -->

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
