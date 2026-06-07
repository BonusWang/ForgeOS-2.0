# Backlog Column Left Order Fix Design / 收纳箱列左侧排序修复设计

## Context / 背景

`TaskBoard` 当前先遍历 `weekDates` 渲染周一到周日，再渲染 `date="BACKLOG"` 的收纳箱列。因此收纳箱在横向滚动区域中位于右侧。用户期望从左到右阅读时，收纳箱应是第一个入口。

## Goals / Non-Goals / 目标与非目标

目标：

- 收纳箱列在周看板最左侧。
- 周一到周日仍保持自然日期顺序。
- 仅改变展示顺序，不改变任务保存和拖拽行为。

非目标：

- 不重新设计周看板布局。
- 不改变 `BACKLOG` 数据标识。
- 不修改 OKR 收纳列的数据来源。

## Decisions / 设计决策

1. 在 `TaskBoard` 的横向列容器中，先渲染 `TaskColumn date="BACKLOG"`。
2. 之后再渲染 `weekDates.map(...)` 的周一到周日列。
3. `OKRInboxColumn` 继续放在周任务列后面，保持其作为 OKR 选择收纳区的辅助位置。

## Risks / Trade-offs / 风险与取舍

- 用户会先看到收纳箱而不是周一列，更符合“先整理，再安排”的入口顺序。
- 旧习惯中从周一开始查看的人需要适应，但周一仍紧跟在收纳箱之后。
