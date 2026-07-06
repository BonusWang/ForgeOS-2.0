## Why

当前 ForgeOS 关闭后,需要手动到指定目录执行重启命令,操作繁琐。AI 无法直接控制 ForgeOS 服务的生命周期。
同时,项目中存在已废弃的 Go launcher 残留(`launcher/` 目录、`scripts/build-launcher.mjs`、`package.json` 引用、`README.md` 引用),该组件只启动浏览器端且已无复用价值,应清理。

## What Changes

- 新增 AI 可调用的 ForgeOS 服务控制能力(启动 / 停止 / 重启 / 状态检查)
- 重启时自动清理旧残留进程,以脱离 AI 会话的后台方式启动,防止会话关闭导致服务中断
- 删除废弃的 Go launcher 相关代码和所有引用

## Capabilities

### New Capabilities
- `forge-service-control`: AI 通过独立运维 Skill 控制 ForgeOS 服务生命周期

### Modified Capabilities
- 无

## Impact

- 新增:运维 Skill(独立 skill,不含业务逻辑)
- 删除:`launcher/` 目录(browser.go, go.mod, main.go, README.md, storage.go 共 5 个文件)
- 删除:`scripts/build-launcher.mjs`
- 移除:`package.json` 中 `launcher:build` 命令
- 清理:`README.md` 中 launcher 相关描述(约 2 处)
- 不影响:现有 dev 启动流程(`dev-launch.ps1`)、Electron 构建、COS 同步、Android 构建

## 待确认项

- 验收度量:不需要可量化(王总已确认)
- 运维 Skill 的安装位置和命名:需求专家建议 `forge-launcher`,待 dev-coder 确认

## 用户故事

**As** 王总
**I want** AI 能直接重启 ForgeOS(清理旧进程 + 后台启动)
**So that** 我关闭 AI 会话后服务不断,且不用手动到目录去执行
