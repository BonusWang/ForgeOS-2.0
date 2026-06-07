## Context / 背景

Forge-OS 是本地优先应用，浏览器/Electron 与 Android 都读写本地持久化状态，再通过腾讯云 COS 做跨端同步。当前 v1 整份快照同步会把所有数据当成一个文档；当前 v2 实体同步只能解决一部分新增/编辑合并，还缺少完整删除记录、持久化冲突和干净初始化约束。

本次实施前，用户已确认浏览器端当前数据是唯一最新真源，已导出 `E:\alo-backup-2026-06-06.json`，Android 和其他端已暂停使用，COS 前缀 `Forge-OS_Base/Domain1127/GoogleChrome/` 已清理到只剩空 `snapshots/` 占位对象。这个状态允许 V3 从当前浏览器本地数据直接初始化云端基线，不需要兼容旧云端 v1/v2 主同步对象。

## Goals / Non-Goals / 目标与非目标

**Goals / 目标:**

- 用 V3 同步引擎解决“Android 新增任务、浏览器端也有其他改动时需要来回选择云端/本地”的问题。
- 保持现有业务数据结构不变，不给 `Task`、`Reflection`、`MoodEntry` 等业务对象新增同步字段。
- 在独立同步元数据中维护 base、revision、entity hash、tombstones 和 conflicts。
- 在 V3 对象 key 和 envelope 元数据中记录同步命名空间，当前使用 `objectPrefix + profileId`，未来可加入 userId。
- 对现有持久化数据建立规范化实体表，并进行三方合并：`base + local + remote`。
- 自动合并不同实体、不同字段、同值并发改动；只在同一字段不同值或删除/编辑同实体冲突时阻塞。
- 实现删除 tombstone，防止一端删除的数据被另一端旧状态重新上传复活。
- 将 v1/v2 限定为手工恢复或回退通道，V3 成功时不再执行旧整份快照日常同步。

**Non-Goals / 非目标:**

- 不新增用户功能模块，不改任务、反思、心情、灵感等业务 UI。
- 不实现多人实时协同、CRDT 文本编辑或操作日志回放。
- 不自动迁移旧云端 v1/v2 主同步文件；如果旧对象重新出现，V3 只提示清理或手工恢复。
- 不解决 COS 权限、CORS 或网络层之外的云服务配置问题。
- 不实现用户账号系统；本次只预留并强制同步命名空间隔离。

## Decisions / 设计决策

### Decision 1: 新建 V3，不继续堆叠 v2

V3 使用独立对象 `alo-data.entities.v3.json` 和独立本地缓存字段。v2 已经验证实体级合并方向正确，但它是事故修复 MVP，继续加入 tombstone、冲突持久化和全量实体规则会让边界变模糊。新建 V3 可以让数据形状、合并规则和初始化策略从一开始就清楚。

备选方案是继续扩展 v2。它开发更快，但会带来“既像 MVP 又像正式引擎”的长期维护成本。V3 的额外实现成本是值得的。

### Decision 2: 业务对象不加字段，同步元数据独立保存

同步引擎维护自己的 `syncStatus.v3` 或等价本地缓存，包括上次共同基线、revision、tombstones、conflicts、lastAppliedAt 和设备 ID。业务对象保持现在的数据结构，adapter 负责在 AppState 和 V3 实体文档之间转换。

这满足“不改现有数据结构”的产品约束，同时给同步引擎足够信息判断新增、编辑、删除和冲突。

### Decision 3: 使用三层架构

- Adapter 层：`AppState <-> V3 entity document`，负责稳定 key、排序和还原。
- Merge engine 层：纯函数，输入 base/local/remote/tombstones，输出 merged/conflicts/newTombstones。
- Transport 层：COS 下载、上传、checksum 校验、对象不存在判断和错误映射。

React hooks 和 SyncPanel 只调用 runner，不直接参与合并决策。这样可以用 Node 测试覆盖核心同步，不需要浏览器环境才能证明合并正确。

### Decision 4: 全量覆盖现有主要集合，但规则按风险分级

所有现有持久化集合都纳入 V3 实体表：tasks、reflections、moods、inspirations、habits、timeBlocks、calendarEvents、principles、abilities、objectives、inboxItems、entertainments、reflectionTemplates、config、enabledModules。

