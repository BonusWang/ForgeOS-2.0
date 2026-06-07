# 系统页面视觉样式规范

## Purpose

本规范定义系统页面在原风格、orbit-general 参考风格与 Supabase 参考风格之间切换时的视觉、导航、交互和业务边界要求。能力目录和正文使用中文；OpenSpec 必需的结构关键字保持英文，以保证框架可以继续解析和校验。
## Requirements
### Requirement: Style toggle replaces separate new system page / 风格切换替代独立新系统页

系统 MUST（必须）使用风格切换入口在原风格、Claude 风格、Supabase 参考风格和 Dossier 风格之间切换，而不是通过 `[◇ 新系统]` 跳转到独立页面。

#### Scenario: Style toggle is available / 风格切换可用

- **WHEN** 用户查看应用导航
- **THEN** 导航展示风格切换入口
- **AND** 导航不展示 `[◇ 新系统]`

#### Scenario: Toggle cycles through visual styles / 可循环切换风格

- **WHEN** 用户连续点击风格切换入口
- **THEN** 系统在原风格、Claude 风格、Supabase 风格和 Dossier 风格之间循环
- **AND** 当前功能页面保持在同一业务页面上

### Requirement: New style preserves existing functional navigation / 新风格保留现有功能导航

新风格 MUST（必须）保留周看板、反思库、周复盘、系统页、模块管理和主题切换入口。

#### Scenario: New style navigation includes existing functions / 新风格导航包含现有功能

- **WHEN** 用户切换到新风格
- **THEN** 导航仍展示周看板、反思库、周复盘、系统、风格切换、模块和主题切换入口

#### Scenario: Original page state is reused / 复用原页面状态

- **WHEN** 用户在新风格下点击周看板、反思库或◇ 系统
- **THEN** 系统仍使用原有 `dashboard`、`reflection` 或 `system` 页面状态
- **AND** 不进入 `systemOrbit` 或其他新增业务页面状态

### Requirement: Style mode uses same data source and business logic / 风格模式使用同一数据源和业务逻辑

风格切换 MUST（必须）只改变视觉外壳和交互样式，不改变数据源或业务逻辑。

#### Scenario: Existing page components remain functional source / 原页面组件仍是功能来源

- **WHEN** 用户在任一风格下使用周看板、反思库或系统页
- **THEN** 功能仍由现有页面组件和 store 数据提供
- **AND** 不复制更新检查、数据备份、任务或反思等业务逻辑

#### Scenario: Data contracts remain unchanged / 数据契约保持不变

- **WHEN** 风格切换能力实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约、更新检查逻辑和备份逻辑均不发生变化

### Requirement: Supabase style provides developer-product dark treatment / Supabase 风格提供开发者产品深色处理

Supabase 风格 MUST（必须）参考 `Supabase-showcase` 的深色开发者产品语言，使用黑色背景、绿色强调色、圆角表面、克制边框和系统字体，同时保持业务 DOM 结构不变。

#### Scenario: Supabase style uses expected visual tokens / Supabase 风格使用预期视觉 token

- **WHEN** 用户切换到 Supabase 风格
- **THEN** 页面使用深色背景、绿色强调色和圆角卡片表面
- **AND** 风格按钮展示可识别的 Supabase 当前状态提示

#### Scenario: Supabase style preserves business structure / Supabase 风格保留业务结构

- **WHEN** 用户在 Supabase 风格下查看周看板、反思库、周复盘或系统页
- **THEN** 页面业务模块集合、模块顺序和业务操作语义保持不变
- **AND** store 结构、持久化格式和 Electron IPC 合约不发生变化

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

### Requirement: Functional module titles are Chinese / 功能模块标题使用中文

系统 MUST（必须）将主要功能模块标题从英文改为对应中文，提升中文用户的理解效率，并确保系统维护类模块归属系统页。

#### Scenario: Dashboard module titles are Chinese / 周看板模块标题为中文

- **WHEN** 用户查看周看板页面
- **THEN** 今日进度、每日反思、时间块、我的原则、日历、娱乐、习惯追踪、情绪追踪和灵感库等模块标题使用中文
- **AND** 周看板不展示数据备份模块

#### Scenario: Reflection and system module titles are Chinese / 反思库和系统模块标题为中文

- **WHEN** 用户查看反思库或系统页
- **THEN** 反思库、能力阅读、能力训练、更新、数据备份、关于和每日真相等模块标题使用中文
- **AND** 数据备份入口归属系统页
- **AND** 系统页数据备份入口展示导出数据和导入数据操作
- **AND** 系统页不展示重复的数据仪式、封存罪证和展开旧账入口

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

#### Scenario: Backlog is first task board column / 待安排任务是周看板第一列

