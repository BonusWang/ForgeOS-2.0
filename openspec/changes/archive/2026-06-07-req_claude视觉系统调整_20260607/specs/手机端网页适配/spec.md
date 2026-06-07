## MODIFIED Requirements
> 中文：修改需求

### Requirement: 手机端适配同时支持 classic 与 orbit 风格

系统 MUST 在 classic 原风格和 Claude 风格下都提供手机端网页适配，并保持两种风格的业务行为一致。旧的 `orbit` 本机风格偏好 MUST 只作为兼容输入读取，并在后续写入时迁移为 `claude`。

#### Scenario: classic 风格手机端可用

- **WHEN** 用户在 classic 风格下使用手机网页视口
- **THEN** 周看板、反思库、周复盘、系统页和模块选择器均符合手机端布局要求

#### Scenario: Claude 风格手机端可用

- **WHEN** 用户切换到 Claude 风格并使用手机网页视口
- **THEN** 周看板、反思库、周复盘、系统页和模块选择器均符合手机端布局要求
- **AND** 风格切换只改变视觉呈现，不改变数据源、页面状态或业务逻辑

#### Scenario: Legacy orbit mobile preference maps to Claude / 旧 orbit 手机偏好映射为 Claude

- **WHEN** 手机端本机风格偏好中已保存旧值 `orbit`
- **THEN** 系统 MUST 将该偏好读取为 Claude 风格
- **AND** 后续写入的正式风格值 MUST 使用 `claude`
