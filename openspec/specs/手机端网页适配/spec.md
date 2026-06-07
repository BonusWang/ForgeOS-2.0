# 手机端网页适配 Specification

## Purpose
定义 Forge-OS 在手机网页视口和 Android WebView 中的可读性、导航、任务推进、记录沉淀、输入法避让和桌面不回退要求。
## Requirements
### Requirement: 手机端页面整体可读且不产生全局横向溢出

系统 MUST 在 360px 到 767px 的手机网页视口下保持主要页面内容可读，并避免页面主体产生全局横向滚动。

#### Scenario: 周看板页面适配手机视口

- **WHEN** 用户在 360px 到 767px 宽度的手机网页视口打开周看板
- **THEN** 页面主体内容不会超出视口造成全局横向滚动
- **AND** 今日进度、每日反思和已启用模块按单列或可读布局展示

#### Scenario: 反思库和系统页适配手机视口

- **WHEN** 用户在 360px 到 767px 宽度的手机网页视口打开反思库或系统页
- **THEN** 原本并排的主要内容区域按单列展示
- **AND** 标题、正文、按钮和卡片内容不发生明显重叠或裁切

### Requirement: 手机端顶部导航入口保持可访问

系统 MUST 在手机网页视口下保留品牌、周看板、反思库、周复盘、系统页、风格切换、模块管理和主题切换入口，并确保这些入口可点击。

#### Scenario: 手机端导航不遮挡核心入口

- **WHEN** 用户在手机网页视口查看顶部导航
- **THEN** 品牌区域和导航操作区域不会互相覆盖
- **AND** 核心页面入口、模块入口、主题入口和风格切换入口均可通过点击或横向滚动访问

#### Scenario: 当前页面状态在手机端可识别

- **WHEN** 用户在手机网页视口切换周看板、反思库、周复盘或系统页
- **THEN** 当前页面入口仍以现有 active 或 aria-current 状态呈现
- **AND** 页面切换不改变原有页面状态枚举或业务逻辑

### Requirement: 手机端任务看板使用局部横向滚动

系统 MUST 将周任务看板的多列内容限制在看板区域内部横向滚动，不能让整页因任务列宽度而横向溢出。

#### Scenario: 用户浏览一周任务列

- **WHEN** 用户在手机网页视口查看周任务看板
- **THEN** 待安排任务、周一到周日和待澄清列在看板滚动区域内横向排列
- **AND** 用户可以在该区域内横向滚动查看全部列
- **AND** 页面主体本身不需要横向滚动

#### Scenario: 周复盘入口在手机看板中可用

- **WHEN** 用户在手机网页视口查看任务看板头部操作区
- **THEN** 上一周、下一周、本周和周复盘入口不会互相重叠
- **AND** 周复盘入口仍可打开对应周复盘页面

### Requirement: 手机端表单和弹层保持可操作

系统 MUST 在手机网页视口下约束表单、模块选择器和反思详情弹层的尺寸，使用户可以阅读、输入、保存和关闭。

#### Scenario: 周复盘表单可输入并保存

- **WHEN** 用户在手机网页视口打开周复盘页面
- **THEN** 三个复盘输入框宽度适配视口
- **AND** 保存按钮可见且可点击

#### Scenario: 模块选择器适配手机视口

- **WHEN** 用户在手机网页视口打开模块选择器
- **THEN** 弹层内容不会超出视口宽度
- **AND** 用户可以滚动查看模块列表、切换模块并关闭弹层

#### Scenario: 反思详情弹层适配手机视口

- **WHEN** 用户在手机网页视口打开反思详情弹层
- **THEN** 弹层内容在视口内展示并可滚动
- **AND** 用户可以查看详情、进入编辑和关闭弹层

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

### Requirement: 桌面端布局不因手机端适配回退

系统 MUST 保持桌面端现有主要布局和功能入口，不因手机端适配造成桌面视口下的明显排版回退。

#### Scenario: 桌面端主要页面保持现有结构

- **WHEN** 用户在桌面网页或 Electron 常规宽度下打开周看板、反思库、周复盘或系统页
- **THEN** 页面继续使用现有桌面布局结构
- **AND** 顶部导航、看板、表单、弹层和模块入口仍可正常使用

### Requirement: Android today module supports quick task entry / 安卓今日模块支持快速新增任务

系统 MUST 在 Android/手机端「今日」模块提供可触达的快速新增任务入口，使用户可以在当前页面直接创建今天的任务。

