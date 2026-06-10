# ForgeOS-2.0

<div align="center">

# Forge-OS

**Forge yourself —— 自己锻造自己**

一个本地优先的个人目标确认、每日推进与成长复盘系统。

[![version](https://img.shields.io/badge/release-v2.0.1-E8D5B5?style=flat-square&labelColor=2f2a24&color=E8D5B5)](docs/releases/v2.0.1.md)
[![desktop](https://img.shields.io/badge/Desktop-Electron-7a96a6?style=flat-square&labelColor=2f2a24)](package.json)
[![mobile](https://img.shields.io/badge/Mobile-Android_WebView-9b7b5d?style=flat-square&labelColor=2f2a24)](android/app/build.gradle)
[![sync](https://img.shields.io/badge/Sync-COS_V3-5a6e5c?style=flat-square&labelColor=2f2a24)](src/sync/v3/v3SyncRunner.ts)

</div>

---

## 效果预览

<div align="center">
<img src="docs/product/assets/forge-agent-review-desktop.svg" width="100%" alt="Forge-OS desktop preview">
</div>

Forge-OS 把周看板、每日反思、周复盘、月度 OKR、数据备份和 COS 同步放在同一套本地优先基板中。它不是一个更吵的待办软件，而是一套帮助你每天留下证据、每周收束卡点、每月修正目标的个人操作系统。

当前发布版本：v2.0.1（工程版本 `2.0.1`）。Forge OS 2.0 从 v2.0 起作为独立大版本发布。发布说明见 [docs/releases/v2.0.1.md](docs/releases/v2.0.1.md)。

---

## 30 秒上手

```bash
npm ci
npm run dev
```

常用构建命令：

```bash
npm run build
npm run electron:build
```

Android 工程构建入口：

```bash
npm run android:build
```

---

## 核心亮点

| 模块 | 说明 |
|---|---|
| 周看板 | 用收集箱、今日承诺和任务推进，把本周行动压到可执行范围内 |
| 每日反思 | 用固定模板记录当天事实、能量、卡点和下一步，形成可回看的证据流 |
| 周复盘 | 汇总完成、卡点和下周一件调整；保存后展示“周复盘已保存”摘要，并可继续查看/编辑 |
| 月度 OKR | 用月度目标承接每周证据，避免目标只停留在口号里 |
| 移动端闭环 | Android / 手机页面覆盖今日、推进、记录、系统四个高频入口 |
| COS V3 同步 | 基于实体级 envelope、namespace、三方合并和冲突保留，支持浏览器与手机跨端同步 |
| 本地优先 | Electron、Android 私有存储和浏览器 localStorage 都走统一数据迁移与备份契约 |
| 系统信任 | 系统页提供数据健康、备份、同步、更新和使用节奏提示，让用户知道数据在哪里、状态如何 |

---

## 使用节奏

- 早上：清空收集箱，选出今日承诺。
- 白天：推进最多三件事，临时想法先收集。
- 晚上：写每日反思，留下今天的证据。
- 周末：打开周复盘，沉淀完成、卡点和下周一件调整；保存后页面会进入“周复盘已保存”摘要，可随时查看/编辑。
- 月底：查看成长证据，修正下月目标。

这套节奏是产品工作流说明，不新增独立数据模型，也不改变现有持久化、同步或 Android 私有存储契约。

---

## 平台与数据

| 平台 | 存储方式 | 入口 |
|---|---|---|
| 浏览器开发环境 | localStorage + 迁移层 | `npm run dev` |
| Electron 桌面端 | 本机文件存储 + 退出前同步刷盘 | `npm run electron:build` |
| Android WebView | App 私有文件 `forge-data.json`，不依赖 WebView localStorage | `npm run android:build` |
| COS 云同步 | `Forge-OS_Base/v2.0/Domain1127` 前缀下的 V3 实体快照与历史备份 | 系统页同步面板 |

COS 相关配置以 `.env.example` 为模板；真实密钥只放本地环境变量，不提交到仓库。

---

<details>
<summary><strong>开发命令</strong></summary>

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务 |
| `npm run build` | TypeScript 编译并生成前端生产包 |
| `npm run lint` | 运行 ESLint |
| `npm run preview` | 预览生产构建 |
| `npm run electron:build` | 构建桌面端安装/便携产物 |
| `npm run android:build` | 构建 Android 工程 |
| `npm run android:install` | 安装 Android 构建到设备 |
| `npm run android:smoke` | 运行 Android 冒烟脚本 |
| `npm run cos:signer` | 启动本地 COS 签名服务 |

</details>

<details>
<summary><strong>目录结构</strong></summary>

```text
ForgeOS-2.0/
├── android/                 # Android WebView 壳与 Gradle 工程
├── electron/                # Electron 主进程与 preload
├── docs/                    # 产品设计、发布说明、实施计划
├── openspec/                # OpenSpec 正式规格与归档变更
├── public/                  # 静态资源
├── scripts/                 # Android、COS、构建辅助脚本
├── src/
│   ├── features/            # 周看板、反思、OKR、同步、系统等功能模块
│   ├── pages/               # 桌面端页面
│   ├── store/               # Zustand 状态切片
│   ├── sync/                # COS 与 V3 实体级同步
│   ├── types/               # 数据契约
│   └── utils/               # 日期、迁移、存储与更新工具
└── tests/                   # Node test 结构与数据契约测试
```

</details>

<details>
<summary><strong>发布与版本</strong></summary>

- 当前产品大版本：Forge OS 2.0。
- 对外发布版本：v2.0.1。
- 工程版本：`2.0.1`。
- GitHub Release：`v2.0.1`，由 electron-builder 按 semver 自动发布桌面端资产。
- Android 版本：`versionName 2.0.1`、`versionCode 21`。

发布工作流位于 `.github/workflows/release.yml`，通过 `v*` tag 或手动 workflow dispatch 触发。

</details>

<details>
<summary><strong>Windows 用户</strong></summary>

推荐使用 PowerShell 7+ 或 Windows Terminal。首次安装依赖：

```powershell
npm ci
npm run dev
```

如果 PowerShell 5.1 下中文输出出现乱码，可临时切换为 UTF-8：

```powershell
chcp 65001
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

Android 构建需要本机具备 Android SDK 和 Java 17；脚本会检查 `JAVA_HOME`。

</details>

---

## License

MIT
