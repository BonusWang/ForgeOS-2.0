## ADDED Requirements
<!-- 中文：新增需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。 -->

### Requirement: System page shows readonly data health / 系统页展示只读数据健康
系统 MUST 在系统页展示只读数据健康摘要，帮助用户判断本地数据、同步状态、冲突、待上传和存储位置是否处于可理解状态。

#### Scenario: User sees health summary on system page / 用户在系统页看到健康摘要
- **WHEN** 用户打开系统页
- **THEN** 系统展示数据健康摘要模块
- **AND** 摘要展示本地记录概览、同步启用状态、V3 初始化状态、V3 冲突数量、待上传本地变更和本机存储路径
- **AND** 摘要不提供重置、修复、清理、重新初始化或立即同步按钮

#### Scenario: Health summary uses existing state only / 健康摘要只使用现有状态
- **WHEN** 系统生成数据健康摘要
- **THEN** 摘要 MUST 从现有 store、syncConfig、syncStatus 和平台存储地址派生
- **AND** 系统 MUST NOT 新增持久化字段
- **AND** 系统 MUST NOT 修改 V3 同步状态、Electron IPC 或 Android 私有存储接口

### Requirement: System page shows collapsible usage ritual / 系统页展示折叠使用仪式
系统 MUST 在系统页提供折叠式使用指南，说明 Forge-OS 的早上、白天、晚上、周末和月底使用节奏。

#### Scenario: User expands usage ritual guide / 用户展开使用仪式指南
- **WHEN** 用户打开系统页
- **THEN** 系统展示使用指南模块
- **AND** 用户可以展开或收起指南内容
- **AND** 展开后内容包含早上、白天、晚上、周末和月底五个使用节奏

#### Scenario: Usage ritual does not create a data model / 使用仪式不创建数据模型
- **WHEN** 使用指南展示在系统页
- **THEN** 系统 MUST NOT 新增 ritual、health 或 evidence 持久化模型
- **AND** 系统 MUST NOT 统计仪式完成率

### Requirement: Project docs describe daily weekly monthly rhythm / 项目文档描述日周月使用节奏
项目 README MUST 描述 Forge-OS 的每日、每周和每月使用节奏，使项目基板文档与产品内指南一致。

#### Scenario: Reader sees rhythm in README / 读者在 README 看到使用节奏
- **WHEN** 用户阅读 README
- **THEN** README 展示早上、白天、晚上、周末和月底的使用方式
- **AND** 文档说明该节奏不新增独立数据模型
