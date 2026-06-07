## ADDED Requirements
> 中文：新增需求

### Requirement: Android mobile backlog remains offline-capable / Android 收纳箱离线可用

系统 MUST 在 Android App 离线状态下支持移动端收纳箱的查看、维护和安排，并写入应用私有本地存储。

#### Scenario: Android backlog edits persist offline / Android 离线收纳编辑可保留
- **WHEN** Android 设备离线
- **AND** 用户在「推进」页收纳箱新增、编辑、删除或安排任务
- **THEN** 系统 MUST 将操作写入 Android 应用私有本地存储
- **AND** 用户关闭并重新打开 Android App 后 MUST 看到操作结果

#### Scenario: Android backlog keeps existing task payload / Android 收纳保持现有任务载荷
- **WHEN** Android App 执行收纳箱任务操作
- **THEN** 系统 MUST 复用现有任务数据结构
- **AND** 系统 MUST 使用现有同步载荷表达收纳和安排结果
- **AND** 系统 MUST NOT 创建 Android 专属收纳任务模型

### Requirement: Android record page preserves capture and reflection save paths / Android 记录页保留灵感与反思保存路径

系统 MUST 在 Android App 中优化记录页交互时，保留灵感和每日反思的现有保存目标。

#### Scenario: Android inspiration still saves to inspiration vault / Android 灵感仍保存到灵感库
- **WHEN** 用户在 Android App 的「记录」页保存灵感
- **THEN** 系统 MUST 将记录保存到灵感库
- **AND** 系统 MUST 保留用户填写的来源和自定义标签

#### Scenario: Android reflection still saves to reflection library / Android 反思仍保存到反思库
- **WHEN** 用户在 Android App 的「记录」页保存反思
- **THEN** 系统 MUST 将记录保存为每日反思
- **AND** 系统 MUST NOT 将反思保存到灵感库

### Requirement: Android mobile UI optimization does not break core navigation / Android 移动端优化不破坏核心导航

系统 MUST 在本次移动端 UI 优化后继续支持 Android 手机端底部导航和返回手势。

#### Scenario: Optimized pages remain reachable / 优化后页面仍可访问
- **WHEN** 用户在 Android App 中使用底部导航
- **THEN** 用户 MUST 能继续进入今日、推进、记录和系统模块
- **AND** 系统 MUST NOT 新增替代现有四模块的第五个主导航入口

#### Scenario: Android back behavior remains section-based / Android 返回仍按模块回退
- **WHEN** 用户在 Android App 中从一个移动模块切换到另一个移动模块
- **AND** 用户触发系统返回
- **THEN** 系统 MUST 回到上一个移动端模块
- **AND** 系统 MUST NOT 因 UI 优化直接退出应用

### Requirement: Android mobile style preference is local-first / Android 移动端风格偏好本机优先

系统 MUST 允许 Android App 在用户开启本机独立风格后保持当前设备的移动端视觉设置。

#### Scenario: Android local-only style survives restart / Android 本机独立风格重启保留
- **WHEN** 用户在 Android App 中开启本机独立风格并选择移动端视觉风格
- **AND** 用户关闭并重新打开 Android App
- **THEN** 系统 MUST 保持该 Android 设备的移动端风格
- **AND** 系统 MUST NOT 要求联网同步才能恢复本机风格

#### Scenario: Android local-only style does not block data sync / Android 本机风格不阻塞数据同步
- **WHEN** 用户开启本机独立风格
- **AND** 用户继续执行 COS 数据同步
- **THEN** 系统 MUST 继续同步任务、灵感、反思和其他业务数据
- **AND** 系统 MUST NOT 因本机风格偏好阻止 V3 同步
