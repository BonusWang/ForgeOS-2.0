## ADDED Requirements
> 中文：新增需求

### Requirement: COS sync can be configured safely / COS 同步可安全配置

系统 MUST（必须）允许用户配置腾讯云 COS 同步参数，支持签名服务和本机手动密钥两种授权方式，并确保密钥不进入云端同步载荷。

#### Scenario: User configures COS sync profile / 用户配置 COS 同步资料

- **WHEN** 用户在系统页填写 COS endpoint、region、bucket、profileId、objectPrefix 和签名服务地址
- **THEN** 系统保存同步配置
- **AND** 同步状态显示为已配置但不丢弃本地数据

#### Scenario: User configures manual COS keys / 用户配置手动 COS 密钥

- **WHEN** 用户在系统页填写 Access Key ID 和 Secret Access Key
- **THEN** 系统将密钥保存到本机同步配置以便后续同步使用
- **AND** 系统使用手动密钥生成 COS 签名 URL 直连访问云端对象

#### Scenario: Manual secrets are excluded from cloud snapshots / 手动密钥不进入云端快照

- **WHEN** 系统生成 COS 主同步对象或历史快照
- **THEN** 快照中的 syncConfig 不包含 accessKeyId 或 secretAccessKey
- **AND** 长期密钥不会被上传到 COS、写入仓库或打包到 Android APK

### Requirement: COS sync uses versioned snapshots / COS 同步使用带版本快照

系统 MUST（必须）以带元数据的快照对象同步 Forge-OS 持久化数据，确保上传、下载和冲突检测有可验证依据。

#### Scenario: Local data uploads as sync envelope / 本地数据以同步信封上传

- **WHEN** 用户触发上传或自动同步上传
- **THEN** 系统将当前 storage record 写入 COS 对象
- **AND** 对象包含 schemaVersion、appVersion、deviceId、revision、updatedAt、checksum 和 storageRecord

#### Scenario: Browser and Android share the default object path / 浏览器和 Android 共用默认对象路径

- **WHEN** 用户使用默认 COS 同步路径
- **THEN** 系统使用 `Forge-OS_Base/Domain1127/GoogleChrome/alo-data.sync.json` 作为主同步对象
- **AND** 浏览器端和 Android App 默认读写同一份云端快照

#### Scenario: Successful sync creates history snapshot / 成功同步创建历史快照

- **WHEN** 用户点击“立即同步”并成功上传本地快照
- **THEN** 系统同时在 `snapshots/` 前缀下写入一份历史快照
- **AND** 历史快照文件名使用无冒号时间戳，避免 COS 签名路径校验失败

#### Scenario: Remote snapshot is validated before import / 导入前校验云端快照

- **WHEN** 系统从 COS 下载远端快照
- **THEN** 系统校验快照结构和 checksum
- **AND** 校验失败时不覆盖本地数据

#### Scenario: Browser COS access requires CORS / 浏览器访问 COS 需要 CORS

- **WHEN** 系统通过浏览器或 Android WebView 直连 COS
- **THEN** Bucket CORS 必须允许 GET、PUT、HEAD 和 `Content-Type` 预检
- **AND** CORS 未配置或未命中时，系统显示可理解的 COS 连接失败提示

### Requirement: COS sync remains local-first / COS 同步保持本地优先

系统 MUST（必须）在同步失败、未配置或网络不可用时继续允许本地读写。

#### Scenario: Sync disabled keeps local app usable / 未启用同步时本地应用可用

- **WHEN** 用户没有启用 COS 同步
- **THEN** 系统继续使用本地数据启动和保存
- **AND** 不要求用户先配置 COS

#### Scenario: Upload failure keeps local data / 上传失败保留本地数据

- **WHEN** 系统尝试上传本地快照到 COS
- **AND** 网络或 COS 服务返回失败
- **THEN** 系统保留本地数据
- **AND** 同步状态记录失败原因供用户稍后重试

### Requirement: COS sync detects and resolves conflicts / COS 同步检测并处理冲突

系统 MUST（必须）在本地和远端同时发生变化时检测冲突，并在覆盖前保留可恢复副本。

#### Scenario: Remote changed while local changed / 本地和远端同时变化

- **WHEN** 本地快照基线 revision 与 COS 当前 revision 不一致
- **AND** 本地自上次同步后也发生变化
- **AND** COS 当前快照来自不同 deviceId
- **THEN** 系统标记同步冲突
- **AND** 系统在覆盖前创建本地冲突备份

#### Scenario: Same device revision drift does not conflict / 同设备 revision 漂移不触发冲突

- **WHEN** 本地快照基线 revision 与 COS 当前 revision 不一致
- **AND** COS 当前快照的 deviceId 与当前设备一致
- **AND** 本地自上次同步后发生变化
- **THEN** 系统直接上传当前本地快照
- **AND** 系统不显示冲突状态

#### Scenario: User chooses conflict resolution / 用户选择冲突处理方式

- **WHEN** 系统显示同步冲突
- **THEN** 用户可以选择保留本地、采用云端或稍后处理
- **AND** 系统仅在用户确认后覆盖对应数据

### Requirement: COS sync status is visible / COS 同步状态可见

系统 MUST（必须）向用户展示同步状态，使用户知道数据是否已同步、失败或存在冲突。

#### Scenario: User sees latest sync status / 用户查看最近同步状态

- **WHEN** 用户打开系统页的数据同步区域
- **THEN** 系统显示同步是否启用、最近同步时间、最近错误和当前设备 ID
- **AND** 用户可以手动触发立即同步

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
