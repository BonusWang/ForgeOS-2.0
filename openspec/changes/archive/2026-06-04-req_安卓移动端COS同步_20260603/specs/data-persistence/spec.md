## ADDED Requirements
> 中文：新增需求

### Requirement: Cloud sync preserves local-first data persistence / 云同步保持本地优先持久化

系统 MUST（必须）在引入 COS 同步后继续以本地数据为启动和保存基础，不能让云同步绕过现有数据保留规则。

#### Scenario: Local data remains available when COS is unavailable / COS 不可用时本地数据仍可用

- **WHEN** COS 未配置、网络不可用或同步请求失败
- **THEN** 系统继续从本地数据文件或平台本地存储读取数据
- **AND** 用户仍可以保存任务、反思、情绪、时间块、灵感和配置

#### Scenario: Sync failure does not clear local files / 同步失败不清理本地文件

- **WHEN** COS 上传、下载或校验失败
- **THEN** 系统不删除 `%APPDATA%\Forge\alo-data.json`、Android 私有数据文件、备份、回滚或临时数据文件
- **AND** 系统记录同步错误供用户重试

#### Scenario: Local import and export remain separate from COS sync / 本地导入导出与 COS 同步分离

- **WHEN** 用户打开系统页的数据备份卡片
- **THEN** 系统继续提供本地“导出数据”和“导入数据”
- **AND** 本地导入导出不依赖 COS 配置、网络或云端授权
- **AND** COS 云同步上传入口只出现在 COS 数据同步面板

#### Scenario: Data backup shows readonly local storage URL / 数据备份展示只读本机存储地址

- **WHEN** 用户在桌面端或 Android 端打开系统页的数据备份卡片
- **THEN** 系统在“导出、恢复或同步数据，入口统一放在系统页面。”上方展示“本机存储url”
- **AND** 展示值为当前平台实际使用的数据存放地址
- **AND** 地址为只读文本，不提供编辑控件
- **AND** 长地址在手机端窄屏下换行展示，不遮挡导出、导入和恢复历史数据按钮

### Requirement: Synced payload includes all persisted app fields / 同步载荷包含所有持久化字段

系统 MUST（必须）以真实持久化字段为准生成同步载荷，避免跨端同步后缺失模块数据。

#### Scenario: Sync payload follows persisted store shape / 同步载荷遵循持久化 store 结构

- **WHEN** 系统生成同步快照
- **THEN** 快照包含当前 Zustand persist 的 storage record
- **AND** `alo-storage` 中包含任务、日历、原则、能力、反思、娱乐、OKR、收纳箱、配置、启用模块、习惯、情绪、时间块、灵感、反思模板和数据版本
- **AND** `alo-storage` 中的 syncConfig 不包含手动 Access Key ID 或 Secret Access Key

#### Scenario: Type definitions match persisted fields / 类型定义匹配持久化字段

- **WHEN** 开发者修改持久化字段清单
- **THEN** AppState 或等价同步类型同步更新
- **AND** 新字段不会只保存在本地而被同步流程遗漏

### Requirement: Remote restore uses existing migration safeguards / 云端恢复使用现有迁移保护

系统 MUST（必须）在从 COS 恢复数据时复用现有数据迁移和回滚保护，避免用不兼容数据覆盖本地状态。

#### Scenario: Remote snapshot migrates before use / 云端快照使用前迁移

- **WHEN** 系统采用 COS 远端快照作为本地数据
- **THEN** 系统通过现有数据迁移流程处理快照中的应用状态
- **AND** 迁移完成后才写入本地持久化数据

#### Scenario: Newer remote app version is blocked / 云端版本过新时阻止覆盖

- **WHEN** COS 远端快照的 appVersion 高于当前应用可安全处理的版本
- **THEN** 系统不覆盖本地数据
- **AND** 系统提示用户升级应用后再同步
