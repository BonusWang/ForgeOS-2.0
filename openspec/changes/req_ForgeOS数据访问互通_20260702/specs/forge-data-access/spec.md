## ADDED Requirements

### Requirement: 任务查询

系统 SHALL 支持 AI 查询 ForgeOS 中的任务列表,支持按日期和状态筛选。

#### Scenario: 查询今日待办
- **WHEN** AI 查询今日任务
- **THEN** 返回今日未完成任务清单(包含 id, content, column, status)

#### Scenario: 查询本周任务
- **WHEN** AI 查询本周任务
- **THEN** 返回本周所有任务及完成状态

### Requirement: 任务创建

系统 SHALL 支持 AI 在 ForgeOS 中新建任务。

#### Scenario: 创建任务
- **WHEN** AI 新建任务(content, date, column)
- **THEN** 任务出现在 ForgeOS 对应看板列
- **AND** 浏览器侧同步状态标记为待同步

### Requirement: 任务状态修改

系统 SHALL 支持 AI 修改 ForgeOS 中任务的状态。

#### Scenario: 标记任务完成
- **WHEN** AI 将活跃任务标记为完成
- **THEN** 任务状态更新为 completed
- **AND** 记录 completedAt 时间戳

### Requirement: 复盘读写

系统 SHALL 支持 AI 读取和写入 ForgeOS 中的每日复盘。复盘支持双入口:Forge 结构化录入和 wiki 自由写作,均为 AI 参考源。

#### Scenario: 写入每日复盘
- **WHEN** AI 写入复盘(date, templateId, answers, tags)
- **THEN** 复盘出现在 ForgeOS 反思记录

#### Scenario: 读取复盘历史
- **WHEN** AI 查询近期复盘
- **THEN** 返回指定时间范围内的复盘列表

### Requirement: 上下文数据读取

系统 SHALL 支持 AI 读取心情、能量、OKR 进度作为上下文参考。

#### Scenario: 读取心情能量趋势
- **WHEN** AI 查询近期心情能量
- **THEN** 返回近期 MoodEntry 列表(date, mood, energy, note)

#### Scenario: 读取 OKR 进度
- **WHEN** AI 查询当前 OKR
- **THEN** 返回当前周期的 Objective 及其 KeyResults 完成状态

### Requirement: 灵感捕获

系统 SHALL 支持 AI 将灵感或临时想法捕获到 ForgeOS 收集箱或灵感库。

#### Scenario: 添加灵感
- **WHEN** AI 添加灵感(content, tags)
- **THEN** 灵感出现在 ForgeOS 灵感库

### Requirement: 批量创建任务

系统 SHALL 支持 AI 从会话上下文中提炼多个事项,一次性批量创建任务。

#### Scenario: 整理会话内容到任务
- **WHEN** 用户说"整理任务到 FOS"或"把这些事项建到 ForgeOS"
- **AND** AI 从当前会话上下文中提炼出 N 条可执行事项
- **THEN** 批量创建 N 条任务,每条带日期和列
- **AND** 返回创建的任务列表

#### Scenario: 批量创建避免竞态
- **WHEN** AI 批量创建多条任务
- **THEN** 在单个 read-modify-write 周期内完成全部写入
- **AND** 不产生多次 GET/PUT 导致的数据覆盖

### Requirement: 会话复盘记录

系统 SHALL 支持 AI 将本次会话内容结构化为复盘记录写入 ForgeOS。

#### Scenario: 记录会话到复盘
- **WHEN** 用户说"记录这次会话到复盘"或"总结这次会话"
- **AND** AI 总结本次会话的关键内容
- **THEN** 结构化为复盘记录(date, answers, tags)写入 ForgeOS 反思记录
- **AND** tags 包含会话来源标记(如 "AI会话" / "Codex" / "Claude")

### Requirement: 目标拆解为 OKR

系统 SHALL 支持 AI 将一段目标描述拆解为 Objective + KeyResults 写入 ForgeOS。

#### Scenario: 从文本创建 OKR
- **WHEN** 用户说"把这个目标拆成 OKR"并提供目标描述
- **AND** AI 拆解出 1 个 Objective 和 N 个 KeyResults
- **THEN** 结构化写入 ForgeOS OKR
- **AND** 返回创建的 OKR

### Requirement: 灵感转任务

系统 SHALL 支持 AI 将已有灵感转换为带日期和列的任务。

#### Scenario: 灵感转任务
- **WHEN** 用户说"把这条灵感转成任务"
- **AND** AI 确认目标灵感 ID 和日期
- **THEN** 从灵感库取内容,创建为任务
- **AND** 灵感记录标记 convertedToTaskId

### Requirement: 周复盘草稿

系统 SHALL 支持 AI 读本周任务完成情况、每日反思和心情趋势,生成周复盘草稿。

#### Scenario: 生成周复盘草稿
- **WHEN** 用户说"帮我写周复盘"或"生成周复盘"
- **THEN** 系统读取本周所有任务完成情况和每日反思
- **AND** AI 生成周复盘草稿(完成什么 / 卡在哪 / 下周调整一件)
- **AND** 草稿返回给用户确认,确认后写入 ForgeOS

### Requirement: 效率洞察

系统 SHALL 支持 AI 读取近 N 天的任务完成率和心情能量关联,给出趋势分析。

#### Scenario: 查询效率趋势
- **WHEN** 用户说"最近效率怎么样"或"分析下效率"
- **THEN** 系统读取近 N 天的任务完成率和心情能量数据
- **AND** AI 给出趋势分析(完成率趋势 / 心情能量关联 / 建议)
