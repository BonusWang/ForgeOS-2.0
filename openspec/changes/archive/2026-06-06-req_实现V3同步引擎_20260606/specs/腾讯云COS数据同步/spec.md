## ADDED Requirements
> 中文：新增需求

### Requirement: COS sync initializes a clean V3 baseline / COS 同步初始化干净 V3 基线

系统 MUST 在云端不存在 V3 主同步对象时，使用当前浏览器端本地数据初始化 `alo-data.entities.v3.json`，并将该对象保存为本地共同基线。

#### Scenario: Browser initializes V3 after COS cleanup / 浏览器在 COS 清理后初始化 V3

- **WHEN** 浏览器端触发同步
- **AND** COS 前缀下不存在 `alo-data.entities.v3.json`
- **AND** 浏览器端本地数据是用户确认的唯一最新真源
- **THEN** 系统 MUST 上传当前浏览器端数据转换得到的 V3 实体文档
- **AND** 系统 MUST 保存该 V3 文档为本地 base
- **AND** 系统 MUST 显示 V3 同步已初始化

#### Scenario: V3 refuses automatic legacy cloud migration / V3 不自动迁移旧云端主对象

- **WHEN** 系统准备初始化 V3
- **AND** COS 前缀下存在旧的 v1 或 v2 主同步对象
- **THEN** 系统 MUST NOT 自动读取旧对象作为 V3 数据来源
- **AND** 系统 MUST 提示用户清理旧对象或通过备份恢复后重新初始化

### Requirement: COS sync uses V3 entity merge without changing business data / COS 同步使用 V3 实体合并且不改变业务数据

系统 MUST 将现有 AppState 转换为 V3 实体文档进行同步，同时 MUST NOT 给现有业务对象添加同步字段。

#### Scenario: Existing collections become stable V3 entities / 现有集合转换为稳定 V3 实体

- **WHEN** 系统生成 V3 实体文档
- **THEN** 系统 MUST 为 tasks、reflections、moods、inspirations、habits、timeBlocks、calendarEvents、principles、abilities、objectives、inboxItems、entertainments 和 reflectionTemplates 生成稳定实体 key
- **AND** 系统 MUST 为 config 和 enabledModules 使用 app 级实体 key
- **AND** 业务对象本身 MUST 保持当前字段结构

#### Scenario: Independent Android and browser edits merge automatically / Android 与浏览器独立改动自动合并

- **WHEN** Android 新增一个周六任务
- **AND** 浏览器端修改另一个实体或反思的不同字段
- **AND** 两端随后执行 V3 同步
- **THEN** 系统 MUST 保留 Android 新增任务
- **AND** 系统 MUST 保留浏览器端改动
- **AND** 系统 MUST NOT 要求用户在整份本地和整份云端之间二选一

### Requirement: COS sync isolates V3 data by namespace / COS 同步按命名空间隔离 V3 数据

系统 MUST 使用同步命名空间隔离不同用户或资料的数据，避免多个用户写入同一个 V3 主同步对象。

#### Scenario: V3 object path includes profile namespace / V3 对象路径包含资料命名空间

- **WHEN** 系统生成 V3 主同步对象路径
- **THEN** 路径 MUST 包含当前 objectPrefix
- **AND** 路径 MUST 包含当前 profileId 或等价 user/profile namespace
- **AND** 不同 profileId 或未来不同 userId MUST 生成不同 V3 对象路径

#### Scenario: Remote namespace mismatch is rejected / 远端命名空间不匹配时拒绝导入

- **WHEN** 系统下载到 V3 云端对象
- **AND** 该对象中的 namespace、profileId 或未来 userId 与当前本地配置不一致
- **THEN** 系统 MUST 拒绝导入该对象
- **AND** 系统 MUST 保留本地数据
- **AND** 系统 MUST 显示命名空间不匹配的错误

#### Scenario: System shows current namespace / 系统显示当前命名空间