- **WHEN** 用户查看周看板横向任务列
- **THEN** 待安排任务列显示在最左侧第一列
- **AND** 周一到周日按日期顺序显示在待安排任务之后
- **AND** OKR 待澄清列保留在周任务列之后

### Requirement: Orbit page headers avoid explanatory copy / Orbit 页头避免说明性文案

系统 MUST（必须）移除 orbit 页头中解释实现方式或数据复用方式的 summary 文案，让页面更像产品界面而不是需求注释。

#### Scenario: Main orbit headers show no summary paragraph / 主要 orbit 页头不显示说明段落

- **WHEN** 用户切换到新风格并查看周看板、反思库或系统页
- **THEN** 页头只展示短标签、页面标题和状态卡片
- **AND** 不展示“用同一套任务”“反思库、OKR”“保留原来的更新”等说明句

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

应用导航 MUST（必须）保持现有功能入口和文案不变，同时优化按钮尺寸、激活态、焦点态和窄屏表现，让桌面端和窄屏下都可快速扫描。

#### Scenario: Navigation entries use workflow order / 导航入口使用工作流顺序

- **WHEN** 用户查看应用导航
- **THEN** 页面主入口按 `01 周看板`、`02 周复盘`、`03 反思库`、`04 系统` 顺序展示
- **AND** 工具入口仍展示风格、模块和主题切换入口
- **AND** 不新增、不删除、不重命名这些入口

#### Scenario: Navigation has stable interaction states / 导航交互状态稳定

- **WHEN** 用户 hover、focus 或切换当前页面
- **THEN** 导航按钮提供清晰但克制的视觉反馈
- **AND** 按钮文本不因状态切换出现明显宽度跳动

#### Scenario: Weekly review is not duplicated in dashboard toolbar / 周复盘不在周看板工具栏重复出现

- **WHEN** 用户查看周看板工具栏
- **THEN** 工具栏只展示周切换相关操作
- **AND** 不展示重复的 `[周复盘]` 快捷按钮
- **AND** 用户仍可通过左侧导航进入周复盘页面

### Requirement: Layout polish preserves business behavior / 排版优化保持业务行为

系统 MUST（必须）只通过页面层容器、网格、间距和视觉交互呈现优化布局，不得改变业务模块集合、业务操作语义或数据契约。

#### Scenario: Business modules remain same per page / 每页业务模块集合保持不变

- **WHEN** 页面排版优化完成
- **THEN** 周看板、反思库、周复盘和系统页保留各自原有业务模块集合
- **AND** 捕捉入口 MUST 表达为待澄清或捕捉入口
- **AND** 任务看板中的 `BACKLOG` 列 MUST 表达为待安排任务
- **AND** 不因排版优化新增、删除或复制业务模块

#### Scenario: Style toggle shares the same structure / 风格切换共享同一结构

- **WHEN** 用户在 classic、Claude、Supabase 和 Dossier 风格之间切换
- **THEN** 当前业务页面的 DOM 业务模块集合和顺序保持一致
- **AND** 风格切换只改变视觉表现

#### Scenario: Data and operations remain unchanged / 数据与操作保持不变

- **WHEN** 页面排版优化实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约和业务操作逻辑均不发生变化

### Requirement: Desktop dashboard uses today-first weekly layout / 桌面端周看板使用今日优先周布局

系统 MUST（必须）在桌面端周看板页面使用“今日执行 + 周看板 + 辅助沉淀”的基础排版，使用户先看到今日状态，再进入本周任务规划，最后查看辅助模块。

#### Scenario: Today execution strip appears before weekly board / 今日执行条位于周看板之前

- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 今日进度、每日反思、时间块和情绪追踪作为今日执行条展示在本周任务看板之前
- **AND** 这些模块继续使用原有组件和数据源

#### Scenario: Weekly board remains the primary planning area / 周看板仍是主要规划区

- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 本周任务看板位于今日执行条之后
- **AND** 待安排任务、周一至周日任务列和周切换保持可用
- **AND** 周复盘入口通过左侧主导航保持可用
- **AND** 任务添加、完成和拖拽逻辑不发生变化

#### Scenario: Supporting modules are grouped after weekly board / 辅助模块位于周看板之后

- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 我的原则、日历、娱乐、习惯追踪和灵感库展示在周看板之后的辅助沉淀区
- **AND** 模块的原有交互和数据逻辑不发生变化

### Requirement: Dashboard layout optimization preserves business behavior / 周看板排版优化保持业务行为

系统 MUST（必须）只通过模块重排、布局容器、网格、间距和视觉交互优化来改善桌面端体验，不得改变业务处理逻辑。

#### Scenario: Store and data contracts remain unchanged / 数据契约保持不变

- **WHEN** 桌面端周看板排版优化实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约和模块业务操作语义均不发生变化

#### Scenario: Style modes share the same dashboard structure / 风格模式共享同一周看板结构

