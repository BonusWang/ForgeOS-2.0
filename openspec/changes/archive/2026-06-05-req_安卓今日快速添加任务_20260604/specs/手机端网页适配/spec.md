## ADDED Requirements
<!-- 中文：新增需求。此标题是 OpenSpec 解析关键字，请保持英文原文不变。 -->

### Requirement: Android today module supports quick task entry / 安卓今日模块支持快速新增任务

系统 MUST 在 Android/手机端「今日」模块提供可触达的快速新增任务入口，使用户可以在当前页面直接创建今天的任务。

#### Scenario: Floating add button is reachable without covering navigation / 悬浮新增按钮可触达且不遮挡导航

- **WHEN** 用户在 Android 或手机网页视口打开「今日」模块
- **THEN** 页面右下区域展示一个 `+` 新增任务按钮
- **AND** 按钮不遮挡底部主导航的「今日、推进、记录、系统」入口
- **AND** 按钮的触控尺寸适合单手点击

#### Scenario: Add button opens a bottom task input panel / 点击新增按钮打开底部任务输入面板

- **WHEN** 用户点击 `+` 新增任务按钮
- **THEN** 系统展示底部任务输入面板
- **AND** 面板包含任务输入框、取消操作和添加任务操作
- **AND** 面板保持在当前手机视口内，不产生横向溢出

#### Scenario: Saving a non-empty task creates today's task / 保存非空输入创建今日任务

- **WHEN** 用户在底部任务输入面板输入非空任务内容并点击添加任务
- **THEN** 系统将该内容保存为今天日期的 active 任务
- **AND** 新任务进入与桌面周看板相同的任务数据流
- **AND** 今日承诺和今日完成计数可基于该任务更新

#### Scenario: Empty task input is not submitted / 空任务输入不提交

- **WHEN** 用户未输入内容或只输入空白字符
- **THEN** 添加任务操作不可提交或不会创建任务
- **AND** 系统不生成空白今日任务
