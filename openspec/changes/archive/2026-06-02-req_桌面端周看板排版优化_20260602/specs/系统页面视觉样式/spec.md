## ADDED Requirements

### Requirement: Desktop dashboard uses today-first weekly layout / 桌面端周看板使用今日优先周布局

系统 MUST（必须）在桌面端周看板页面使用“今日执行 + 周看板 + 辅助沉淀”的基础排版，使用户先看到今日状态，再进入本周任务规划，最后查看辅助模块。

#### Scenario: Today execution strip appears before weekly board / 今日执行条位于周看板之前

- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 今日进度、每日反思、时间块和情绪追踪作为今日执行条展示在本周任务看板之前
- **AND** 这些模块继续使用原有组件和数据源

#### Scenario: Weekly board remains the primary planning area / 周看板仍是主要规划区

- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 本周任务看板位于今日执行条之后
- **AND** 收纳箱、周一至周日任务列、周切换和周复盘入口保持可用
- **AND** 任务添加、完成、拖拽和周复盘打开逻辑不发生变化

#### Scenario: Supporting modules are grouped after weekly board / 辅助模块位于周看板之后

- **WHEN** 用户在桌面端查看周看板页面
- **THEN** 我的原则、日历、娱乐、习惯追踪和灵感库展示在周看板之后的辅助沉淀区
- **AND** 模块的原有交互和数据逻辑不发生变化

### Requirement: Dashboard layout optimization preserves business behavior / 周看板排版优化保持业务行为

系统 MUST（必须）只通过模块重排、布局容器、网格、间距和视觉交互优化来改善桌面端体验，不得改变业务处理逻辑。

#### Scenario: Store and data contracts remain unchanged / 数据契约保持不变

- **WHEN** 桌面端周看板排版优化实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约和模块业务操作语义均不发生变化

#### Scenario: Style modes share the same dashboard structure / 风格模式共享同一周看板结构

- **WHEN** 用户在原风格和 orbit 风格之间切换
- **THEN** 两种风格使用同一套周看板基础排版
- **AND** 风格切换不得改变今日执行条、周看板和辅助沉淀区的模块集合或顺序

#### Scenario: Desktop layout remains readable without horizontal page overflow / 桌面端布局可读且页面不横向溢出

- **WHEN** 用户在电脑端常见宽度查看周看板页面
- **THEN** 今日执行条和辅助沉淀区使用适合桌面扫描的网格布局
- **AND** 页面主体不产生非预期的横向滚动
- **AND** 周看板自身可以保留内部横向滚动以承载任务列
