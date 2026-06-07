# 移动端轻闭环升级 Specification

## Purpose
TBD - created by archiving change req_移动端轻闭环升级_20260607. Update Purpose after archive.
## Requirements
### Requirement: Mobile today shows daily rhythm guidance / 移动今日页展示日常节奏
系统 MUST 在移动端今日页展示轻量使用节奏，使用户知道早上、白天、晚上分别执行什么动作。

#### Scenario: User opens mobile today / 用户打开移动今日页
- **WHEN** 用户打开移动端「今日」模块
- **THEN** 系统展示早上、白天、晚上三个轻量节奏提示
- **AND** 提示 MUST 只作为 workflow 引导
- **AND** 系统 MUST NOT 新增 ritual 持久模型或仪式完成率统计

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

### Requirement: Mobile progress shows derived weekly evidence / 移动推进页展示派生周证据
系统 MUST 在移动端「推进」模块展示本周证据摘要，帮助用户在手机上看到完成、未完成、能力加分和相关反思。

#### Scenario: User reviews weekly evidence on mobile / 用户在移动端查看周证据
- **WHEN** 用户打开移动端「推进」模块
- **THEN** 系统展示完成任务、未完成任务、能力加分和相关反思数量
- **AND** 这些数据 MUST 从现有 tasks、reflections 和 ability fields 派生
- **AND** 系统 MUST NOT 新增 `EvidenceRecord`

### Requirement: Mobile system shows readonly health summary / 移动系统页展示只读健康摘要
系统 MUST 在移动端「系统」模块展示只读数据健康摘要，使用户不展开完整系统工具也能判断本地数据和同步状态。

#### Scenario: User opens mobile system / 用户打开移动系统页
- **WHEN** 用户打开移动端「系统」模块
- **THEN** 系统展示本地记录、待澄清、同步状态、冲突和待上传摘要
- **AND** 摘要 MUST 从现有 store、syncConfig、syncStatus 和 v3SyncConflicts 派生
- **AND** 摘要 MUST NOT 提供重置、修复、清理、重新初始化或立即同步按钮

### Requirement: Mobile shell keeps four main sections / 移动端保留四个主入口
系统 MUST 在本次移动端升级后继续保留 `今日 / 推进 / 记录 / 系统` 四主入口，不新增第五个主导航。

#### Scenario: User sees mobile bottom navigation / 用户查看移动端底部导航
- **WHEN** 用户打开移动端 Forge-OS
- **THEN** 底部主导航仍只展示今日、推进、记录和系统
- **AND** 系统 MUST NOT 新增替代四入口的第五个主导航