实体 key 使用现有稳定 ID；没有 ID 的全局状态用 `app`。嵌套结构先按父实体整体合并，反思 answers 做字段级合并。这样不改业务结构，也避免为了 keyResults、ability tasks 等嵌套对象重塑数据模型。

### Decision 5: 删除用 tombstone，而不是从数组差异猜测

当 base 有实体、local 或 remote 缺失该实体时，V3 将其解释为删除候选，并写入 tombstone。若另一端没有编辑该实体，删除生效；若另一端同时编辑该实体，生成删除/编辑冲突。

tombstone 存在于同步元数据，不进入业务对象。它包含 collection、entityKey、deletedAt、deletedBy 和 baseRevision。这样可以防止删除被旧设备复活。

### Decision 6: 干净初始化优先，不自动兼容旧云端

第一次 V3 同步在云端无 `alo-data.entities.v3.json` 时，以当前浏览器本地数据创建 V3 基线。若云端存在旧 v1/v2 主同步对象，V3 不读取它们，不进行自动迁移，只提示需要清理或手工恢复。当前已完成清理，所以实现可以围绕干净初始化做完整验证。

### Decision 7: V3 必须带同步命名空间，避免多用户串数据

V3 key 不应只是固定文件名。同步引擎必须先计算 namespace：当前版本用 `cosObjectPrefix(syncConfig)` 和 `syncConfig.profileId` 组成，例如 `Forge-OS_Base/Domain1127/GoogleChrome/profiles/default/alo-data.entities.v3.json`。V3 envelope 同时写入 `namespace` 和 `profileId`。下载远端 V3 时，如果 envelope namespace/profileId 与当前配置不一致，系统必须拒绝导入。

未来如果加入 userId，不需要重写合并引擎，只需要把 namespace 计算改成 `users/<userId>/profiles/<profileId>/...` 或将 userId 写入 envelope owner。这样多个用户不会因为共用 bucket、endpoint 或旧默认 prefix 而互相覆盖。

## Risks / Trade-offs / 风险与取舍

- 旧 Android App 如果在 V3 初始化后继续运行，可能重新写入旧 v1/v2 对象 → 缓解：V3 实施和初始化期间保持 Android 暂停，安装 V3 新包后再同步。
- 嵌套结构按父实体整体合并，可能对同一 objective/keyResult 的并发改动产生实体级冲突 → 缓解：先保守冲突，不猜测；未来需要时再为特定嵌套对象增加 adapter。
- tombstone 如果永久保留会增长 → 缓解：本次先保留足够安全的 tombstone；后续可在所有设备基线超过删除 revision 后做压缩。
- 本地 sync cache 损坏会影响三方合并准确度 → 缓解：checksum 校验失败时停止同步，不覆盖本地；用户可从本地备份重新初始化 V3。
- V3 不自动读取旧云端对象，可能让未清理旧数据无法自动迁移 → 缓解：这是有意取舍；本次以浏览器本地备份为权威，旧对象只作为手工恢复材料。
- namespace 配置错误可能让用户看不到原数据 → 缓解：系统页展示当前 V3 namespace；远端 namespace 不匹配时拒绝导入并给出明确提示，而不是自动创建或覆盖。

## Migration Plan / 迁移计划

1. 保持浏览器端当前本地数据为唯一真源，继续暂停 Android 和其他端写入。
2. 实现 V3 后，在浏览器端点击同步，云端不存在当前 namespace 下的 V3 对象时创建 `profiles/<profileId>/alo-data.entities.v3.json`。
3. 同步成功后，本地保存 V3 base 和 revision，系统页显示 V3 已初始化且冲突为 0。
4. 重新打包并安装 Android V3 APK。
5. Android 第一次打开后运行 V3 同步，从云端拉取 V3 基线并写入本地 base。
6. 两端确认数据一致后恢复日常使用。

Rollback 策略：如果 V3 初始化或合并出现异常，不覆盖本地数据；用户可用 `E:\alo-backup-2026-06-06.json` 在浏览器端恢复，再清理 V3 对象重新初始化。
