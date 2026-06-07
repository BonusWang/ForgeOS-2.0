## Context / 背景

当前 Forge-OS 是 Vite + React + Zustand persist 的单页应用，并通过 Electron 主进程、Vite 开发中间件和浏览器回退存储实现本地持久化。桌面端主数据文件已经固定到 `%APPDATA%\Forge\alo-data.json`，文件内容是 Zustand storage record，其中 `alo-storage` 保存应用状态。

本次变更同时引入 Android App 和腾讯云 COS 同步，属于跨运行环境、跨存储边界和外部云服务的架构变更。设计必须保留现有本地优先语义：同步失败、未配置同步或 Android 端网络不可用时，用户仍可正常读取和写入本地数据。

## Goals / Non-Goals / 目标与非目标

**Goals / 目标:**

- 复用现有 React 业务界面和状态管理，提供可安装的 Android App。
- 在 Electron、Vite 开发页和 Android App 之间统一本地存储抽象。
- 通过腾讯云 COS 同步完整 Forge-OS 持久化数据，支持跨端连续使用。
- 使用本地优先策略，确保同步失败不导致本地数据丢失。
- 支持签名服务授权和用户手动输入 COS Access Key；手动密钥只保存在本机，不写入仓库、APK 或云端快照。
- 为同步状态、冲突检测、失败恢复和回滚提供明确边界。

**Non-Goals / 非目标:**

- 不重写为原生 Kotlin 或 React Native 应用。
- 不实现多用户账号体系。
- 不实现字段级实时协同编辑。
- 不把 COS 作为唯一数据源；本地数据仍是应用启动和离线使用的基础。
- 不改变现有桌面端 `%APPDATA%\Forge` 数据目录语义。

## Decisions / 设计决策

1. Android App 使用 Capacitor 风格的 WebView 壳复用现有 Vite/React 应用。

   - 理由：当前业务 UI、Zustand store、移动网页适配和构建产物都已经围绕 React SPA 展开，WebView 壳可以最小化重写范围。
   - 备选方案：原生 Kotlin 需要重写全部业务界面；React Native 需要迁移组件和交互；PWA 无法稳定覆盖安装包、私有文件存储和后续移动端集成需求。

2. 新增平台存储抽象，逐步替代只面向 Electron 命名的 `electronStorage`。

   - 统一接口仍满足 Zustand `PersistStorage`：`getItem`、`setItem`、`removeItem`。
   - Electron 驱动继续通过 IPC 读写 `%APPDATA%\Forge\alo-data.json`。
   - Vite 开发驱动继续通过 `/__forge_data__` 读写 Forge AppData。
   - Android 驱动使用应用私有文件存储保存 `alo-data.json`，不依赖 WebView localStorage 作为主存储。
   - 普通浏览器仍保留 localStorage 回退。
   - 平台层额外提供只读存储地址展示：Electron 返回 `%APPDATA%\Forge\alo-data.json` 的实际文件路径，Vite 开发页返回当前 Forge AppData 文件路径，Android 返回应用私有 `alo-data.json` 绝对路径，普通浏览器显示 localStorage 来源。
   - 存储 key 保持 `alo-storage`，避免已有数据迁移扩大化。

3. COS 同步对象以完整 storage record 快照为单位。

   - 同步载荷保存外层 envelope 和当前 storage record：
     - `schemaVersion`
     - `appVersion`
     - `deviceId`
     - `revision`
     - `updatedAt`
     - `checksum`
     - `storageRecord`
   - `storageRecord` 直接保存 `alo-data.json` 中的 key/value record，避免遗漏 Zustand persist 的真实序列化结构。
   - 同步服务在需要展示冲突或校验版本时再解析 `storageRecord["alo-storage"]`。
   - 同步字段清单必须以 `useAppStore` 的 `partialize` 为准，并补齐 `AppState` 类型中尚未列出的已持久化字段，例如 habits、moods、timeBlocks、inspirations 和 reflectionTemplates。