#### Scenario: Inline add button is reachable from today commitments / 今日承诺标题右侧新增入口可触达

- **WHEN** 用户在 Android 或手机网页视口打开「今日」模块
- **THEN** 页面 MUST 在「今日承诺」标题区域展示一个小型 `+` 新增任务入口
- **AND** 新增入口 MUST 与今日承诺任务区建立明确视觉归属
- **AND** 新增入口 MUST 保留适合手机点击的触控热区
- **AND** 页面 MUST NOT 使用右下角大型悬浮 `+` 按钮作为主要新增入口

#### Scenario: Add button opens a bottom task input panel / 点击新增按钮打开底部任务输入面板

- **WHEN** 用户点击 `+` 新增任务入口
- **THEN** 系统展示底部任务输入面板
- **AND** 面板包含任务输入框、取消操作和添加任务操作
- **AND** 面板保持在当前手机视口内，不产生横向溢出

#### Scenario: Saving a non-empty task creates today's task / 保存非空输入创建今日任务

- **WHEN** 用户在底部任务输入面板输入非空任务内容并点击添加任务
- **THEN** 系统将该内容保存为今天日期的 active 任务
- **AND** 新任务进入与桌面周看板相同的任务数据流
- **AND** 今日承诺和今日完成计数可基于该任务更新

#### Scenario: Empty task input is not submitted / 空任务输入不提交

- **WHEN** 用户未输入内容或只输入空白字符
- **THEN** 添加任务操作不可提交或不会创建任务
- **AND** 系统不生成空白今日任务

### Requirement: Mobile record timestamps use device-local display time / 手机端记录时间使用设备本地展示时间

系统 MUST 在手机端记录流中按设备本地时区展示记录时间，同时保持底层存储时间格式适合跨端同步。

#### Scenario: Mobile capture history shows local time / 手机记录流显示本地时间

- **WHEN** 用户在手机端「记录」页保存一条灵感或反思记录
- **THEN** 最近保存列表展示的时间 MUST 按设备本地时间格式呈现
- **AND** 系统 MUST NOT 直接截取 UTC ISO 字符串作为可见时间

#### Scenario: Stored capture timestamp remains sync-safe / 记录存储时间保持可同步

- **WHEN** 手机端保存记录并写入灵感或反思数据
- **THEN** 系统底层 createdAt 或更新时间 MAY 继续使用 ISO 字符串
- **AND** COS 同步载荷和桌面端数据结构 MUST 不因本地时间展示而改变

### Requirement: Mobile progress supports task completion and maintenance / 手机端推进支持任务完成与维护

系统 MUST 在手机端「推进」页提供任务完成、取消完成、编辑描述、移动和删除能力，使用户无需回到桌面端即可处理本周核心任务。

#### Scenario: User toggles task completion on mobile progress / 用户在手机推进页切换任务完成状态

- **WHEN** 用户在手机端「推进」页展开某一天的任务明细并点击任务完成控件
- **THEN** 系统 MUST 将该任务切换为 completed 或 active 状态
- **AND** 本周已完成、待推进和完成率 MUST 基于最新任务状态更新
- **AND** 桌面周看板 MUST 通过同一任务数据看到该状态变化

#### Scenario: User edits task description on mobile progress / 用户在手机推进页编辑任务描述

- **WHEN** 用户在手机端「推进」页对任务选择编辑描述并保存非空内容
- **THEN** 系统 MUST 更新该任务的 content
- **AND** 更新后的描述 MUST 进入与桌面端相同的任务数据流
- **AND** 空白内容 MUST NOT 覆盖原任务描述

#### Scenario: User moves task from mobile progress / 用户在手机推进页移动任务

- **WHEN** 用户在手机端「推进」页对任务选择移动到明天或收纳
- **THEN** 系统 MUST 更新该任务日期为明天或 BACKLOG
- **AND** 当前选中周的任务列表和统计 MUST 反映移动后的结果

#### Scenario: User deletes task with confirmation on mobile progress / 用户在手机推进页确认删除任务

- **WHEN** 用户在手机端「推进」页对任务选择删除
- **THEN** 系统 MUST 要求确认后才删除任务
- **AND** 确认删除后该任务 MUST 从任务数据中移除
- **AND** 未确认时系统 MUST 保留原任务

### Requirement: Mobile progress supports week navigation and historical review / 手机端推进支持周切换与历史复盘查看

