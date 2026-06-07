# Dev Page Forge AppData Persistence / 开发页 Forge AppData 持久化

## Why

> 中文：为什么

用户在 2026-06-02 反馈：周一填写的任务再次消失。排查发现 `C:\Users\Domain1127\AppData\Roaming\ascii-life-os\alo-data.json` 中仍存在 2026-06-01 的任务，说明数据没有被真正删除。

当前问题是运行入口不一致：Electron 读取 AppData 数据文件，而 `http://127.0.0.1:5173/` 的 Vite 开发页只能使用浏览器本地存储，无法读取固定 AppData 数据文件。用户重启或切换运行方式后，会看到空数据。

用户明确要求：本地存储路径固定到 `%APPDATA%\Forge`，不要放在项目目录中。

## What Changes

> 中文：改动内容

- 将开发页和 Electron 的数据保存到固定目录 `%APPDATA%\Forge\alo-data.json`。
- Vite 开发服务提供本地存储接口，浏览器开发页通过该接口读写 `%APPDATA%\Forge` 数据文件。
- 当 Forge 数据文件不存在时，从旧 `%APPDATA%\ascii-life-os\alo-data.json` 自动迁移一次。
- 不再把用户数据放入项目目录。

## Impact

> 中文：影响范围

- 影响数据保存和读取路径。
- 影响开发页 `127.0.0.1:5173` 的持久化策略。
- 不改变任务、OKR、能力、反思等业务数据结构。
- 不清理任何已有数据。

## Out of Scope

> 中文：暂不包含

- 不做云同步。
- 不做账号体系。
- 不做项目目录内数据持久化。
