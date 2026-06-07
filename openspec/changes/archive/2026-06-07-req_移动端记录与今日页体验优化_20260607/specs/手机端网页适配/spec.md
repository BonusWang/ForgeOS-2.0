## ADDED Requirements
> 中文：新增需求

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

## MODIFIED Requirements
> 中文：修改需求

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
