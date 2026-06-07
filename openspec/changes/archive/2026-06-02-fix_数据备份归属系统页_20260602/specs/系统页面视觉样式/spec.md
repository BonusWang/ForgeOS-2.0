## MODIFIED Requirements

> 中文：修改需求

### Requirement: Functional module titles are Chinese / 功能模块标题使用中文

系统 MUST（必须）将主要功能模块标题从英文改为对应中文，提升中文用户的理解效率，并确保系统维护类模块归属系统页。

#### Scenario: Dashboard module titles are Chinese / 周看板模块标题为中文

- **WHEN** 用户查看周看板页面
- **THEN** 今日进度、每日反思、时间块、我的原则、日历、娱乐、习惯追踪、情绪追踪和灵感库等模块标题使用中文
- **AND** 周看板不展示数据备份模块

#### Scenario: Reflection and system module titles are Chinese / 反思库和系统模块标题为中文

- **WHEN** 用户查看反思库或系统页
- **THEN** 反思库、能力阅读、能力训练、更新、数据备份、关于和每日真相等模块标题使用中文
- **AND** 数据备份入口归属系统页
- **AND** 系统页数据备份入口展示导出数据和导入数据操作
- **AND** 系统页不展示重复的数据仪式、封存罪证和展开旧账入口
