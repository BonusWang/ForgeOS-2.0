## MODIFIED Requirements

> 中文：修改需求

### Requirement: Orbit style provides visual and interaction treatment / Orbit 风格提供视觉与交互处理

新风格 MUST（必须）参考 `orbit-general` 的暖色纸面背景、浅色表面、细边框、克制状态色、卡片质感和轻量交互反馈，并避免显示与该风格明显冲突的旧像素风空状态图片。

#### Scenario: Orbit empty states avoid mismatched pixel art / Orbit 空状态避免不匹配像素图

- **WHEN** 用户切换到 orbit 风格
- **AND** 页面展示空状态
- **THEN** 系统不展示旧像素风空状态图片
- **AND** 空状态文案仍然可见

#### Scenario: Original style keeps existing empty state image / 原风格保留空状态图片

- **WHEN** 用户使用原风格
- **THEN** 系统仍可展示现有空状态图片
- **AND** 不改变原风格空状态布局