系统 MUST 在手机端「推进」页支持切换周，使用户可以查看历史周任务和历史周复盘记录。

#### Scenario: User navigates to previous and next weeks / 用户切换上一周和下一周

- **WHEN** 用户在手机端「推进」页点击上一周、下一周或本周入口
- **THEN** 系统 MUST 按选中周展示该周日期范围、任务统计和每日任务
- **AND** 本周入口 MUST 将视图恢复到当前自然周

#### Scenario: User views historical weekly review on mobile / 用户在手机端查看历史周复盘

- **WHEN** 用户切换到已有周复盘记录的历史周
- **THEN** 系统 MUST 展示该周已保存的周复盘内容或摘要
- **AND** 系统 MUST NOT 只允许查看当前周记录

### Requirement: Mobile progress day cards are collapsible / 手机端推进日期卡片可收起

系统 MUST 允许用户在手机端「推进」页展开或收起日期卡片，使查看后续日期时不需要长距离滚动。

#### Scenario: User collapses an expanded day / 用户收起已展开日期

- **WHEN** 用户点击已展开日期的日期头
- **THEN** 系统 MUST 收起该日期任务明细
- **AND** 该日期卡片 MUST 保留摘要和状态信息

#### Scenario: User reopens a collapsed day / 用户重新展开已收起日期

- **WHEN** 用户点击已收起日期的日期头
- **THEN** 系统 MUST 展开该日期任务明细
- **AND** 系统 MUST 保持其他日期的收起状态不被意外重置

### Requirement: Mobile record page separates quick capture from structured reflection / 手机端记录页区分快速捕捉与结构化沉淀

系统 MUST 在手机端「记录」页通过「灵感 / 反思」页内分段切换区分快速捕捉与结构化沉淀，并让两者共享一致交互框架但保持内容语义独立。

#### Scenario: Record page exposes inspiration and reflection as segmented modes / 记录页提供灵感和反思分段模式

- **WHEN** 用户打开手机端「记录」页
- **THEN** 系统 MUST 在页面上方提供「灵感 / 反思」分段切换入口
- **AND** 默认模式 MUST 保持灵感快速捕捉可立即进入
- **AND** 用户 MUST 无需向下长距离滚动即可切换到反思

#### Scenario: Segmented modes share interaction framework / 分段模式共享交互框架

- **WHEN** 用户在「灵感」和「反思」之间切换
- **THEN** 两个模式 MUST 使用一致的标题区、说明区、收起/展开入口、纵向流程链、输入区和最近记录区
- **AND** 切换模式 MUST NOT 改变底部主导航或跳出「记录」页

#### Scenario: Inspiration and reflection content remains separate / 灵感和反思内容保持独立

- **WHEN** 用户查看任一分段模式
- **THEN** 系统 MUST 只展示当前模式对应的文案、字段、流程节点、输入提示和最近记录
- **AND** 灵感最近记录 MUST NOT 混入反思记录
- **AND** 反思最近记录 MUST NOT 混入灵感记录
- **AND** 反思 MUST 继续保存到当前每日反思模板或反思库，不得误入灵感库

### Requirement: Mobile inspiration capture uses a progressive workflow / 手机端灵感捕捉使用递进工作流

系统 MUST 在手机端「记录」页将灵感捕捉组织为想法、来源、标签和确认保存的纵向流程链，来源和标签保持可选。

#### Scenario: Inspiration workflow is displayed as a vertical process chain / 灵感流程展示为纵向流程链

- **WHEN** 用户进入「记录」页的「灵感」模式
- **THEN** 系统 MUST 展示 `01 想法`、`02 来源`、`03 标签`、`04 确认` 的纵向流程链
- **AND** 流程链 MUST 通过节点、连线、当前状态、已完成状态和未开始状态表达步骤关系
- **AND** 系统 MUST NOT 只把 `01` 到 `04` 展示为普通上下排列的步骤块

#### Scenario: User enters idea before optional metadata / 用户先输入想法再补可选信息

- **WHEN** 用户打开手机端灵感捕捉入口
- **THEN** 系统 MUST 先展示想法输入步骤
- **AND** 来源和标签输入 MUST NOT 在初始步骤同时展开为长表单

#### Scenario: User can skip source and tags / 用户可跳过来源和标签

- **WHEN** 用户已输入想法并进入来源或标签步骤
- **THEN** 系统 MUST 允许用户跳过来源或标签
- **AND** 跳过后用户仍可进入确认步骤并保存灵感

