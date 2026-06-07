## 1. V3 Types And Namespace / V3 类型与命名空间

- [x] 1.1 添加 V3 同步类型，覆盖 namespace、profileId、revision、checksum、entities、tombstones、conflicts 和本地 cache。
- [x] 1.2 添加 V3 COS object key 生成逻辑，使用 objectPrefix + profileId 生成隔离路径，并为未来 userId 预留 namespace 输入。
- [x] 1.3 添加远端 namespace/profileId 不匹配时拒绝导入的验证逻辑和测试。

## 2. V3 Entity Adapter / V3 实体适配层

- [x] 2.1 为所有现有持久化集合实现 AppState 到 V3 实体表转换，业务对象字段保持不变。
- [x] 2.2 实现 V3 实体表还原到 AppState，并保持现有排序和 syncConfig/syncStatus 本地属性。
- [x] 2.3 添加浏览器当前备份数据可完整转换并还原的回归测试。

## 3. V3 Merge Engine / V3 合并引擎

- [x] 3.1 实现 base/local/remote 三方合并，自动合并不同实体和不同字段改动。
- [x] 3.2 实现 reflection answers 字段级合并，同字段不同值生成冲突。
- [x] 3.3 实现删除 tombstone，覆盖单端删除、删除后旧端同步不复活、删除/编辑冲突。
- [x] 3.4 实现冲突去重和持久化输出，重复同步不重复创建同一冲突。

## 4. V3 COS Transport And Runner / V3 COS 传输与运行器

- [x] 4.1 实现 V3 COS client，支持下载、上传、404 空对象、checksum 校验和错误映射。
- [x] 4.2 实现干净初始化 runner：云端无 V3 对象时用浏览器本地数据创建基线。
- [x] 4.3 实现日常同步 runner：下载远端、读取本地 base、合并、上传、更新本地 cache。
- [x] 4.4 实现旧 v1/v2 主对象存在时不自动迁移并提示清理或手工恢复。

## 5. Hook And UI Wiring / Hook 与界面接入

- [x] 5.1 将手动同步、启动同步和自动同步切换到 V3 runner 优先，V3 成功时不再执行 v1/v2 日常同步。
- [x] 5.2 在系统页展示 V3 namespace、初始化状态、revision、自动合并数量、冲突数量和最近错误。
- [x] 5.3 保留数据备份和历史恢复入口，恢复后提示需要重新初始化或刷新 V3 基线。

## 6. Verification And Android Rollout / 验证与 Android 发布

- [x] 6.1 添加覆盖 Android 周六任务 + 浏览器反思改动自动合并的端到端测试。
- [x] 6.2 添加多 profileId/user namespace 不串数据的测试。
- [x] 6.3 运行完整 Node 测试、build、lint，并修复所有失败。
- [x] 6.4 打包 Android APK，确认新 APK 包含 V3 同步路径。
- [x] 6.5 在浏览器端完成首次 V3 初始化前检查 COS 前缀仍无旧主同步对象。
