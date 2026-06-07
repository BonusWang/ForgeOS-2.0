## ADDED Requirements

> 中文：新增需求

### Requirement: Product brand uses Forge identity / 产品品牌使用 Forge 标识

系统 MUST（必须）将页面展示品牌从 `ASCII LIFE OS` 调整为 `Forge`，并展示 slogan `Forge yourself —— 自己锻造自己`。

#### Scenario: Brand appears in navigation / 导航展示品牌

- **WHEN** 用户查看顶部导航
- **THEN** 导航主品牌显示 `Forge`
- **AND** 新风格下可见 `Forge yourself —— 自己锻造自己`

#### Scenario: Brand text is not auto-translated / 品牌文案不被自动翻译

- **WHEN** 浏览器或翻译插件尝试翻译页面
- **THEN** 顶部品牌 `Forge` 和 slogan MUST（必须）保留原文
- **AND** 不显示“伪造”“造假”等错误翻译

#### Scenario: Document title uses new brand / 文档标题使用新品牌

- **WHEN** 浏览器或 Electron 窗口显示页面标题
- **THEN** 标题使用 `Forge`
- **AND** 不再使用 `ASCII Life OS`

### Requirement: Functional module titles are Chinese / 功能模块标题使用中文

系统 MUST（必须）将主要功能模块标题从英文改为对应中文，提升中文用户的理解效率。

#### Scenario: Dashboard module titles are Chinese / 周看板模块标题为中文

- **WHEN** 用户查看周看板页面
- **THEN** 今日进度、每日反思、数据备份、时间块、我的原则、日历、娱乐、习惯追踪、情绪追踪和灵感库等模块标题使用中文

#### Scenario: Reflection and system module titles are Chinese / 反思库和系统模块标题为中文

- **WHEN** 用户查看反思库或系统页
- **THEN** 反思库、能力阅读、能力训练、更新、数据仪式、关于和每日真相等模块标题使用中文

### Requirement: First version layout is aligned and consistent / 第一版本布局对齐且一致

系统 MUST（必须）检查并优化主要页面的功能模块排版，使卡片宽度、间距、标题层级和响应式布局保持一致。

#### Scenario: Main pages use consistent spacing / 主要页面间距一致

- **WHEN** 用户查看周看板、反思库或系统页
- **THEN** 页面主要内容使用统一最大宽度
- **AND** 模块之间使用一致的横向和纵向间距

#### Scenario: Responsive layout remains readable / 响应式布局保持可读

- **WHEN** 用户在窄屏下查看页面
- **THEN** 模块按单列或可横向滚动方式展示
- **AND** 标题和按钮不发生明显重叠或裁切

### Requirement: Orbit page headers avoid explanatory copy / Orbit 页头避免说明性文案

系统 MUST（必须）移除 orbit 页头中解释实现方式或数据复用方式的 summary 文案，让页面更像产品界面而不是需求注释。

#### Scenario: Main orbit headers show no summary paragraph / 主要 orbit 页头不显示说明段落

- **WHEN** 用户切换到新风格并查看周看板、反思库或系统页
- **THEN** 页头只展示短标签、页面标题和状态卡片
- **AND** 不展示“用同一套任务”“反思库、OKR”“保留原来的更新”等说明句