- **WHEN** 用户打开系统页同步区域
- **THEN** 系统 MUST 展示当前 V3 同步命名空间或对象路径摘要
- **AND** 用户可以据此确认当前设备不会写入其他用户的数据路径

### Requirement: COS sync records V3 tombstones for deletions / COS 同步记录 V3 删除 tombstone

系统 MUST 在 V3 同步元数据中记录删除 tombstone，防止被旧设备状态重新上传复活。

#### Scenario: One side deletes an unchanged entity / 单端删除未被另一端编辑的实体

- **WHEN** base 中存在某实体
- **AND** local 删除该实体
- **AND** remote 未修改该实体
- **THEN** V3 合并结果 MUST 删除该实体
- **AND** 系统 MUST 记录 tombstone

#### Scenario: One side deletes while other side edits same entity / 一端删除另一端编辑同一实体

- **WHEN** base 中存在某实体
- **AND** local 删除该实体
- **AND** remote 修改该实体
- **THEN** 系统 MUST 生成删除/编辑冲突
- **AND** 系统 MUST NOT 静默删除或静默恢复该实体

### Requirement: COS sync persists V3 conflicts / COS 同步持久化 V3 冲突

系统 MUST 将 V3 真冲突保存到本地同步状态和云端同步元数据中，直到用户或后续合并明确解决。

#### Scenario: Same field changed differently / 同一字段被两端改成不同内容

- **WHEN** local 和 remote 都修改同一实体的同一字段
- **AND** 两端字段值不同
- **THEN** 系统 MUST 记录字段级冲突
- **AND** 系统 MUST 保留 local 和 remote 两个值
- **AND** 系统 MUST NOT 覆盖任一端的该字段

#### Scenario: Repeated sync sees existing unresolved conflict / 重复同步看到未解决冲突

- **WHEN** V3 同步状态中存在未解决冲突
- **AND** 用户再次触发同步
- **THEN** 系统 MUST 展示相同冲突状态
- **AND** 系统 MUST NOT 反复创建重复冲突记录

## MODIFIED Requirements
> 中文：修改需求

### Requirement: COS sync uses versioned snapshots / COS 同步使用带版本快照

系统 MUST（必须）以带元数据的同步对象同步 Forge-OS 持久化数据。日常跨端同步 MUST 优先使用 V3 实体文档；v1 整份快照和历史快照仅作为手工备份、恢复或 V3 失败时的回退通道。

#### Scenario: Local data uploads as V3 entity envelope / 本地数据以 V3 实体信封上传

- **WHEN** 用户触发上传或自动同步上传
- **THEN** 系统将当前 AppState 转换为 V3 实体文档写入 COS 对象
- **AND** 对象包含 schemaVersion、appVersion、deviceId、namespace、profileId、revision、updatedAt、checksum、entities、tombstones 和 conflicts
- **AND** 系统保存上传后的 V3 对象为本地共同基线

#### Scenario: Browser and Android share the default V3 object path / 浏览器和 Android 共用默认 V3 路径

- **WHEN** 用户使用默认 COS 同步路径
- **THEN** 系统使用当前命名空间下的 `alo-data.entities.v3.json` 作为 V3 主同步对象
- **AND** 浏览器端和 Android App 默认读写同一份 V3 云端实体文档

#### Scenario: Successful legacy backup creates history snapshot / 成功旧快照备份创建历史快照

- **WHEN** 用户显式执行手工云端备份或历史恢复辅助操作
- **THEN** 系统可以在 `snapshots/` 前缀下写入一份历史快照
- **AND** 历史快照文件名使用无冒号时间戳，避免 COS 签名路径校验失败
- **AND** 该历史快照 MUST NOT 参与 V3 日常合并决策

#### Scenario: Remote V3 object is validated before import / 导入前校验云端 V3 对象

