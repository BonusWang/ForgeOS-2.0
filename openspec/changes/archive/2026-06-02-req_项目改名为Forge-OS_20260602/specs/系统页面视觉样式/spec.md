## MODIFIED Requirements

> 中文：修改需求

### Requirement: Product brand uses Forge-OS identity / 产品品牌使用 Forge-OS 标识

系统 MUST（必须）将页面展示品牌调整为 `Forge-OS`，并展示 slogan `Forge yourself —— 自己锻造自己`，用于强调个人目标确认与持续成长的产品定位。

#### Scenario: Brand appears in navigation / 导航展示品牌

- **WHEN** 用户查看顶部导航
- **THEN** 导航主品牌显示 `Forge-OS`
- **AND** 新风格下可见 `Forge yourself —— 自己锻造自己`

#### Scenario: Brand text is not auto-translated / 品牌文案不被自动翻译

- **WHEN** 浏览器或翻译插件尝试翻译页面
- **THEN** 顶部品牌 `Forge-OS` 和 slogan MUST（必须）保留原文
- **AND** 不显示“伪造”“造假”等错误翻译

#### Scenario: Document title uses new brand / 文档标题使用新品牌

- **WHEN** 浏览器或 Electron 窗口显示页面标题
- **THEN** 标题使用 `Forge-OS`
- **AND** 不再使用 `ASCII Life OS`
