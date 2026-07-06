## ADDED Requirements

### Requirement: 服务生命周期控制

系统 SHALL 通过独立运维 Skill 支持 AI 对 ForgeOS dev 服务的启动、停止、重启和状态检查。

#### Scenario: 重启服务并清理旧残留
- **WHEN** AI 收到"重启 ForgeOS"指令
- **THEN** 检查并清理 5173-5180 端口范围的旧 node/electron 进程
- **AND** 以脱离 AI 会话进程树的后台方式启动新的 dev 服务
- **AND** 返回启动状态(端口号、进程 PID)

#### Scenario: 会话关闭后服务持续运行
- **WHEN** AI 会话关闭
- **THEN** ForgeOS dev 服务不受影响,持续运行

#### Scenario: 服务状态检查
- **WHEN** AI 查询 ForgeOS 服务状态
- **THEN** 返回服务运行状态(运行中 / 未运行)、端口号、进程 PID

#### Scenario: 停止服务
- **WHEN** AI 收到"停止 ForgeOS"指令
- **THEN** 清理 5173-5180 端口范围的 node/electron 进程
- **AND** 返回清理结果

### Requirement: 废弃 Go launcher 清理

废弃的 Go launcher 相关代码和所有引用 MUST 被删除。

#### Scenario: launcher 残留清理
- **WHEN** 执行 launcher 清理
- **THEN** 删除 `launcher/` 目录(browser.go, go.mod, main.go, README.md, storage.go)
- **AND** 删除 `scripts/build-launcher.mjs`
- **AND** 移除 `package.json` 中 `launcher:build` 命令
- **AND** 清理 `README.md` 中 launcher 相关描述
- **AND** 不影响现有 dev 启动(`dev-launch.ps1`)、Electron 构建(`electron:build`)、COS 同步、Android 构建
