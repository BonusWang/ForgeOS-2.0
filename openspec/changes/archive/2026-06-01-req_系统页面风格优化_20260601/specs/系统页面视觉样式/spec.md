## ADDED Requirements

> 中文：新增需求

### Requirement: Style toggle replaces separate new system page / 风格切换替代独立新系统页

系统 SHALL 使用 `[◇ 风格切换]` 在原风格和 orbit-general 参考风格之间切换，而不是通过 `[◇ 新系统]` 跳转到独立页面。

#### Scenario: Style toggle is available / 风格切换可用

- **WHEN** 用户查看顶部导航
- **THEN** 导航展示 `[◇ 风格切换]`
- **AND** 导航不展示 `[◇ 新系统]`

#### Scenario: Toggle returns to original style / 可切回原风格

- **WHEN** 用户在新风格下再次点击 `[◇ 风格切换]`
- **THEN** 系统切回原风格
- **AND** 当前功能页面保持在同一业务页面上

### Requirement: New style preserves existing functional navigation / 新风格保留现有功能导航

新风格 SHALL 保留周看板、反思库、系统页、模块管理和主题切换入口。

#### Scenario: New style navigation includes existing functions / 新风格导航包含现有功能

- **WHEN** 用户切换到新风格
- **THEN** 导航仍展示周看板、反思库、◇ 系统、[◇ 风格切换]、[⊕ 模块] 和主题切换按钮

#### Scenario: Original page state is reused / 复用原页面状态

- **WHEN** 用户在新风格下点击周看板、反思库或◇ 系统
- **THEN** 系统仍使用原有 `dashboard`、`reflection` 或 `system` 页面状态
- **AND** 不进入 `systemOrbit` 或其他新增业务页面状态

### Requirement: Style mode uses same data source and business logic / 风格模式使用同一数据源和业务逻辑

风格切换 SHALL 只改变视觉外壳和交互样式，不改变数据源或业务逻辑。

#### Scenario: Existing page components remain functional source / 原页面组件仍是功能来源

- **WHEN** 用户在任一风格下使用周看板、反思库或系统页
- **THEN** 功能仍由现有页面组件和 store 数据提供
- **AND** 不复制更新检查、数据备份、任务或反思等业务逻辑

#### Scenario: Data contracts remain unchanged / 数据契约保持不变

- **WHEN** 风格切换能力实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约、更新检查逻辑和备份逻辑均不发生变化

### Requirement: Orbit style provides visual and interaction treatment / Orbit 风格提供视觉与交互处理

新风格 SHALL 参考 `orbit-general` 的暖色纸面背景、浅色表面、细边框、克制状态色、卡片质感和轻量交互反馈。

#### Scenario: Orbit visual treatment is applied / 应用 orbit 视觉处理

- **WHEN** 用户切换到新风格
- **THEN** 应用外壳、导航、背景、卡片表面、边框和强调色呈现 orbit-general 参考风格
- **AND** ASCII Life OS 的文案、模块名称和产品识别仍然清晰可见

#### Scenario: Responsive navigation remains usable / 响应式导航保持可用

- **WHEN** 用户在窄屏下使用新风格
- **THEN** 导航入口和页面内容不发生明显重叠或文字裁切
