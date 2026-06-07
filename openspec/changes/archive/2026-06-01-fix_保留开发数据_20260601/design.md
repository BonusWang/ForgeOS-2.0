# Preserve Development Data Design / 保留开发数据设计

## Context

> 中文：背景

当前 Electron 主进程使用 `app.getPath('userData')` 拼接 `alo-data.json`。当应用名、包名或打包产品名变化时，Electron 可能使用新的 `userData` 目录。旧数据文件没有被删除，但新应用读不到旧路径，用户会感知为“编译或重启后数据丢失”。

本机已发现旧数据位于：

```text
C:\Users\Domain1127\AppData\Roaming\ascii-life-os\alo-data.json
```

因此第一版修复应优先稳定数据目录，而不是迁移数据结构。

## Decisions

> 中文：设计决策

1. Electron 数据目录固定为 `appData/ascii-life-os`，作为历史兼容目录继续使用。
2. 品牌名仍可显示为 `Forge`，但数据目录不随品牌名变化。
3. 默认启动不清理数据。
4. 显式清理只通过参数或环境变量触发。
5. 支持的清理入口：
   - CLI 参数：`--reset-data` 或 `--clear-data`
   - 环境变量：`FORGE_RESET_DATA=1`
6. 清理只删除已知数据文件：主数据、备份、回滚和临时文件。
7. 不使用递归删除，避免误删用户目录。

## Root Cause Hypothesis

> 中文：根因假设

根因是 Electron `userData` 路径和应用身份耦合。品牌/包名从旧名称调整为 `Forge` 后，数据目录可能改变，新进程无法读取旧目录的数据文件。

验证证据：

- 旧数据文件仍存在，说明数据没有真正被编译删除。
- 当前代码在主进程启动时直接用 `app.getPath('userData')` 计算数据文件路径。
- `package.json` 的 `name` 和 `build.productName` 已改为 `Forge`，具备触发默认路径变化的条件。

## Validation

> 中文：验证方式

- OpenSpec 校验通过。
- `npm run build` 通过。
- 启动参数不存在时，主进程数据路径仍指向历史兼容目录。
- 不传清理参数时，不删除 `alo-data.json`。
- 只有传入 `--reset-data`、`--clear-data` 或 `FORGE_RESET_DATA=1` 时才允许删除已知数据文件。
