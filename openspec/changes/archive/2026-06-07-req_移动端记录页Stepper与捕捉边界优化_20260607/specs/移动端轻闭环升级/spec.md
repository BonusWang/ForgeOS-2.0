## MODIFIED Requirements
> 中文：修改已有需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。

### Requirement: Mobile progress can clarify existing inbox items / 移动推进页可澄清现有收集项
系统 MUST 在移动端「推进」模块展示待澄清队列，并复用现有 `inboxItems` 和现有业务实体完成轻量澄清，同时避免将待澄清队列误读为任务收纳箱。

#### Scenario: User clarifies an inbox item on mobile / 用户在移动端澄清收集项
- **WHEN** 用户打开移动端「推进」模块
- **THEN** 系统展示待澄清队列和待澄清数量
- **AND** 用户可以将事项澄清为今日任务、待安排任务或灵感
- **AND** 用户可以删除该事项
- **AND** 系统 MUST NOT 新增移动端专属 capture 模型

#### Scenario: Mobile clarification keeps shared payload / 移动澄清保持共享载荷
- **WHEN** 移动端澄清收集项
- **THEN** 今日任务和待安排任务 MUST 写入现有 tasks
- **AND** 灵感 MUST 写入现有 inspirations
- **AND** 系统 MUST 使用现有同步载荷表达结果
- **AND** 系统 MUST 保持 `BACKLOG` 作为待安排任务的底层日期语义
