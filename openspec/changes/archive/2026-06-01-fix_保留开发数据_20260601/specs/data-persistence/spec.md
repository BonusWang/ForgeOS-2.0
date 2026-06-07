## ADDED Requirements

> 中文：新增需求

### Requirement: Development builds preserve user data / 开发构建保留用户数据

系统 MUST（必须）在开发、编译、热更新、重启和普通 Electron 启动时保留用户已录入数据。

#### Scenario: Build does not clear persisted data / 编译不清理持久化数据

- **WHEN** 开发者运行 `npm run build`
- **THEN** 用户已录入的数据文件保持不变
- **AND** 构建流程不触发数据清理

#### Scenario: Restart reads existing data / 重启读取已有数据

- **WHEN** 应用重启
- **THEN** 系统从稳定数据目录读取已有数据
- **AND** 不因为品牌名、包名或产品名变化切换到空数据目录

### Requirement: Data directory remains stable / 数据目录保持稳定

系统 MUST（必须）使用稳定的数据目录保存 Electron 数据，避免展示品牌变化导致数据路径漂移。

#### Scenario: Forge uses legacy-compatible data directory / Forge 使用历史兼容数据目录

- **WHEN** 应用展示品牌为 `Forge`
- **THEN** Electron 数据仍保存在历史兼容目录 `ascii-life-os`
- **AND** 旧的 `alo-data.json` 可以继续被读取

### Requirement: Data clearing is explicit only / 数据清理必须显式触发

系统 MUST（必须）只在用户明确说明或开发者传入显式清理参数时清理数据。

#### Scenario: Default launch never clears data / 默认启动不清理数据

- **WHEN** 应用不带清理参数启动
- **THEN** 系统不删除主数据、备份、回滚或临时数据文件

#### Scenario: Reset flag allows data clearing / 清理参数允许清理数据

- **WHEN** 应用使用 `--reset-data`、`--clear-data` 或 `FORGE_RESET_DATA=1` 启动
- **THEN** 系统可以清理已知数据文件
- **AND** 清理范围只包含主数据、备份、回滚和临时数据文件

#### Scenario: Reset avoids recursive deletion / 清理避免递归删除

- **WHEN** 系统执行显式数据清理
- **THEN** 系统不执行递归目录删除
- **AND** 不删除数据目录之外的任何文件
