## 1. Spec and Test Coverage / 规格与测试覆盖

- [x] 1.1 创建 Android 今日快速新增任务 OpenSpec change。
- [x] 1.2 为移动端今日新增任务入口补充结构测试。
- [x] 1.3 验证空输入不会提交任务的结构约束。

## 2. Mobile Today Implementation / 移动端今日实现

- [x] 2.1 在 `MobileTodayForge` 接入 `addTask` 和新增任务输入状态。
- [x] 2.2 增加右下角 `+` 悬浮按钮，并保证只在移动端今日页内出现。
- [x] 2.3 增加底部任务输入面板，包含输入框、取消和添加任务操作。
- [x] 2.4 保存非空输入后创建今天日期的 active 任务，并关闭面板。

## 3. Layout and Verification / 布局与验证

- [x] 3.1 补充移动端 FAB 和底部输入面板 CSS，避开底部导航与安全区。
- [x] 3.2 运行 OpenSpec、Node 测试、构建和 lint。
- [x] 3.3 使用移动端视口检查今日页布局和交互。
