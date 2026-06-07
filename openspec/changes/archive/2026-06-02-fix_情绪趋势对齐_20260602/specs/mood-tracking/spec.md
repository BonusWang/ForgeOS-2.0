## ADDED Requirements

> 中文：新增需求

### Requirement: Mood trend points align with date labels / 情绪趋势点必须与日期标签对齐

情绪追踪 MUST（必须）让近 7 天趋势图中的每个散点与其对应日期标签处于同一列，避免用户误以为今日记录保存到了历史日期。

#### Scenario: Today mood appears under today label / 今日情绪显示在今日标签下

- **WHEN** 用户保存今日情绪记录
- **AND** 情绪趋势图展示近 7 天日期
- **THEN** 今日情绪散点显示在今日日期标签所在列
- **AND** 不显示在近 7 天第一天的日期标签列

#### Scenario: Trend dates use local day semantics / 趋势日期使用本地日期语义

- **WHEN** 系统生成近 7 天情绪趋势
- **THEN** 日期范围基于本地日期生成
- **AND** 不使用 UTC 日期格式导致本地日期错位
