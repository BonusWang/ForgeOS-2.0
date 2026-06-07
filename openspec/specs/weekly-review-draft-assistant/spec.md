# weekly-review-draft-assistant Specification

## Purpose
TBD - created by archiving change req_周复盘草稿助手_20260601. Update Purpose after archive.
## Requirements
### Requirement: Weekly review draft is generated from existing data / 周复盘草稿基于现有数据生成

系统 MUST（必须）基于现有周任务、当前月目标/OKR、能力数据和本周反思生成周复盘草稿。

#### Scenario: Draft generation uses local data only / 草稿生成只使用本地数据

- **WHEN** 用户生成周复盘草稿
- **THEN** 系统只读取本地 store 中的任务、目标、能力和反思数据
- **AND** 不调用外部 AI、外部 API 或网络模型

#### Scenario: Source data is read-only / 源数据只读

- **WHEN** 系统生成周复盘草稿
- **THEN** 任务、目标、能力和已有反思数据不被修改
- **AND** 只有用户点击保存后才写入新的周复盘记录

### Requirement: Draft follows three-part structure / 草稿使用三段式结构

系统 MUST（必须）使用更适合启动阶段的三段式周复盘结构。

#### Scenario: Lite template uses three starter prompts / 精简模板使用三个启动问题

- **WHEN** 用户创建或编辑周复盘
- **THEN** 模板只包含“本周完成了什么”、“本周卡在哪里”、“下周只调整一件什么事”
- **AND** 不强制用户填写复杂事实报告、教练追问和多条建议

#### Scenario: Weekly evidence stays lightweight / 周证据保持轻量

- **WHEN** 用户查看周复盘页
- **THEN** 系统展示本周任务完成数、未完成数和任务列表
- **AND** 这些证据作为辅助信息，不替代用户手写复盘

### Requirement: User can edit and save weekly review / 用户可以编辑并保存周复盘

系统 MUST（必须）让用户在独立周复盘视图中编辑并保存周复盘，保存后进入反思沉淀。

#### Scenario: Weekly review opens as wiki page / 周复盘以 Wiki 页面打开

- **WHEN** 用户点击主导航“周复盘”
- **THEN** 系统展示独立周复盘视图
- **AND** 当前周以“一周一页”的方式展示

#### Scenario: Weekly board entry opens weekly review page / 周看板入口打开周复盘页

- **WHEN** 用户从周看板点击周复盘入口
- **THEN** 系统打开当前周的周复盘视图
- **AND** 不只展示临时弹窗

### Requirement: Weekly review does not overwrite daily reflection / 周复盘不覆盖每日反思

系统 MUST（必须）支持周复盘记录与每日反思共存，不能因为日期相同而覆盖当天每日反思。

#### Scenario: Daily reflection exists on save date / 保存日期已有每日反思

- **WHEN** 用户保存周复盘时当天已经存在每日反思
- **THEN** 系统保留已有每日反思
- **AND** 额外创建或更新对应周周期的周复盘记录

#### Scenario: Weekly review is identifiable / 周复盘可识别

- **WHEN** 用户查看反思沉淀或反思库
- **THEN** 周复盘记录能够被识别为“周复盘”
- **AND** 系统保留周周期信息用于未来月度成长报告

### Requirement: Monthly growth report path is reserved / 预留月度成长报告路径

系统 MUST（必须）为未来月度成长报告保留读取周复盘的路径，但第一版不实现月报生成。

#### Scenario: Weekly review stores period evidence / 周复盘保存周期证据

- **WHEN** 周复盘记录保存成功
- **THEN** 记录包含可用于识别周周期的信息
- **AND** 未来月成长页面可以按月份聚合这些周复盘

#### Scenario: Monthly report is not generated in first version / 第一版不生成月报

- **WHEN** 周复盘草稿助手第一版完成
- **THEN** 系统不生成月度成长报告
- **AND** 只完成周复盘草稿生成、编辑和保存闭环
