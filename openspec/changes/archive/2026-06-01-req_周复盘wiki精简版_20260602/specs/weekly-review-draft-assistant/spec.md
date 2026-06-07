## MODIFIED Requirements

> 中文：修改需求

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
