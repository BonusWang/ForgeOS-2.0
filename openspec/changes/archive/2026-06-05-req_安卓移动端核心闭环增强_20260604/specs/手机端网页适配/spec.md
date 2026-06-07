## ADDED Requirements
<!-- 中文：新增需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。 -->

### Requirement: Mobile record timestamps use device-local display time / 手机端记录时间使用设备本地展示时间

系统 MUST 在手机端记录流中按设备本地时区展示记录时间，同时保持底层存储时间格式适合跨端同步。

#### Scenario: Mobile capture history shows local time / 手机记录流显示本地时间

- **WHEN** 用户在手机端「记录」页保存一条灵感、反思或成效记录
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

### Requirement: Mobile record page separates quick capture from structured reflection / 手机端记录页区分快速捕捉与结构化沉淀

系统 MUST 在手机端「记录」页将灵感快速捕捉与反思、成效等结构化沉淀区分层展示，避免把不同认知成本的输入误导为同级分类。

#### Scenario: Inspiration remains the primary quick capture path / 灵感保持主快速捕捉路径

- **WHEN** 用户打开手机端「记录」页
- **THEN** 系统 MUST 优先提供低摩擦的快速捕捉入口
- **AND** 该入口 MUST 可以保存为灵感并进入记录流

#### Scenario: Reflection and evidence are presented as structured deposits / 反思和成效作为结构化沉淀展示

- **WHEN** 用户在手机端「记录」页查看沉淀区
- **THEN** 系统 MUST 将反思和成效展示为补充今日沉淀的操作
- **AND** 保存反思或成效时 MUST 继续写入当前每日反思模板的对应字段
- **AND** 反思和成效 MUST NOT 与灵感入口完全平铺为同级 tab

### Requirement: Mobile inspiration capture uses a progressive workflow / 手机端灵感捕捉使用递进工作流

系统 MUST 在手机端「记录」页将灵感捕捉组织为想法、来源、标签和确认保存的递进流程，来源和标签保持可选。

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
- **AND** 最近保存记录流 MUST 展示非系统标签和来源信息

### Requirement: Mobile reflection capture follows the daily reflection template / 手机端反思捕捉遵循每日反思模板

系统 MUST 在手机端「记录」页使用桌面端每日反思模板输入反思，且保存到反思库，不得误入灵感库。

#### Scenario: Reflection is saved as daily reflection / 反思保存为每日反思

- **WHEN** 用户在手机端提交反思
- **THEN** 系统 MUST 调用每日反思保存流程
- **AND** 最近保存记录流 MUST 将该记录标记为反思库记录
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
