## ADDED Requirements
> 中文：新增需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。

### Requirement: Mobile record workflows use clickable steppers / 移动记录流程使用可点击 Stepper
系统 MUST 在移动端「记录」页将灵感和反思流程呈现为真正可点击的 Stepper，而不是装饰性流程线。

#### Scenario: User clicks an inspiration step / 用户点击灵感步骤
- **WHEN** 用户打开移动端「记录」页并展开灵感捕捉
- **THEN** 系统 MUST 展示 `01 想法`、`02 来源`、`03 标签`、`04 确认` 四个可点击步骤
- **AND** 用户点击任一步骤后，当前输入区 MUST 切换到对应步骤
- **AND** 来源和标签步骤 MUST 可跳过但可返回补充

#### Scenario: User clicks a reflection step / 用户点击反思步骤
- **WHEN** 用户打开移动端「记录」页并展开反思捕捉
- **THEN** 系统 MUST 使用同一套 Stepper 视觉和交互
- **AND** 反思 Stepper MUST 支持多于四个步骤
- **AND** 反思步骤 MUST 根据每日反思模板问题和确认步骤生成

### Requirement: Record workflow and history are visually separated / 记录流程和历史列表视觉分离
系统 MUST 将移动端记录页的捕捉流程区与最近历史区分离，避免流程线穿过历史内容。

#### Scenario: User views inspiration history / 用户查看最近灵感
- **WHEN** 用户在灵感模式查看记录页
- **THEN** 系统 MUST 只展示一个历史区标题 `最近灵感`
- **AND** 最近灵感 MUST 位于 Stepper 流程区之后
- **AND** 流程线 MUST NOT 延伸到最近灵感列表

#### Scenario: User views reflection history / 用户查看最近反思
- **WHEN** 用户在反思模式查看记录页
- **THEN** 系统 MUST 只展示一个历史区标题 `最近反思`
- **AND** 最近反思 MUST 位于 Stepper 流程区之后
- **AND** 系统 MUST NOT 展示重复的 `最近保存` 标题

### Requirement: Capture and backlog wording stays distinct / 捕捉与待安排文案边界清晰
系统 MUST 用用户可见文案区分未澄清想法和已确认未排期任务。

#### Scenario: User sees capture inbox wording / 用户看到捕捉入口文案
- **WHEN** 用户查看桌面捕捉入口、OKR/能力待处理入口或移动端待澄清列表
- **THEN** `inboxItems` MUST 被表达为待澄清、捕捉或加入待澄清
- **AND** 系统 MUST NOT 将 `inboxItems` 主要表达为任务收纳箱

#### Scenario: User sees backlog task wording / 用户看到待安排任务文案
- **WHEN** 用户查看周看板第一列或移动端跨周任务积压区
- **THEN** `tasks.date === 'BACKLOG'` MUST 被表达为待安排任务
- **AND** 系统 MUST 保持 `BACKLOG` 数据语义和现有同步载荷不变