4. COS 对象路径使用浏览器和 Android 共用的单用户前缀，但允许用户自定义桶和路径。

   - 默认 bucket 为用户提供的 `workbase-1321785586`。
   - 默认对象前缀为 `Forge-OS_Base/Domain1127/GoogleChrome`，用于让浏览器端和 Android App 读写同一份同步对象。
   - 主对象为 `Forge-OS_Base/Domain1127/GoogleChrome/alo-data.sync.json`。
   - 备份对象为 `Forge-OS_Base/Domain1127/GoogleChrome/snapshots/{safeUpdatedAt}-{deviceId}.json`，其中 `safeUpdatedAt` 将 ISO 时间戳中的冒号替换为短横线，避免 COS 签名路径出现 `SignatureDoesNotMatch`。
   - `profileId` 仅作为单 profile 标识保留，不参与 COS key 分层。
   - 用户保存配置后，后续同步使用本地保存的 bucket、endpoint、region 和 objectPrefix；点击“修改配置”时再展开表单进行编辑。

5. COS 凭证支持签名服务和手动密钥两种路径。

   - 新增 `CosCredentialProvider` 边界，用于从用户配置的本机或自建签名 URL 服务获取短期签名 URL。
   - 签名服务可以通过环境变量读取腾讯云访问密钥；仓库不保存长期 Access Key ID 或 Secret Access Key。
   - 用户也可以按需在配置表单手动填写 Access Key ID 和 Secret Access Key，由浏览器端生成 COS 签名 URL 直连请求。
   - 手动密钥会保存到本机持久化配置，便于后续同步和修改；但生成云端同步快照时必须从 `syncConfig` 中剔除 `accessKeyId` 和 `secretAccessKey`，避免密钥被上传到 COS 或历史快照。
   - 因为浏览器和 Android WebView 会直接访问 COS，Bucket CORS 必须允许实际运行来源执行 GET、PUT、HEAD，并允许 `Content-Type` 预检；诊断阶段可用 `AllowedOrigin: *` 验证链路。

6. 同步策略采用本地优先、显式可见、可恢复。

   - 同步默认关闭，用户完成 COS 配置后启用。
   - 启用后支持应用启动时自动同步和手动“立即同步”。
   - 不在每次本地保存后自动 debounce 上传；本地保存必须保持轻量且不被网络状态阻塞。
   - 手动“立即同步”每次成功上传主对象时，同时写入一份 `snapshots/` 历史快照，供恢复历史数据选择。
   - 上传前先读取远端 revision；如果本地基线和远端 revision 一致，则上传本地快照。
   - 如果远端变化而本地没有新变化，则下载远端快照并走现有迁移流程后写入本地。
   - 如果远端和本地都发生变化且远端来自不同 deviceId，则创建本地冲突备份，并让用户选择保留本地或采用云端。
   - 如果远端 revision 不同但 deviceId 与当前设备一致，则视为同设备同步基线漂移，直接按本地最新数据上传，不提示冲突。
   - 冲突 UI 默认推荐 updatedAt 最新的一端，但仍必须由用户确认后才覆盖。
   - 暂不做字段级合并，因为当前任务、排序、模板、反思等状态并非全部具备可合并的 updatedAt 元数据。

7. 同步 UI 放在系统页的数据区域内，Android 和桌面共用。

   - 显示同步是否启用、最近同步时间、最近错误、当前设备 ID 和手动同步入口。
   - 提供 COS 配置入口和关闭同步入口；默认收起配置详情，仅显示 bucket、objectPrefix 和授权方式摘要，点击“修改配置”时展开，点击“保存配置”后收起。
   - 冲突时展示明确选择：保留本地、采用云端、稍后处理。
   - 数据备份卡片保留本地“导出数据 / 导入数据”，去掉“同步到本地 / 备份到云服务”两个云操作按钮；保留“恢复历史数据”按钮，加载最近 5 条 `snapshots/` 记录，展示同步时间和 COS 修改时间，并允许选择其中一条恢复。
   - 数据备份卡片在“导出、恢复或同步数据，入口统一放在系统页面。”上方展示只读“本机存储url”，长路径允许换行，按钮行允许换行，保证桌面和 Android 手机宽度下排版协调。
   - 不让同步状态遮挡或阻塞普通本地保存。

