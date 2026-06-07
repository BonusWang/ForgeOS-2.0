## MODIFIED Requirements
> 中文：修改已有需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。

### Requirement: Main pages keep existing business modules / 主页面保留现有业务模块
系统 MUST 在排版或文案优化中保留周看板、反思库、周复盘和系统页的业务模块集合，不因优化新增、删除或复制业务模块。

#### Scenario: Dashboard keeps original module set / 周看板保留原模块集合
- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 今日进度、每日反思、时间块、任务看板、我的原则、日历、娱乐、习惯追踪、情绪追踪、灵感库和轻量捕捉入口保持可用
- **AND** 捕捉入口 MUST 表达为待澄清或捕捉入口
- **AND** 任务看板中的 `BACKLOG` 列 MUST 表达为待安排任务
- **AND** 不因文案优化新增、删除或复制业务模块

### Requirement: Task board remains the main execution surface / 任务看板保持主要执行面
系统 MUST 在桌面端周看板页面保留任务看板作为主要执行区，并保持现有任务新增、完成、拖拽和排期逻辑。

#### Scenario: Task board follows today's execution strip / 任务看板跟随今日执行条
- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 本周任务看板位于今日执行条之后
- **AND** 待安排任务、周一至周日任务列和周切换保持可用
- **AND** 周复盘入口通过左侧主导航保持可用
- **AND** 任务添加、完成和拖拽逻辑不发生变化
