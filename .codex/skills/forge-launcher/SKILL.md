---
name: forge-launcher
description: 控制 ForgeOS dev 服务的生命周期(启动/停止/重启/状态检查)。当用户说"重启 ForgeOS / 启动 ForgeOS / 停止 ForgeOS / ForgeOS 状态"时使用。后台启动脱离 AI 会话,关闭会话后服务不断。
---

# Forge Launcher

控制 ForgeOS dev 服务的生命周期。AI 通过 PowerShell 脚本操作服务,启动后服务在后台独立运行,不受 AI 会话关闭影响。

## 脚本

`scripts/forge-service.ps1` — 位于 ForgeOS-2.0 项目根目录。

## 命令

所有命令通过 shell 调用:

```powershell
# 查看服务状态
powershell -NoProfile -ExecutionPolicy Bypass -File "E:\github\ForgeOS-2.0\scripts\forge-service.ps1" status

# 停止服务(清理 5173-5180 端口的旧进程)
powershell -NoProfile -ExecutionPolicy Bypass -File "E:\github\ForgeOS-2.0\scripts\forge-service.ps1" stop

# 启动服务(后台 detached,会话关闭不断)
powershell -NoProfile -ExecutionPolicy Bypass -File "E:\github\ForgeOS-2.0\scripts\forge-service.ps1" start

# 重启服务(stop + start,清理旧残留后启动新的)
powershell -NoProfile -ExecutionPolicy Bypass -File "E:\github\ForgeOS-2.0\scripts\forge-service.ps1" restart
```

## 触发词

| 用户说 | 执行命令 |
|--------|----------|
| "重启 ForgeOS" / "restart" | `restart` |
| "启动 ForgeOS" / "start" / "打开 Forge" | `start` |
| "停止 ForgeOS" / "stop" / "关掉 Forge" | `stop` |
| "ForgeOS 状态" / "ForgeOS 在跑吗" / "status" | `status` |

## 输出格式

所有命令返回 JSON,包含运行状态、端口号、进程 PID。

## 注意事项

- 服务监听 5173-5180 端口范围,仅清理该范围内的 node/electron 进程,不影响其他应用
- 启动的进程通过 `Start-Process -WindowStyle Hidden` 运行,脱离 AI 会话进程树
- 日志输出到 `vite-dev.out.log` 和 `vite-dev.err.log`
- PID 文件 `vite-dev-current.pid` 仅供参考,status 优先以端口检测为准
