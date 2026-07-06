## ADDED Requirements

### Requirement: 周复盘快照导出

系统 SHALL 将 ForgeOS 周复盘周期性导出为知识库 Markdown,使 wiki 成为复盘汇聚地。

#### Scenario: 导出周复盘
- **WHEN** 触发周复盘导出
- **THEN** 将本周复盘(含每日反思汇总)生成预览 Markdown 返回给 AI
- **AND** AI 向用户展示预览内容
- **AND** 用户确认内容齐全后,AI 派 wiki-curator 按知识库规范写入指定目录
- **AND** 用户未确认前不得写入

### Requirement: 心情能量趋势导出

系统 SHALL 将 ForgeOS 心情能量数据周期性导出。

#### Scenario: 导出趋势数据
- **WHEN** 触发趋势导出
- **THEN** 将近期心情能量数据汇总为预览 Markdown 返回给 AI
- **AND** 经用户确认后由 wiki-curator 写入

### Requirement: OKR 进度导出

系统 SHALL 将 ForgeOS OKR 进度周期性导出。

#### Scenario: 导出 OKR 进度
- **WHEN** 触发 OKR 导出
- **THEN** 将当前周期 OKR 及关键结果完成状态生成预览 Markdown 返回给 AI
- **AND** 经用户确认后由 wiki-curator 写入

### Requirement: 导出确认机制

导出操作 MUST 包含用户确认环节,确认前不得写入知识库。落库操作 SHALL 由 wiki-curator 智能体按知识库规范执行,不由主 agent 直接写文件。

#### Scenario: 用户确认后落库
- **WHEN** AI 将周报预览展示给用户
- **AND** 用户确认内容齐全
- **THEN** AI 派 wiki-curator 按 wiki 规范写入指定目录
- **AND** wiki-curator 处理 frontmatter / 命名 / 分类 / 关联

#### Scenario: 用户未确认
- **WHEN** AI 将周报预览展示给用户
- **AND** 用户表示内容不全或需调整
- **THEN** 不得写入知识库
- **AND** AI 等待用户补充或调整后重新生成预览

### Requirement: 复盘双入口归位

系统 MUST 支持复盘双入口:Forge 结构化录入和 wiki 自由写作,导出后 wiki 成为复盘全集汇聚地。

#### Scenario: Forge 复盘汇入 wiki
- **WHEN** Forge 中有结构化复盘记录
- **THEN** 导出后与 wiki 中自由写作的复盘合并存在于知识库
- **AND** AI 通过知识库检索时可同时读到两种来源的复盘
