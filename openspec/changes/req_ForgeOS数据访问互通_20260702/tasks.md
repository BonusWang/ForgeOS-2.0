> 开发任务（dev-coder / Codex 主 agent 执行）

## Task 1: 实现 MCP Server 核心

- [x] 1.1 创建 mcp-server/forge_data_mcp.py(FastMCP 框架 + HTTP helpers)
- [x] 1.2 实现 list_tasks / create_task / update_task_status
- [x] 1.3 实现 list_reflections / add_reflection
- [x] 1.4 实现 get_moods / get_okr
- [x] 1.5 实现 add_inspiration
- [x] 1.6 实现 get_today_status(聚合查询)

## Task 2: 测试

- [x] 2.1 端到端测试: create → list → update → verify (10/10 passed)
- [x] 2.2 测试复盘写入和读取
- [x] 2.3 测试灵感捕获
- [x] 2.4 测试聚合查询
- [x] 2.5 MCP stdio 通信验证 (initialize + tools/list + tools/call)

## Task 3: MCP 配置和文档

- [x] 3.1 编写 MCP Server 使用说明 (mcp-server/README.md)
- [x] 3.2 各 AI 工具的 MCP 连接配置 (Codex config.toml + Claude .mcp.json)

## Task 4: 验收

- [x] 4.1 openspec validate 通过
- [x] 4.2 端到端: AI 能建任务/查状态/写复盘
- 注: Codex desktop 需重启加载新 MCP 配置; Claude Code 读 .mcp.json
