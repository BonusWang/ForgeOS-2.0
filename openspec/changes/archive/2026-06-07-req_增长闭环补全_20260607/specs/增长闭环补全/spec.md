## ADDED Requirements
<!-- 中文：新增需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。 -->

### Requirement: Dashboard provides lightweight capture inbox / Dashboard 提供轻量收集箱
系统 MUST 在 Dashboard 首屏提供轻量收集入口，使用户可以先记录普通想法，再澄清为现有任务或灵感实体。

#### Scenario: User captures and clarifies an inbox item / 用户收集并澄清事项
- **WHEN** 用户在 Dashboard 输入想法并提交
- **THEN** 系统将该想法加入现有 `inboxItems`
- **AND** 用户可以将该事项澄清为今日任务、收纳任务或灵感
- **AND** 用户可以删除该事项
- **AND** 系统 MUST NOT 新增桌面专属 capture 持久模型

#### Scenario: Inbox copy avoids OKR-only meaning / 收集箱文案避免 OKR 专属语义
- **WHEN** 系统展示待澄清列表
- **THEN** 文案 MUST 表达为待澄清入口
- **AND** 普通想法 MUST NOT 被强制表达为 Objective、KR 或 OKR 焦点

### Requirement: Module picker groups modules by Forge phases / 模块管理按 Forge 阶段分组
系统 MUST 在模块管理中按 Forge 阶段展示现有模块，使模块与成长闭环关系更清晰。

#### Scenario: User opens module picker / 用户打开模块管理
- **WHEN** 用户打开模块管理
- **THEN** 系统展示定向、捕捉、执行、复盘、成长证据和维护阶段
- **AND** 阶段分组 MUST 只影响展示
- **AND** 系统 MUST NOT 改变 `ModuleId`、`enabledModules` 或持久化字段

### Requirement: Growth evidence is derived from existing state / 成长证据从现有状态派生
系统 MUST 在周复盘、反思库和月度 OKR 页展示派生成长证据，帮助用户看见完成任务、能力加分、相关反思和目标进展。

#### Scenario: User reviews weekly evidence / 用户查看本周证据
- **WHEN** 用户打开周复盘
- **THEN** 系统展示完成任务、未完成任务、能力加分和相关反思
- **AND** 这些证据 MUST 从现有 tasks、reflections 和 ability fields 派生

#### Scenario: User opens growth evidence archive / 用户打开成长证据档案
- **WHEN** 用户打开反思库
- **THEN** 系统展示成长证据档案
- **AND** 档案聚合周复盘、完成目标、能力进展和近期反思
- **AND** 系统 MUST NOT 新增 `EvidenceRecord`
- **AND** 系统 MUST NOT 修改 `AppState`、V3 adapter 或 V3 merge

#### Scenario: User opens monthly OKR evidence entry / 用户查看本月证据入口
- **WHEN** 用户打开月度 OKR 页
- **THEN** 系统展示本月证据入口
- **AND** 入口 MUST 从现有任务、周复盘和目标状态派生