#### Scenario: Saved inspiration keeps source and custom tags / 保存灵感保留来源和自定义标签

- **WHEN** 用户在递进流程中填写来源或标签并保存
- **THEN** 系统 MUST 将来源写入灵感记录
- **AND** 系统 MUST 将逗号分隔的标签写入灵感标签集合
- **AND** 最近灵感列表 MUST 展示非系统标签和来源信息

#### Scenario: Inspiration explanatory copy is not duplicated / 灵感说明文案不重复

- **WHEN** 用户查看「灵感」模式顶部说明和灵感库归属信息
- **THEN** 系统 MUST 避免重复解释同一保存目的
- **AND** 系统 MUST NOT 在灵感库说明中使用会把灵感误导为反思的文案

### Requirement: Mobile reflection capture follows the daily reflection template / 手机端反思捕捉遵循每日反思模板

系统 MUST 在手机端「记录」页使用与灵感一致的交互框架承载反思流程，并将反思保存到反思库，不得误入灵感库。

#### Scenario: Reflection workflow uses matching vertical process chain / 反思流程使用匹配的纵向流程链

- **WHEN** 用户进入「记录」页的「反思」模式
- **THEN** 系统 MUST 展示 `01 障碍`、`02 方法`、`03 有效/无效`、`04 确认` 的纵向流程链
- **AND** 反思流程 MUST 使用与灵感流程一致的节点、连线、当前/已完成/未开始状态表达
- **AND** 反思流程 MUST NOT 使用与灵感不同的卡片模型或单独的保存状态卡模型

#### Scenario: Reflection is saved as daily reflection / 反思保存为每日反思

- **WHEN** 用户在手机端提交反思
- **THEN** 系统 MUST 调用每日反思保存流程
- **AND** 最近反思列表 MUST 将该记录标记为反思库记录
- **AND** 系统 MUST NOT 将反思保存为灵感记录

#### Scenario: Effectiveness is part of reflection answers / 成效属于反思内容

- **WHEN** 用户填写每日反思
- **THEN** 系统 MUST 将有效/无效或成效内容作为每日反思模板字段
- **AND** 系统 MUST NOT 将成效作为手机端独立同级记录类型

#### Scenario: Existing daily reflection prompts before editing / 已有每日反思先提示再编辑

- **WHEN** 当天已经存在每日反思且用户再次点击写反思
- **THEN** 系统 MUST 先提示当天反思已保存
- **AND** 用户 MAY 选择查看/编辑原反思

#### Scenario: Control level uses a select field / 掌控感使用下拉选择

- **WHEN** 用户填写掌控感
- **THEN** 系统 MUST 提供 1 到 10 的下拉选项
- **AND** 系统 MUST 用辅助文字说明 `1`、`5`、`10` 的含义
- **AND** 系统 MUST NOT 使用容易产生 `03` 等异常值的数字输入框

### Requirement: Mobile navigation supports Android back behavior / 手机端导航支持 Android 返回行为

系统 MUST 将手机端底部导航切换写入浏览器历史，使 Android 返回手势可以按移动模块回退。

#### Scenario: User navigates between mobile sections / 用户切换移动端模块

- **WHEN** 用户点击手机端底部导航从今日切换到推进、记录或系统
- **THEN** 系统 MUST 更新当前移动模块
- **AND** 系统 MUST 将该模块状态写入浏览器历史

#### Scenario: Android back returns to previous mobile section / Android 返回回到上一移动模块

- **WHEN** 用户使用 Android 返回手势或浏览器返回
- **THEN** 系统 MUST 回到上一个手机端模块
- **AND** 系统 MUST NOT 直接退出应用或跳到桌面端页面状态

### Requirement: Mobile progress shows a cross-week backlog inbox / 手机端推进展示跨周待安排任务

系统 MUST 在手机端「推进」页提供跨周公共待安排任务区，使用户无需回到桌面端即可查看和处理已确认但未安排日期的任务。

#### Scenario: Backlog inbox appears after Sunday / 待安排任务展示在周日之后
- **WHEN** 用户在手机端「推进」页查看任意一周
- **THEN** 系统 MUST 在周日任务节点下方展示待安排任务
- **AND** 待安排任务 MUST 展示 `date === 'BACKLOG'` 的任务

