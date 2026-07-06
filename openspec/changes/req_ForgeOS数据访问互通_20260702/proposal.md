## Why

AI 工具(Codex / Claude 等)无法感知 ForgeOS 中的任务状态、心情、能量、复盘和 OKR 数据。数据割裂导致用户需要在 AI 和 ForgeOS 之间手动搬运信息,复盘结果需要重新去写。用户希望通过 AI 工具直接创建任务、维护状态、填写复盘,而非割裂操作。

## What Changes

- 新增 ForgeOS 数据的程序化访问能力,使 AI 工具能读写 ForgeOS 的任务、复盘、心情、能量、OKR、灵感等数据
- 复盘支持双入口:Forge 结构化录入(本 Feature)+ wiki 自由写作,结果均为 AI 参考源

## Capabilities

### New Capabilities
- `forge-data-access`: AI 工具通过标准协议读写 ForgeOS 数据实体的能力

### Modified Capabilities
- 无

## Impact

- 新增:数据访问层(协议和实现方式由 dev-coder 设计)
- 复用:现有数据实体定义(`src/types/index.ts`)、现有 COS 同步链路
- 不改动:现有前端 UI、现有数据模型结构

## 待确认项

- 验收度量:不需要可量化(王总已确认)
- 数据访问协议类型(MCP / HTTP API / 其他)由 dev-coder 决定,需求侧不指定
- 王总已表达技术倾向(数据源使用浏览器本地,复用浏览器自带 COS 同步),作为 design 参考,非需求侧决策

## 用户故事

**As** 王总
**I want** AI 能直接读写 ForgeOS 的任务、复盘、心情、OKR 数据
**So that** 我不用在 AI 和 ForgeOS 之间手动搬运信息,数据自动流动