8. 数据迁移和版本兼容沿用现有迁移框架。

   - 下载云端快照后，先校验 envelope、checksum 和 storage record 结构。
   - 解析 `alo-storage` 后交给现有 rehydrate / migrate 流程处理。
   - 如果云端 appVersion 高于当前版本且无法安全降级，则不覆盖本地数据，并提示需要升级应用。

## Risks / Trade-offs / 风险与取舍

- 长期密钥泄漏风险 -> 支持签名服务作为推荐路径；如果用户选择本机手动密钥，则密钥只保存在本机配置中，并在云端快照生成时剔除。
- 整包快照可能覆盖另一端修改 -> 使用 revision 检测冲突，并在覆盖前保存本地冲突备份。
- 同设备 revision 漂移误判冲突 -> 冲突判断必须同时比较 deviceId；同一 deviceId 的远端新 revision 不进入冲突。
- COS 路径签名不匹配 -> 历史快照文件名不得包含冒号，避免直连签名 PUT 返回 `SignatureDoesNotMatch`。
- 浏览器直连 COS CORS 失败 -> 通过 Bucket CORS 规则放行所需来源、GET/PUT/HEAD、`Content-Type` 预检和 `ETag` 暴露头。
- 字段级合并暂不支持 -> 优先保证简单、可解释和可恢复；后续可在实体补齐 updatedAt 后再扩展。
- Android WebView localStorage 不适合作为主数据源 -> Android 使用应用私有文件存储，localStorage 只保留普通浏览器回退。
- 长本机路径在手机端溢出 -> 使用只读文本展示并允许任意位置换行，避免影响数据备份按钮操作。
- 云端数据版本高于本地应用 -> 阻止覆盖本地数据，提示升级，而不是尝试降级迁移。
- COS 或网络不可用 -> 本地保存继续工作，同步状态记录错误并允许稍后重试。
- 新增 Android 工程会增加构建复杂度 -> 先复用现有 Vite build，并将 Android 构建脚本与桌面 Electron 构建脚本分开。
- 当前 `AppState` 类型和真实持久化字段不完全一致 -> 在实现同步前先修正类型边界，避免同步载荷遗漏数据。

## Migration Plan / 迁移计划

1. 引入平台存储抽象并保持 Electron、Vite 开发页和浏览器回退行为不变。
2. 补齐真实持久化字段类型，确保同步载荷和 `partialize` 一致。
3. 新增同步配置、设备 ID、sync envelope 和本地冲突备份能力，默认不开启 COS。
4. 实现 COS 同步服务和可注入的凭证提供器，先用 mock / 本地测试覆盖成功、失败和冲突流程。
5. 新增 Android WebView 壳和 Android 私有文件存储驱动，复用现有 React build。
6. 在系统页增加同步配置、状态、启动自动同步、手动同步入口和历史快照恢复入口。
7. 启用后首次同步要求用户明确选择：上传本地数据到云端，或从云端恢复到本地。

Rollback 策略：关闭同步配置后，应用继续使用本地 `alo-data.json`；如果云端下载导致问题，可从本地冲突备份、`.bak` 或现有导入导出恢复。

## Confirmed Decisions / 已确认决策

- Android 发布目标：仅本机安装 APK，不做应用商店 / AAB。
- COS profile：单用户单 profile；默认存放在 `workbase-1321785586/Forge-OS_Base/Domain1127/GoogleChrome`，使浏览器端和 Android App 默认打通；配置保存后仍允许用户改为其他 bucket 或 objectPrefix。
- 自动同步策略：启动自动同步 + 手动触发；不做每次保存后的 debounce 上传。
- 冲突推荐动作：默认推荐 updatedAt 最新的一端。
- COS 默认配置：endpoint 使用腾讯云 COS 广州 endpoint，region 为 `ap-guangzhou`，bucket 为用户提供的 bucket。
- 长期访问密钥处理：推荐签名服务；允许用户手动输入并本机保存 Access Key ID / Secret Access Key，但不得写入仓库、Android APK、云端主同步对象或历史快照。
- 历史恢复：数据备份卡片只保留本地导入导出和“恢复历史数据”，云同步上传入口统一使用 COS 数据同步面板的“立即同步”。
- 本机存储地址：数据备份卡片展示只读地址，用户不能在此修改存储位置；配置变更仍通过既有本地存储和 COS 配置流程完成。