#### Scenario: Backlog inbox remains cross-week / 待安排任务不随周切换变化
- **WHEN** 用户在手机端「推进」页切换上一周、本周或下一周
- **THEN** 系统 MUST 继续展示同一批待安排任务
- **AND** 系统 MUST NOT 将待安排任务解释为当前查看周的第八天任务

#### Scenario: User can maintain backlog tasks / 用户可维护待安排任务
- **WHEN** 用户在手机端待安排任务区中新建、编辑或删除任务
- **THEN** 系统 MUST 更新同一套任务数据流
- **AND** 桌面端任务数据 MUST 能看到这些变更

### Requirement: Mobile backlog tasks can be scheduled into dates / 手机端待安排任务可安排到日期

系统 MUST 允许用户从手机端待安排任务区把未安排任务派发到具体日期。

#### Scenario: Schedule panel shows current week shortcuts / 安排面板展示当前周快捷日期
- **WHEN** 用户在待安排任务上点击安排
- **THEN** 系统 MUST 打开底部安排面板
- **AND** 面板 MUST 展示当前查看周周一到周日的快捷日期
- **AND** 面板 MUST 提供选择其他日期的入口

#### Scenario: Scheduling moves task out of backlog / 安排后任务离开待安排区
- **WHEN** 用户在安排面板选择一个日期
- **THEN** 系统 MUST 将该任务移动到所选日期
- **AND** 该任务 MUST 从待安排任务列表移除
- **AND** 所选日期任务列表 MUST 展示该任务

### Requirement: Mobile task actions stay usable with lighter visual weight / 手机端任务操作保持可用且减轻视觉重量

系统 MUST 在保留任务操作能力的同时，降低手机端任务操作按钮的视觉占用。

#### Scenario: Task actions remain available / 任务操作仍可用
- **WHEN** 用户在手机端「推进」页展开任务
- **THEN** 系统 MUST 继续提供编辑、移动到明天、收纳和删除能力
- **AND** 系统 MUST 继续允许完成和取消完成任务

#### Scenario: Task action UI is compact but touchable / 操作区紧凑但可触达
- **WHEN** 手机端展示多个任务卡片
- **THEN** 任务操作区 MUST 比当前大圆按钮方案更适合扫读
- **AND** 任务操作控件 MUST 保持可点击的触控区域
- **AND** 任务标题和操作按钮 MUST NOT 发生重叠

#### Scenario: Delete still requires confirmation / 删除仍需确认
- **WHEN** 用户在任务操作区点击删除
- **THEN** 系统 MUST 要求确认或进入明确危险确认态
- **AND** 未确认时系统 MUST 保留原任务

### Requirement: Mobile inspiration capture uses vertical progressive nodes / 手机端灵感捕捉使用纵向递进节点

系统 MUST 将手机端「记录」页的灵感捕捉流程统一为可点击的纵向 Stepper，避免同一功能块同时出现外侧装饰线和内侧步骤线两种流程表达。

#### Scenario: User sees vertical inspiration steps / 用户看到纵向灵感步骤
- **WHEN** 用户打开手机端「记录」页并展开灵感捕捉
- **THEN** 系统 MUST 以从上到下的顺序展示 `01 想法`、`02 来源`、`03 标签`、`04 确认`
- **AND** 每个步骤 MUST 是可点击的步骤按钮
- **AND** 系统 MUST NOT 同时展示外侧装饰流程线作为同一流程的主表达

#### Scenario: Current step expands while other steps summarize / 当前步骤展开其他步骤摘要
- **WHEN** 用户处于灵感捕捉流程中的某一步
- **THEN** 当前步骤 MUST 展示输入或确认内容
- **AND** 已完成步骤 MUST 展示摘要
- **AND** 未完成步骤 MUST 显示下一步需要补充的内容

#### Scenario: Optional source and tags remain skippable / 来源和标签仍可跳过
- **WHEN** 用户已输入想法并进入来源或标签步骤
- **THEN** 系统 MUST 允许用户跳过来源或标签
- **AND** 用户跳过后仍可进入确认步骤并保存灵感

### Requirement: Mobile record composers can collapse in place / 手机端记录输入可在本页收起

系统 MUST 允许用户在手机端「记录」页收起已展开的灵感或反思输入区。

#### Scenario: User collapses inspiration composer / 用户收起灵感输入
- **WHEN** 用户点击写一条灵感并展开输入区
- **AND** 用户再次触发收起操作
- **THEN** 系统 MUST 收起灵感输入区
- **AND** 用户 MUST NOT 需要切换到底部其他模块才能收起

