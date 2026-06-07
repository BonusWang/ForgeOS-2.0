## ADDED Requirements

### Requirement: Main pages use a unified workspace shell / 主页面使用统一工作台外壳

系统 MUST（必须）为周看板、反思库、周复盘和系统页提供一致的页面外壳、最大宽度、模块间距和响应式边界，使电脑端页面看起来属于同一套工作台系统。

#### Scenario: Main pages share page container constraints / 主页面共享容器约束

- **WHEN** 用户在桌面端查看周看板、反思库、周复盘或系统页
- **THEN** 页面主体使用一致的外层容器宽度和横向内边距策略
- **AND** 页面不产生非预期的横向滚动

#### Scenario: Main pages use consistent module spacing / 主页面模块间距一致

- **WHEN** 用户在主页面之间切换
- **THEN** 主要模块之间使用一致的纵向和横向间距
- **AND** 模块标题、卡片边界和分栏节奏保持稳定

### Requirement: Navigation remains stable and scannable / 导航保持稳定可扫

顶部导航 MUST（必须）保持现有功能入口和文案不变，同时优化按钮尺寸、激活态、焦点态和横向滚动表现，让桌面端和窄屏下都可快速扫描。

#### Scenario: Navigation entries remain unchanged / 导航入口不变

- **WHEN** 用户查看顶部导航
- **THEN** 导航仍展示周看板、反思库、周复盘、◇ 系统、`[◇ 风格切换]`、`[⊕ 模块]` 和主题切换按钮
- **AND** 不新增、不删除、不重命名这些入口

#### Scenario: Navigation has stable interaction states / 导航交互状态稳定

- **WHEN** 用户 hover、focus 或切换当前页面
- **THEN** 导航按钮提供清晰但克制的视觉反馈
- **AND** 按钮文本不因状态切换出现明显宽度跳动

### Requirement: Layout polish preserves business behavior / 排版优化保持业务行为

系统 MUST（必须）只通过页面层容器、网格、间距和视觉交互呈现优化布局，不得改变业务模块集合、业务操作语义或数据契约。

#### Scenario: Business modules remain same per page / 每页业务模块集合保持不变

- **WHEN** 页面排版优化完成
- **THEN** 周看板、反思库、周复盘和系统页保留各自原有业务模块集合
- **AND** 不因排版优化新增、删除或复制业务模块

#### Scenario: Style toggle shares the same structure / 风格切换共享同一结构

- **WHEN** 用户在 classic 和 orbit 风格之间切换
- **THEN** 当前业务页面的 DOM 业务模块集合和顺序保持一致
- **AND** 风格切换只改变视觉表现

#### Scenario: Data and operations remain unchanged / 数据与操作保持不变

- **WHEN** 页面排版优化实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约和业务操作逻辑均不发生变化
