> 技术设计（dev-coder / Codex 主 agent 执行）

## 技术选型

**语言**: Python 3.11（mcp v1.27.0 已全局安装）
**理由**: ForgeOS 是前端项目(Node.js),MCP Server 用 Python 不引入 npm 依赖;
HTTP 调用用标准库 urllib,零额外依赖。
**运行模式**: stdio(AI 工具按需启动,不需要常驻)

## 架构

```
AI Tool (Codex/Claude/...)
    ↓ MCP stdio
mcp-server/forge_data_mcp.py (Python FastMCP)
    ↓ HTTP GET/PUT
Vite Dev Server (localhost:5173)
    ↓ /__forge_data__/{name}
forge-data.json → V3 Sync → COS → 手机端
```

## 数据访问模式

read-modify-write via HTTP:
1. GET /__forge_data__/{entity} → 获取当前实体数组
2. 内存中操作(过滤/添加/修改)
3. 写操作: PUT /__forge_data__/{entity} → 写回

## 工具列表

| 工具 | 操作 | 对应实体 |
|------|------|----------|
| list_tasks | 读 | tasks |
| create_task | 读写 | tasks |
| update_task_status | 读写 | tasks |
| list_reflections | 读 | reflections |
| add_reflection | 读写 | reflections |
| get_moods | 读 | moods |
| get_okr | 读 | objectives |
| add_inspiration | 读写 | inspirations |
| get_today_status | 聚合读 | tasks + moods |

## 前提条件

- ForgeOS dev server 必须在跑(通过 forge-launcher skill 启动)
- dev server 未运行时,工具返回错误提示

## 关键约束(来自需求侧)

- 数据实体定义见 src/types/index.ts
- 写操作后数据通过浏览器现有 COS 同步链路同步到云端

## 风险评估

- 低风险: read-modify-write 在单用户场景下无并发问题
- 低风险: 不改动前端代码,只读写现有存储接口
- 中风险: PUT 是全量覆盖,GET 和 PUT 之间浏览器端修改可能丢失
  - 对策: 操作快速完成(GET → 改 → PUT)