- **WHEN** 用户在原风格、Claude 风格、Supabase 风格和 Dossier 风格之间切换
- **THEN** 所有风格使用同一套周看板基础排版
- **AND** 风格切换不得改变今日执行条、周看板和辅助沉淀区的模块集合或顺序

#### Scenario: Desktop layout remains readable without horizontal page overflow / 桌面端布局可读且页面不横向溢出

- **WHEN** 用户在电脑端常见宽度查看周看板页面
- **THEN** 今日执行条和辅助沉淀区使用适合桌面扫描的网格布局
- **AND** 页面主体不产生非预期的横向滚动
- **AND** 周看板自身可以保留内部横向滚动以承载任务列

### Requirement: Module picker is a scannable settings panel / 模块管理是可扫描设置面板

模块管理弹窗 MUST（必须）以可扫描的设置面板呈现模块名称、说明、默认区域和启用状态，同时复用原有模块启用数据与切换逻辑。

#### Scenario: Module picker shows module state and area / 模块弹窗展示状态和区域

- **WHEN** 用户打开模块管理
- **THEN** 弹窗以卡片或设置项形式展示所有可配置模块
- **AND** 每个模块展示模块名称、说明、主区或侧栏归属以及启用或隐藏状态
- **AND** 弹窗展示当前启用数量

#### Scenario: Module picker preserves toggle logic / 模块弹窗保留切换逻辑

- **WHEN** 用户点击模块管理中的模块项
- **THEN** 系统仍使用原有模块启用切换逻辑更新 `enabledModules`
- **AND** 不改变 `MODULE_REGISTRY`、默认启用规则、store 结构或持久化格式

#### Scenario: Module picker remains bounded / 模块弹窗边界稳定

- **WHEN** 用户在桌面端或窄屏下打开模块管理
- **THEN** 弹窗内容在视口内滚动或降级为单列
- **AND** 页面不产生非预期横向溢出

### Requirement: Dashboard interaction details remain anchored and readable / 周看板交互细节保持定位与可读性

系统 MUST（必须）确保周看板中的日历弹出框和今日进度条在桌面端、滚动页面和不同视觉风格下保持稳定、可读且不产生误导性视觉块。

#### Scenario: Calendar popup stays anchored after page scroll / 页面滚动后日历弹出框保持锚定

- **WHEN** 用户在周看板页面滚动后点击日历日期
- **THEN** 日期详情弹出框贴近被点击的日期格展示
- **AND** 弹出框不因页面滚动偏移被推到页面底部或远离日历卡片
- **AND** 弹出框保持在当前视口可见区域内

#### Scenario: Today progress uses stable visual track / 今日进度使用稳定视觉轨道

- **WHEN** 用户查看今日进度卡片
- **THEN** 进度条使用 CSS 轨道和填充层表达完成比例
- **AND** 不使用 `░` 等空段字符绘制未完成部分
- **AND** 进度百分比文案仍然可见

#### Scenario: Today progress track fills the card rhythm / 今日进度轨道填充卡片节奏

- **WHEN** 今日进度卡片展示完成比例
- **THEN** 进度条主体占据卡片可用横向空间的约 80%
- **AND** 不因固定短字符宽度在卡片中留下大面积无意义空白
- **AND** 能力面板等其它复用进度条的紧凑展示不被强制拉长

### Requirement: Claude style provides visual and interaction treatment / Claude 风格提供视觉与交互处理

Claude 风格 MUST 参考 `docs/DESIGN/DESIGN-claude.md` 的视觉系统，使用 Forge-OS 自有内容实现暖奶油画布、珊瑚主色、浅色卡片表面、深色产品表面、细边框、8/12/16 圆角层级和编辑感标题层级。

#### Scenario: Claude style uses expected visual tokens / Claude 风格使用预期视觉 token

- **WHEN** 用户切换到 Claude 风格
- **THEN** 页面 MUST 使用暖奶油背景、珊瑚强调色、浅色卡片表面、细边框和克制圆角
- **AND** 标题字体 MUST 使用开源或系统替代字体栈
- **AND** 系统 MUST NOT 引入商业字体文件

#### Scenario: Claude style avoids copied brand content / Claude 风格不照抄品牌内容

- **WHEN** Claude 风格实现完成
- **THEN** 页面 MUST 继续展示 Forge-OS 品牌、导航文案和业务内容
- **AND** 页面 MUST NOT 复制 Claude 或 Anthropic 的 Logo、品牌文案或产品叙事

#### Scenario: Claude style preserves business structure / Claude 风格保留业务结构

- **WHEN** 用户在 Claude 风格下查看周看板、反思库、周复盘、月度 OKR 或系统页
- **THEN** 页面业务模块集合、模块顺序和业务操作语义 MUST 保持不变
- **AND** store 结构、持久化格式、Electron IPC 合约和同步逻辑 MUST 不发生变化
