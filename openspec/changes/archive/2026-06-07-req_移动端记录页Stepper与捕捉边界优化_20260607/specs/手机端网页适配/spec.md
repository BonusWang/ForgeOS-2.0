## MODIFIED Requirements
> 中文：修改已有需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。

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

#### Scenario: Optional inspiration steps can be skipped / 可选灵感步骤可跳过
- **WHEN** 用户只填写想法但未填写来源或标签
- **THEN** 系统 MUST 允许用户跳过来源或标签
- **AND** 用户跳过后仍可进入确认步骤并保存灵感

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
