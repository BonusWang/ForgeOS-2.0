## MODIFIED Requirements

> 中文：修改需求

### Requirement: Development builds preserve user data / 开发构建保留用户数据

系统 MUST（必须）在开发、编译、热更新、重启、Vite 开发页和普通 Electron 启动时保留用户已录入数据。

#### Scenario: Browser dev page reads Forge AppData / 浏览器开发页读取 Forge AppData

- **WHEN** 用户打开 `http://127.0.0.1:5173/`
- **THEN** 系统从 `%APPDATA%\Forge\alo-data.json` 读取已有数据
- **AND** 不因为浏览器本地存储为空而显示空数据

#### Scenario: Legacy AppData is migrated into Forge AppData / 旧 AppData 数据迁移到 Forge AppData

- **WHEN** Forge 数据文件不存在
- **AND** 旧 AppData 数据文件存在
- **THEN** 系统将旧数据复制到 `%APPDATA%\Forge\alo-data.json`
- **AND** 用户已录入任务在开发页可见

#### Scenario: Restart does not auto-move historical tasks / 重启不自动搬走历史任务

- **WHEN** 用户在新的一天打开或重启应用
- **THEN** 系统不自动删除、归档或迁移前一天的任务记录
- **AND** 周一填写的任务仍保留在周一日期下

### Requirement: Data directory remains stable / 数据目录保持稳定

系统 MUST（必须）使用稳定的数据目录保存开发数据，避免运行入口变化导致数据不可见。

#### Scenario: Development uses Forge AppData directory / 开发环境使用 Forge AppData 目录

- **WHEN** 应用以开发服务或非打包 Electron 方式运行
- **THEN** 数据读写目录为 `%APPDATA%\Forge`
- **AND** `npm run build` 不删除该目录
