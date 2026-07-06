> 开发任务（dev-coder / Codex 主 agent 执行）

## Task 1: 实现 export_to_wiki 工具

- [x] 1.1 在 forge_data_mcp.py 新增 export_to_wiki(读 reflections + moods + objectives)
- [x] 1.2 生成 Markdown 字符串（周报格式,含复盘/趋势/OKR）
- [x] 1.3 支持 week_offset 参数（默认本周,可查历史周）

## Task 2: 测试

- [x] 2.1 端到端: export_to_wiki 返回有效 Markdown
- [x] 2.2 验证 Markdown 结构（复盘/趋势/OKR 三段）

## Task 3: 文档和配置

- [x] 3.1 更新 mcp-server/README.md 补充导出工具
- [x] 3.2 wiki 写入路径: E:\wiki\wiki-知识库\synthesis-综合分析\ (AI 负责写入)

## Task 4: 验收

- [x] 4.1 openspec validate 通过
- [x] 4.2 端到端: AI 调用 export_to_wiki 返回完整 Markdown
- 注: Codex 需重启加载新工具(export_to_wiki)
## Task 3: 确认机制 + wiki-curator 落库（2026-07-02 王总反馈补充）

- [ ] 3.1 export_to_wiki 定位调整:只返回预览 Markdown,不自动落库
- [ ] 3.2 主 agent 展示预览 → 用户确认 → 派 wiki-curator 落库
- [ ] 3.3 wiki-curator 按规范处理 frontmatter / 命名 / 分类 / 关联
