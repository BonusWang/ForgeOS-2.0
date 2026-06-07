## 1. Storage Foundation / 存储基础

- [x] 1.1 修正 AppState 或新增等价持久化类型，使任务、日历、原则、能力、反思、娱乐、OKR、收纳箱、配置、启用模块、习惯、情绪、时间块、灵感、反思模板和数据版本都被类型覆盖。
- [x] 1.2 将 `electronStorage` 重命名或包裹为平台存储抽象，保持 Zustand `PersistStorage` 接口不变。
- [x] 1.3 保留 Electron IPC 存储驱动，验证桌面端仍读取并写入 `%APPDATA%\Forge\alo-data.json`。
- [x] 1.4 保留 Vite 开发页 `/__forge_data__` 存储驱动，验证 `http://127.0.0.1:5173/` 仍读取 Forge AppData。
- [x] 1.5 为普通浏览器保留 localStorage 回退，验证非 Electron、非本地开发服务环境仍可读写。

## 2. Sync Data Model / 同步数据模型

- [x] 2.1 定义同步配置、设备 ID、profileId、同步状态、错误状态和冲突状态的数据类型。
- [x] 2.1.1 扩展同步配置，支持本机保存 Access Key ID 和 Secret Access Key，并允许用户后续修改 bucket、endpoint、region 和 objectPrefix。
- [x] 2.2 定义 COS sync envelope，包含 schemaVersion、appVersion、deviceId、revision、updatedAt、checksum 和 storageRecord。
- [x] 2.3 实现 storage record 快照生成和 checksum 校验，验证 `alo-storage` 不被遗漏或二次破坏序列化结构。
- [x] 2.4 实现云端快照导入前结构校验，验证非法 JSON、缺字段和 checksum 不匹配时不会覆盖本地数据。
- [x] 2.5 接入现有迁移流程，验证从云端导入旧版本数据时会完成迁移后再写入本地。

## 3. COS Sync Core / COS 同步核心

- [x] 3.1 新增 COS 同步服务边界，支持读取远端 revision、下载快照、上传快照和写入备份快照。
- [x] 3.2 新增短期凭证或签名 URL provider 接口，支持签名服务授权。
- [x] 3.2.1 新增手动密钥直连 COS 签名 provider，并验证密钥不进入云端 storage record 快照。
- [x] 3.3 实现手动“立即同步”流程，覆盖未配置、首次上传、首次从云端恢复和已同步无变化场景。
- [x] 3.3.1 手动“立即同步”成功上传主对象时同步写入 `snapshots/` 历史快照。
- [x] 3.4 实现应用启动自动同步流程，验证同步失败时本地数据仍保留并记录错误。
- [x] 3.5 实现 revision 冲突检测，验证本地和远端同时变化时进入冲突状态且先创建本地冲突备份。
- [x] 3.5.1 修正同一 deviceId 的远端 revision 漂移误判冲突问题，同设备变更直接上传本地最新快照。
- [x] 3.6 实现冲突处理动作，支持保留本地、采用云端和稍后处理，并验证只有用户确认后才覆盖数据。
- [x] 3.7 配置并验证 COS Bucket CORS，覆盖浏览器 / Android WebView 直连 GET、PUT、HEAD 和 `Content-Type` 预检。
- [x] 3.8 将历史快照文件名改为无冒号时间戳，避免 COS 直连签名 PUT 返回 `SignatureDoesNotMatch`。

## 4. Android App Shell / Android 应用壳

- [x] 4.1 引入 Android WebView 壳工程配置，复用现有 Vite production build 作为应用内资源。
- [x] 4.2 新增 Android 私有文件存储驱动，验证 Android 端不依赖 WebView localStorage 作为主存储。
- [x] 4.3 配置 Android 应用启动入口、包名、图标资源和构建脚本，生成本机可安装 APK。
- [x] 4.4 验证 Android App 在无 Vite dev server 环境中可启动并显示 Forge-OS 主界面。
- [x] 4.5 验证 Android App 离线重启后仍保留本地任务、反思、情绪和配置。

## 5. Sync UI / 同步界面

- [x] 5.1 在系统页新增数据同步区域，展示是否启用、最近同步时间、最近错误和当前设备 ID。
- [x] 5.2 新增 COS 配置表单，支持 endpoint、region、bucket、profileId、objectPrefix、签名服务地址、Access Key ID 和 Secret Access Key。
- [x] 5.2.1 保存配置后收起配置表单；点击“修改配置”时再展开，并显示 bucket、objectPrefix 和授权方式摘要。
- [x] 5.3 新增手动立即同步按钮，并根据同步中、成功、失败、未配置和冲突状态更新可见反馈。
- [x] 5.4 新增冲突处理界面，提供保留本地、采用云端和稍后处理三个动作。
- [x] 5.5 验证同步 UI 在桌面端和 Android 常见手机宽度下可读、可操作且不遮挡本地保存流程。
- [x] 5.6 调整数据备份卡片，只保留本地导出、导入和“恢复历史数据”，去掉“同步到本地”和“备份到云服务”按钮。
- [x] 5.7 实现恢复历史数据列表，展示最近 5 条云端同步节点的同步时间、COS 修改时间，并允许选择恢复。
- [x] 5.8 在数据备份卡片说明文案上方展示只读“本机存储url”，并适配桌面端和 Android 手机端长路径换行。

## 6. Verification / 验证

- [x] 6.1 运行现有构建和类型检查，确认桌面端构建不因 Android 和同步能力回退。
- [x] 6.2 增加或更新存储抽象测试，覆盖 Electron、Vite 开发页、Android 私有文件和 localStorage 回退路径。
- [x] 6.3 增加或更新同步核心测试，覆盖上传成功、下载成功、未配置、网络失败、checksum 失败、版本过新和冲突场景。
- [x] 6.4 增加或更新 UI 验证，覆盖系统页同步状态、配置表单、手动同步和冲突处理。
- [x] 6.5 运行 OpenSpec validate，确认 `req_安卓移动端COS同步_20260603` 在 strict 模式下通过。
- [x] 6.6 增加同设备 revision 漂移、不含密钥云端快照、历史快照列表、CORS 失败提示和无冒号快照 key 的回归测试。
- [x] 6.7 使用真实 COS 配置验证 CORS 预检、主同步对象上传下载、历史快照上传和清理流程。
- [x] 6.8 增加数据备份卡片和平台存储结构测试，覆盖本机存储地址展示、Electron、Vite 开发页、Android 私有文件和 localStorage 回退来源。
