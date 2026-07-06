> 技术设计（dev-coder / Codex 主 agent 执行）

## 技术选型

**实现方式**: 在 MCP Server 中新增导出工具,复用现有 HTTP 读能力。
不另起进程,不引入新依赖,导出逻辑和数据访问共一套代码。

## 导出工具

在 forge_data_mcp.py 中新增 1 个聚合导出工具:

| 工具 | 数据源 | 输出 |
|------|--------|------|
| export_to_wiki | reflections + moods + objectives | Markdown 字符串 |

AI 调用后拿到 Markdown,写入 E:\wiki 指定目录。
文件命名:`forgeos-周报-YYYY-Www.md`（周报格式,按 ISO 周编号）。

## 导出内容结构

```markdown
# ForgeOS 周报 2026-W27（7/14 - 7/20）

## 本周复盘
（每日反思汇总）

## 心情能量趋势
（mood / energy 数据）

## OKR 进度
（当前周期目标及关键结果）
```

## 数据流

```
AI 调用 export_to_wiki → MCP 读 reflections/moods/objectives
  → 生成 Markdown 预览字符串返回给 AI
  → AI 向用户展示预览内容
  → 用户确认内容齐全
  → AI 派 wiki-curator 按知识库规范写入指定目录
  → wiki-curator 处理 frontmatter / 命名 / 分类 / 关联
```

## 关键变更（2026-07-02 王总反馈）

1. **导出确认机制**: export_to_wiki 只返回预览 Markdown,不自动落库
2. **wiki-curator 负责落库**: 主 agent 不直接写 E:\wiki 文件,派 wiki-curator 按规范处理
3. **用户确认前置**: AI 展示预览 → 用户确认齐全 → 才派 wiki-curator 写入

## 复用关系

- 读 reflections/moods/objectives 复用 forge_data_mcp.py 已有的 _get() helper
- 不新增 HTTP 调用逻辑
- 导出方向: Forge → wiki 单向（王总已确认）
- 落库由 wiki-curator subagent 处理（frontmatter / 命名规范 / 分类 / 关联）

## 风险评估

- 低风险: 纯读取 + 字符串拼接,不写 ForgeOS 数据
- 低风险: AI 负责确认环节,wiki-curator 负责落库（关注点分离）
## 复用关系

- 读 reflections/moods/objectives 复用 forge_data_mcp.py 已有的 _get() helper
- 不新增 HTTP 调用逻辑
- 导出方向: Forge → wiki 单向（王总已确认）

## 风险评估

- 低风险: 纯读取 + 字符串拼接,不写 ForgeOS 数据
- 低风险: AI 负责写文件,MCP 只返回内容（关注点分离）
