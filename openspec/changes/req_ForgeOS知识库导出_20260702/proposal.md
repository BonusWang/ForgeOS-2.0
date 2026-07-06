## Why

ForgeOS 的复盘、心情趋势、OKR 进度等数据未沉淀到知识库,AI 工具无法通过知识库获取这些长期上下文。数据割裂导致知识库缺少用户的行为画像和成长轨迹。需要打通 Forge→知识库的单向数据流,让 AI 通过知识库拥有用户的长期画像。

## What Changes

- 新增 Forge→知识库单向导出能力,将复盘快照、心情能量趋势、OKR 进度周期性导出为 Markdown 存入 `E:\wiki`
- 复盘双入口归位:Forge 结构化录入 + wiki 自由写作,均为 AI 参考源;导出使 wiki 成为复盘汇聚地

## Capabilities

### New Capabilities
- `forge-wiki-export`: 将 ForgeOS 数据周期性导出为知识库 Markdown 的能力

### Modified Capabilities
- 无

## Impact

- 新增:导出模块(实现细节由 dev-coder 设计)
- 依赖:Feature 1(`forge-data-access`)的读能力
- 写入:`E:\wiki` 下指定目录(具体子目录待确认)
- 不改动:现有知识库结构

## 待确认项

- 验收度量:不需要可量化(王总已确认)
- 导出目标路径:E:\wiki 下具体子目录待确认
- 导出触发方式(定时 / 手动 / 事件驱动)待 dev-coder 设计
- 导出的 Markdown 是否需要 frontmatter 元数据(参考 wiki 规范)待确认

## 用户故事

**As** 王总
**I want** ForgeOS 的复盘、心情、OKR 数据自动导出到知识库
**So that** AI 通过知识库就能了解我的长期状态和成长轨迹,不用每次去 ForgeOS 查
