# ForgeOS Data MCP Server

让 AI 工具(Codex / Claude / 其他 MCP 客户端)读写 ForgeOS 数据。
# 调用规范

AI 在调用 `create_task` / `batch_create_tasks` / `create_session_reflection` 时，MUST 遵守以下规则：

## 任务内容提炼

**content 字段必须简短**（建议 ≤ 20 字），是行动摘要而非完整描述。

| 错误 | 正确 |
|------|------|
| `rehab-checkin 锁屏+PIN解锁开发（需求已锁定，文档 docs/lock-screen-需求-v0.1.md）- 4位PIN，首次设密，冷启动解锁...（500字）` | `锁屏+PIN解锁开发` |
| `本周四周会事项登记` | `周四会事项登记` |
| `统计下明天要带的物品，确保没有遗漏` | `统计明天要带的物品` |

**规则：**
1. AI 在调用前先提炼用户意图，用动宾结构短语（做什么）
2. 去掉修饰语、文档引用、技术细节、验收标准 —— 这些不属于任务卡
3. 如果一个事项太复杂无法用短句概括，拆成多个子任务
4. context / 详情由 AI 在对话中保留，不灌进 ForgeOS 看板

## 批量创建时

`batch_create_tasks` 的每个 item content 同样遵守上述规则。AI 分析会话上下文后，提炼出的每条事项都应是简短行动项。

## 前提

ForgeOS dev server 必须在 localhost:5173 运行。用 forge-launcher skill 启动:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "E:\github\ForgeOS-2.0\scripts\forge-service.ps1" start
```

## 工具列表

| 工具 | 说明 |
|------|------|
| `list_tasks` | 查询任务(可按日期/状态过滤) |
| `create_task` | 创建任务 |
| `update_task_status` | 修改任务状态 |
| `list_reflections` | 查询复盘记录(可按日期范围) |
| `add_reflection` | 写入每日复盘 |
| `get_moods` | 读取近期心情能量 |
| `get_okr` | 读取当前 OKR |
| `add_inspiration` | 捕获灵感 |
| `get_today_status` | 今日综合状态(未完成任务+心情) |
| `export_to_wiki` | 导出周报 Markdown(复盘+趋势+OKR) |
| `batch_create_tasks` | 从会话上下文批量创建任务 |
| `create_session_reflection` | 会话总结结构化为复盘记录 |
| `create_okr_from_text` | 目标描述拆解为 OKR |
| `convert_inspiration_to_task` | 灵感转任务 |
| `draft_weekly_review` | 读本周数据生成周复盘草稿 |
| `get_productivity_insights` | 效率趋势分析(完成率+心情关联) |

## 配置

### Codex Desktop

在 `~/.codex/config.toml` 添加:

```toml
[mcp_servers.forge-os-data]
command = "python"
args = ['E:\github\ForgeOS-2.0\mcp-server\forge_data_mcp.py']
```

### Claude Code

项目根目录已有 `.mcp.json`，Claude Code 会自动加载。

## 数据流

```
AI Tool → MCP stdio → forge_data_mcp.py → HTTP → vite dev server → forge-data.json → V3 Sync → COS → 手机端
```
