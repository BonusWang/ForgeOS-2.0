## MODIFIED Requirements
> 中文：修改已有需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。

### Requirement: Dashboard provides lightweight capture inbox / Dashboard 提供轻量收集箱
系统 MUST 在 Dashboard 首屏提供轻量捕捉入口，使用户可以先记录普通想法，再澄清为现有任务或灵感实体，并通过文案明确区分待澄清事项和待安排任务。

#### Scenario: User captures and clarifies an inbox item / 用户收集并澄清事项
- **WHEN** 用户在 Dashboard 输入想法并提交
- **THEN** 系统将该想法加入现有 `inboxItems`
- **AND** 用户可以将该事项澄清为今日任务、待安排任务或灵感
- **AND** 用户可以删除该事项
- **AND** 系统 MUST NOT 新增桌面专属 capture 持久模型

#### Scenario: Inbox copy avoids OKR-only meaning / 收集箱文案避免 OKR 专属语义
- **WHEN** 系统展示待澄清列表
- **THEN** 文案 MUST 表达为待澄清入口
- **AND** 普通想法 MUST NOT 被强制表达为 Objective、KR 或 OKR 焦点
- **AND** `inboxItems` MUST NOT 被主要表达为任务收纳箱
