## ADDED Requirements
> 中文：新增需求

### Requirement: Mobile progress shows a cross-week backlog inbox / 手机端推进展示跨周收纳箱

系统 MUST 在手机端「推进」页提供跨周公共收纳箱，使用户无需回到桌面端即可查看和处理被收纳的任务。

#### Scenario: Backlog inbox appears after Sunday / 收纳箱展示在周日之后
- **WHEN** 用户在手机端「推进」页查看任意一周
- **THEN** 系统 MUST 在周日任务节点下方展示收纳箱
- **AND** 收纳箱 MUST 展示 `date === 'BACKLOG'` 的任务

#### Scenario: Backlog inbox remains cross-week / 收纳箱不随周切换变化
- **WHEN** 用户在手机端「推进」页切换上一周、本周或下一周
- **THEN** 系统 MUST 继续展示同一批收纳箱任务
- **AND** 系统 MUST NOT 将收纳箱任务解释为当前查看周的第八天任务

#### Scenario: User can maintain backlog tasks / 用户可维护收纳箱任务
- **WHEN** 用户在手机端收纳箱中新建、编辑或删除任务
- **THEN** 系统 MUST 更新同一套任务数据流
- **AND** 桌面端任务数据 MUST 能看到这些变更

### Requirement: Mobile backlog tasks can be scheduled into dates / 手机端收纳任务可安排到日期

系统 MUST 允许用户从手机端收纳箱把未安排任务派发到具体日期。

#### Scenario: Schedule panel shows current week shortcuts / 安排面板展示当前周快捷日期
- **WHEN** 用户在收纳箱任务上点击安排
- **THEN** 系统 MUST 打开底部安排面板
- **AND** 面板 MUST 展示当前查看周周一到周日的快捷日期
- **AND** 面板 MUST 提供选择其他日期的入口

#### Scenario: Scheduling moves task out of backlog / 安排后任务离开收纳箱
- **WHEN** 用户在安排面板选择一个日期
- **THEN** 系统 MUST 将该任务移动到所选日期
- **AND** 该任务 MUST 从收纳箱列表移除
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

系统 MUST 将手机端灵感捕捉流程统一为纵向递进节点，避免同一功能块同时出现横向步骤和竖向节点两种流程表达。

#### Scenario: User sees vertical inspiration steps / 用户看到纵向灵感步骤
- **WHEN** 用户打开手机端「记录」页并展开灵感捕捉
- **THEN** 系统 MUST 以从上到下的顺序展示 `01 想法`、`02 来源`、`03 标签`、`04 确认`
- **AND** 系统 MUST NOT 同时展示横向 stepper 作为同一流程的主表达

#### Scenario: Current step expands while other steps summarize / 当前步骤展开其他步骤摘要
- **WHEN** 用户处于灵感捕捉流程中的某一步
- **THEN** 当前步骤 MUST 展示输入或确认内容
- **AND** 已完成步骤 MUST 展示摘要
- **AND** 未开始步骤 MUST 以弱化状态展示

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

系统 MUST 在手机端「记录」页分别展示最近灵感和最近反思，并取消混合记录流。

#### Scenario: Inspiration card shows recent inspirations / 灵感卡片展示最近灵感
- **WHEN** 用户在手机端保存一条灵感
- **THEN** 系统 MUST 在灵感卡片内展示最近灵感
- **AND** 最近灵感 MUST 展示设备本地时间
- **AND** 最近灵感 MAY 展示来源和非系统标签

#### Scenario: Reflection card shows recent reflections / 反思卡片展示最近反思
- **WHEN** 用户在手机端保存或编辑每日反思
- **THEN** 系统 MUST 在反思卡片内展示最近反思
- **AND** 最近反思 MUST 展示设备本地时间
- **AND** 最近反思 MUST NOT 与最近灵感混在同一列表

#### Scenario: Mixed record stream is removed / 混合记录流被取消
- **WHEN** 用户打开手机端「记录」页
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
