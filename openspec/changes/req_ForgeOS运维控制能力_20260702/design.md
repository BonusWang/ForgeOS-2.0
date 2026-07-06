> 技术设计（dev-coder / Codex 主 agent 执行）

## 关键约束(来自需求侧)

- 服务启动必须脱离 AI 会话进程树(会话关闭后服务持续运行)
- 重启时自动清理 5173-5180 端口范围的旧进程(参考 `scripts/dev-launch.ps1` 的端口清理逻辑)
- 仅清理 5173-5180 端口上的 node/electron 进程,不影响其他应用

## 技术设计

### 1. 运维 Skill 架构

采用 Codex skill 形式(SKILL.md),安装在项目 `.codex/skills/forge-launcher/`。
Skill 内部调用 PowerShell 脚本 `scripts/forge-service.ps1` 执行服务控制。
脚本提供 4 个命令:status / stop / start / restart。

### 2. 脱离会话的后台启动机制

使用 PowerShell `Start-Process -WindowStyle Hidden` 启动一个独立 PowerShell 进程,
该进程内执行 `npm run dev`(不带 :open 避免抢焦点)。
独立进程的父进程是系统而非 AI 会话,会话关闭不影响。
输出重定向到日志文件,PID 写入 pid 文件供查询。

### 3. Go launcher 清理范围

删除:launcher/ 目录、scripts/build-launcher.mjs、package.json 的 launcher:build 行、
README.md 中 5 处 launcher 描述、.gitignore 中 launcher/web 两行。
保留不动:CHANGELOG.md(历史)、docs/releases/v2.1.0.md(发布说明)、
dev-launch.ps1(仅标题文案含 launcher 字样)、androidProject.test.ts(ic_launcher 是 Android 图标)。

### 4. 风险评估

低风险:launcher 代码无人引用。中风险:detached 进程异常退出时 status 需检测。
对策:status 优先检查端口监听状态,PID 文件仅作辅助。