#### Scenario: User collapses reflection composer / 用户收起反思输入
- **WHEN** 用户点击写一条反思并展开输入区
- **AND** 用户再次触发收起操作
- **THEN** 系统 MUST 收起反思输入区
- **AND** 用户 MUST NOT 需要切换到底部其他模块才能收起

#### Scenario: Unsaved non-empty input is not silently lost / 非空未保存输入不静默丢失
- **WHEN** 用户在已展开输入区填写了非空内容
- **AND** 用户触发收起操作
- **THEN** 系统 MUST 保留草稿或要求用户确认放弃
- **AND** 系统 MUST NOT 静默清空用户输入

### Requirement: Mobile record page has separate recent lists / 手机端记录页拆分最近保存列表

系统 MUST 在手机端「记录」页分别展示最近灵感和最近反思，并取消混合记录流和重复历史标题。

#### Scenario: Inspiration card shows recent inspirations / 灵感卡片展示最近灵感
- **WHEN** 用户在手机端保存一条灵感
- **THEN** 系统 MUST 在 Stepper 流程区之后展示最近灵感
- **AND** 最近灵感 MUST 展示设备本地时间
- **AND** 最近灵感 MAY 展示来源和非系统标签
- **AND** 流程线 MUST NOT 延伸到最近灵感列表

#### Scenario: Reflection card shows recent reflections / 反思卡片展示最近反思
- **WHEN** 用户在手机端保存或编辑每日反思
- **THEN** 系统 MUST 在 Stepper 流程区之后展示最近反思
- **AND** 最近反思 MUST 展示设备本地时间
- **AND** 最近反思 MUST NOT 与最近灵感混在同一列表
- **AND** 系统 MUST NOT 展示重复的 `最近保存` 标题

#### Scenario: Mixed record stream is removed / 混合记录流被取消
- **WHEN** 用户查看手机端「记录」页
- **THEN** 系统 MUST NOT 展示底部混合的「记录流 / 最近保存」卡片
- **AND** 灵感和反思的保存反馈 MUST 分别出现在对应卡片内

### Requirement: Mobile visual style can be local-only / 手机端视觉风格可设为本机独立

系统 MUST 在手机端系统页提供本机独立风格开关，使用户可以固定手机端视觉风格而不影响桌面端。

#### Scenario: Mobile style follows desktop by default / 默认跟随桌面
- **WHEN** 用户从未开启本机独立风格
- **THEN** 手机端视觉风格 MUST 继续跟随当前同步或桌面视觉风格
- **AND** 系统 MUST 保持现有默认行为

#### Scenario: User enables local-only mobile style / 用户开启本机独立风格
- **WHEN** 用户在手机端系统页开启本机独立风格
- **THEN** 手机端视觉风格切换 MUST 只影响当前移动端环境
- **AND** 该切换 MUST NOT 改变桌面端同步后的视觉风格

#### Scenario: User returns to followed style / 用户恢复跟随风格
- **WHEN** 用户关闭本机独立风格
- **THEN** 手机端 MUST 重新使用跟随桌面的视觉风格
- **AND** 系统 MUST 保留主题、模块和同步配置的现有行为

### Requirement: Mobile today page uses lightweight action station layout / 手机端今日页使用轻量行动台布局

系统 MUST 在手机端「今日」页使用轻量行动台布局，让用户先看到今日焦点，再处理今日承诺任务。

#### Scenario: Today focus card is compact / 今日焦点卡片保持紧凑

- **WHEN** 用户在 Android 或手机网页视口打开「今日」模块
- **THEN** 页面顶部 MUST 展示轻量「今日焦点」状态卡
- **AND** 状态卡 MUST 包含日期/周几、页面定位、今日焦点、心境、能量、完成数、进度条和今日原则
- **AND** 状态卡 MUST NOT 通过过厚卡片或重复大面积内容挤压今日承诺区域

#### Scenario: Today commitments are shown as a focused task area / 今日承诺作为独立任务区展示

- **WHEN** 用户查看「今日」模块的今日承诺
- **THEN** 页面 MUST 在今日焦点卡片下方展示独立的「今日承诺」任务区
- **AND** 任务区 MUST 展示 `最多盯住三件事` 或等价的轻量副文案
- **AND** 任务项 MUST 使用紧凑任务行或薄卡展示
- **AND** 系统 MUST NOT 使用厚重大卡套小卡的结构展示每条任务
