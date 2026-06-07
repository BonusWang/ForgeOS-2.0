## MODIFIED Requirements

> 中文：修改需求

### Requirement: First version layout is aligned and consistent / 第一版本布局对齐且一致

系统 MUST（必须）检查并优化主要页面的功能模块排版，使卡片宽度、间距、标题层级、响应式布局和关键列顺序保持一致。

#### Scenario: Main pages use consistent spacing / 主要页面间距一致

- **WHEN** 用户查看周看板、反思库或系统页
- **THEN** 页面主要内容使用统一最大宽度
- **AND** 模块之间使用一致的横向和纵向间距

#### Scenario: Responsive layout remains readable / 响应式布局保持可读

- **WHEN** 用户在窄屏下查看页面
- **THEN** 模块按单列或可横向滚动方式展示
- **AND** 标题和按钮不发生明显重叠或裁切

#### Scenario: Backlog is first task board column / 收纳箱是周看板第一列

- **WHEN** 用户查看周看板横向任务列
- **THEN** 收纳箱列显示在最左侧第一列
- **AND** 周一到周日按日期顺序显示在收纳箱之后
- **AND** OKR 收纳列保留在周任务列之后
