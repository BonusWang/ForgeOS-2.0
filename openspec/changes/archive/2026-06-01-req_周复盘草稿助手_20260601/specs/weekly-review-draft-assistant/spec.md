## ADDED Requirements

> 中文：新增需求

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

系统 MUST（必须）使用“事实报告、教练追问、下周调整建议”的三段式结构生成周复盘草稿。

#### Scenario: Facts summarize weekly evidence / 事实报告总结周证据

- **WHEN** 草稿生成完成
- **THEN** 事实报告展示本周完成任务、未完成任务、目标关联行动、能力训练证据和本周反思概况

#### Scenario: Coaching questions remain suggestive / 教练追问保持建议语气

- **WHEN** 草稿包含教练追问
- **THEN** 追问以草稿和建议语气呈现
- **AND** 不把规则模板输出伪装成确定的 AI 判断

#### Scenario: Next week suggestions are actionable / 下周建议可行动

- **WHEN** 草稿包含下周调整建议
- **THEN** 建议围绕保留、停止、拆小目标和明确能力训练动作展开

### Requirement: User can edit and save weekly review / 用户可以编辑并保存周复盘

系统 MUST（必须）让用户在保存前编辑周复盘草稿，并在确认后保存到反思沉淀。

#### Scenario: Draft opens in lightweight panel / 草稿在轻量面板中打开

- **WHEN** 用户从周执行页面点击周复盘草稿入口
- **THEN** 系统打开轻量面板或弹窗
- **AND** 不跳转到独立大页面

#### Scenario: Cancel does not persist data / 取消不写入数据

- **WHEN** 用户关闭或取消周复盘草稿面板
- **THEN** 系统不保存新的周复盘记录
- **AND** 不修改已有反思

#### Scenario: Save creates weekly review record / 保存创建周复盘记录

- **WHEN** 用户确认保存周复盘草稿
- **THEN** 系统在反思沉淀中创建“周复盘”记录
- **AND** 保存用户编辑后的最终内容

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