- **WHEN** 系统从 COS 下载 V3 对象
- **THEN** 系统校验对象结构和 checksum
- **AND** 校验失败时不覆盖本地数据

#### Scenario: Browser COS access requires CORS / 浏览器访问 COS 需要 CORS

- **WHEN** 系统通过浏览器或 Android WebView 直连 COS
- **THEN** Bucket CORS 必须允许 GET、PUT、HEAD 和 `Content-Type` 预检
- **AND** CORS 未配置或未命中时，系统显示可理解的 COS 连接失败提示

### Requirement: COS sync detects and resolves conflicts / COS 同步检测并处理冲突

系统 MUST（必须）通过 V3 三方合并检测冲突。系统 MUST 自动合并安全的独立变更，并且只在同一字段不同值或删除/编辑同实体时标记冲突。

#### Scenario: Remote changed while local changed / 本地和远端同时变化

- **WHEN** 本地 V3 base revision 与 COS 当前 V3 revision 不一致
- **AND** 本地自上次 V3 同步后也发生变化
- **THEN** 系统 MUST 执行 base、local 和 remote 三方合并
- **AND** 系统 MUST 自动合并不冲突的变更

#### Scenario: Timestamp order does not auto-resolve cross-device conflict / 时间戳先后不自动解决跨设备冲突

- **WHEN** local 和 remote 修改同一实体同一字段为不同值
- **AND** 其中一端的 updatedAt 晚于另一端
- **THEN** 系统 MUST 标记字段级冲突
- **AND** 系统 MUST NOT 仅根据 updatedAt 自动选择任一字段值

#### Scenario: Same device revision drift does not conflict / 同设备 revision 漂移不触发冲突

- **WHEN** COS 当前 V3 revision 与本地 base revision 不一致
- **AND** COS 当前 V3 对象来自当前设备
- **AND** 本地自上次同步后发生变化
- **THEN** 系统仍 MUST 执行 V3 合并
- **AND** 没有字段级冲突时系统 MUST 上传合并后的 V3 对象

#### Scenario: User chooses conflict resolution / 用户选择冲突处理方式

- **WHEN** 系统显示 V3 字段级或删除/编辑冲突
- **THEN** 用户可以查看冲突数量和冲突摘要
- **AND** 系统 MUST 保留两端冲突值直到冲突被解决

### Requirement: COS sync status is visible / COS 同步状态可见

系统 MUST（必须）向用户展示同步状态，使用户知道 V3 数据是否已初始化、已同步、失败或存在冲突。

#### Scenario: User sees latest sync status / 用户查看最近同步状态

- **WHEN** 用户打开系统页的数据同步区域
- **THEN** 系统显示同步是否启用、最近同步时间、最近错误和当前设备 ID
- **AND** 系统显示 V3 revision、V3 初始化状态、自动合并数量和冲突数量
- **AND** 用户可以手动触发立即同步

#### Scenario: User sees pending local change status / 用户看到待上传本地变更状态

- **WHEN** 本地存在尚未上传或待处理的本地变更
- **THEN** 系统 MUST 以“待上传本地变更”语义展示该时间
- **AND** 系统 MUST NOT 将存在本地变更的状态显示为“已是最新”

#### Scenario: Saved configuration is collapsed after save / 保存配置后收起表单

- **WHEN** 用户保存 COS 同步配置
- **THEN** 系统收起配置表单
- **AND** 系统显示 bucket、objectPrefix 和授权方式摘要
- **AND** 用户点击“修改配置”时才重新展开表单

#### Scenario: User restores recent history snapshot / 用户恢复最近历史快照

- **WHEN** 用户在数据备份卡片点击“恢复历史数据”
- **THEN** 系统读取最近 5 条云端 `snapshots/` 记录
- **AND** 系统展示每条记录的同步时间和 COS 修改时间
- **AND** 用户可以选择其中一条并确认恢复
- **AND** 历史恢复完成后用户需要重新初始化或刷新 V3 基线
