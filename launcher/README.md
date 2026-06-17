# Forge-OS Launcher (轻量浏览器端)

一个 ~9MB 的单文件 exe，双击即可在系统默认浏览器里运行 Forge-OS。

## 它解决什么

|  | Electron (`electron:build`) | Launcher (`launcher:build`) |
|---|---|---|
| 产物体积 | ~100MB（含 Chromium + Node runtime） | ~9MB（复用系统浏览器） |
| 运行形态 | 原生桌面窗口 | 浏览器标签页 |
| 数据存储 | `%APPDATA%/Forge/forge-data.json` | **同路径，数据互通** |
| 前端改动 | — | 零改动 |

100MB 的体积几乎全部来自 Electron 自带的 Chromium + Node runtime，业务代码本身只有 2.7MB。Launcher 不打包 runtime，而是启动一个本地 HTTP 服务并调起系统默认浏览器，体积因此降到 ~9MB。

## 构建

需要本机有 Go 1.21+（项目已验证 Go 1.26.4）。

```bash
npm run launcher:build
```

产出 `release/Forge-OS.exe`。构建流程：`vite build` → 复制 `dist/` 到 `launcher/web/` → `go build`（`-ldflags "-s -w"` 去符号表）把前端资源 `embed` 进单 exe。

## 使用

双击 `Forge-OS.exe`：

1. 在本地随机端口启动 HTTP 服务（绑定 `127.0.0.1`，永不端口冲突）
2. 自动打开默认浏览器访问该地址
3. 数据持久化到 `%APPDATA%/Forge/forge-data.json`

关闭控制台窗口或 Ctrl+C 停止。

## 工作原理

前端早在 `src/utils/platformStorage.ts` 就做了存储抽象：当检测到运行在 `localhost` / `127.0.0.1` 时，自动通过 `/__forge_data__` HTTP 接口读写本地文件。Launcher 只需补齐三件事：

- 静态文件服务（`embed` 内嵌 `dist/`）
- `/__forge_data__/{name}` 的 GET / PUT / DELETE（契约与 `vite.config.ts` 的 dev middleware 完全一致）
- 原子写（tmp + rename）+ `.bak` 备份（与 `electron/main.cjs` 一致）

因此前端一行代码都不用改，且与 Electron 版共享同一份数据文件——切换分发形态不丢数据。

## 自定义数据目录

设置环境变量 `FORGE_DATA_DIR` 可改变数据文件位置（调试或便携部署时有用）。
