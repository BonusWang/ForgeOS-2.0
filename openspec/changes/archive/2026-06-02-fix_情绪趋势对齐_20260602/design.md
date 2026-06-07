# Mood Trend Alignment Fix Design / 情绪趋势对齐修复设计

## Context / 背景

当前情绪追踪表单使用组件内部的 UTC 日期函数生成“今天”，趋势 hook 又使用 `toISOString()` 生成趋势日期。趋势图本体是 7 个字符宽的 ASCII 文本，而日期标签使用整行 `space-between` 分布，两者不在同一套坐标系统内。

## Goals / Non-Goals / 目标与非目标

目标：

- 今日记录日期和趋势日期使用本地日期语义。
- 散点和日期标签在视觉上按同一列对齐。
- 保持情绪保存、修改和删除逻辑不变。

非目标：

- 不重做整个情绪模块。
- 不改变趋势图只展示心情值的现状。
- 不增加复杂统计或 AI 解读。

## Decisions / 设计决策

1. `MoodTrackerPanel` 使用 `src/utils/date.ts` 中的 `getTodayString()`。
2. `useMoodTrend` 使用 `date-fns` 的 `parseISO`、`addDays` 和 `format` 生成本地日期字符串。
3. 趋势图改为 7 列 CSS grid，散点和底部日期标签共享同样的列定义。

## Risks / Trade-offs / 风险与取舍

- 从 ASCII 文本改为网格散点会减少一点旧终端感，但能直接解决日期对齐误导。
- 当前仍只绘制心情值，不绘制能量值，避免一次修复扩大范围。
