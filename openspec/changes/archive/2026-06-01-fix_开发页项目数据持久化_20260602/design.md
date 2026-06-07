# Dev Page Forge AppData Persistence Design / 开发页 Forge AppData 持久化设计

## Context / 背景

当前系统存在两个运行入口：

- Electron：通过 `window.electronAPI` 读写 `alo-data.json`。
- Vite 开发页：没有 Electron IPC，只能回退到浏览器 `localStorage`。

用户实际常用 `http://127.0.0.1:5173/` 检查效果，因此旧修复只覆盖 Electron 不够。数据仍在旧文件里，但开发页读不到。

最新决策：数据目录固定为 `%APPDATA%\Forge`，不放到项目目录。

## Goals / Non-Goals / 目标与非目标

目标：

- 开发页、开发 Electron 和编译过程共享同一份 `%APPDATA%\Forge` 数据文件。
- 重启、热更新、重新编译不导致录入数据不可见。
- 保留旧 `%APPDATA%\ascii-life-os` 数据的自动迁移路径。

非目标：

- 不引入数据库。
- 不实现多设备同步。
- 不改变业务 store 的状态结构。

## Decisions / 设计决策

1. Forge 数据文件固定为 `%APPDATA%\Forge\alo-data.json`。
2. Vite 开发服务新增本地接口，负责读写 Forge AppData 数据文件。
3. 浏览器开发页在 `localhost` 或 `127.0.0.1` 下优先使用开发服务存储接口。
4. Electron 开发运行和打包运行都使用 Forge AppData 数据文件。
5. 如果 Forge 数据文件不存在，但旧 `%APPDATA%\ascii-life-os\alo-data.json` 存在，则自动复制到 Forge 数据文件。
6. 不使用项目目录保存用户数据。
7. 应用启动时不再自动搬移或归档历史任务；重启只更新访问日期，避免用户感知为数据丢失。

## Risks / Trade-offs / 风险与取舍

- 开发页依赖 Vite 服务提供存储接口；如果直接打开静态文件，仍会回退到浏览器存储。
- Forge AppData 固定路径更符合用户对本机持久化的预期，但需要从旧目录迁移。
- 迁移优先复制旧数据，不做合并，避免误合并不同环境的状态。
- 停止自动搬移任务会减少“自动续期未完成任务”的便利，但优先保证历史记录不被静默改写。
