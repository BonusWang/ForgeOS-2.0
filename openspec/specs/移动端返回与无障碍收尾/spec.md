# 移动端返回与无障碍收尾 Specification

## Purpose
约束移动端临时面板的 Android 返回优先级，并确保主入口、任务操作、待澄清操作和系统健康状态在 TalkBack 与大字体场景下保持可读。
## Requirements
### Requirement: Mobile transient panels close before section back / 移动临时面板优先于模块返回关闭
系统 MUST 在移动端临时面板打开时，让 Android 系统返回优先关闭该面板，然后才回退移动模块。

#### Scenario: User presses Android back while a mobile panel is open / 用户在移动面板打开时按返回
- **WHEN** 今日任务输入面板、推进周复盘面板、收纳安排面板、记录 composer 或系统工具面板处于打开状态
- **AND** 用户触发 Android 系统返回
- **THEN** 系统 MUST 优先关闭当前临时面板
- **AND** 系统 MUST NOT 因第一次返回直接退出 App 或跳过当前移动模块

### Requirement: Mobile controls are readable by TalkBack / 移动控件可被 TalkBack 读取
系统 MUST 为移动端主入口、任务操作、待澄清操作和系统健康状态提供明确可访问名称或状态。

#### Scenario: User navigates mobile UI with TalkBack / 用户使用 TalkBack 浏览移动端
- **WHEN** 用户在移动端浏览底部导航、任务操作、待澄清操作和系统健康摘要
- **THEN** 关键按钮 MUST 具有明确 `aria-label` 或可读文本
- **AND** 同步/健康状态 MUST 使用可读状态区域表达
- **AND** 系统 MUST 保持四个移动主入口不变

### Requirement: Mobile keyboard panels keep save and cancel reachable / 移动输入面板保持保存取消可触达
系统 MUST 在移动输入面板打开并遇到软键盘时，保持保存和取消操作具有可读名称并位于面板内。

#### Scenario: User edits a mobile input panel / 用户编辑移动输入面板
- **WHEN** 用户打开今日任务输入、记录 composer 或收纳安排面板
- **THEN** 面板 MUST 提供清晰的保存/取消/关闭操作
- **AND** 操作按钮 MUST 具备适合手机触控的可读名称
