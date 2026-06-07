## 1. Tests / 测试

- [x] 1.1 新增移动端记录 Stepper 与捕捉边界结构测试。
- [x] 1.2 运行新增测试并确认实现前失败。

## 2. OpenSpec / 规格

- [x] 2.1 运行 `openspec validate --all --strict --no-interactive` 确认新变更规格有效。

## 3. Mobile Record Stepper / 移动记录页 Stepper

- [x] 3.1 将灵感流程节点改为可点击 Stepper 按钮。
- [x] 3.2 将反思流程节点改为同一套可点击 Stepper，并支持多于四个步骤。
- [x] 3.3 当前步骤切换时只展示对应输入或确认内容。
- [x] 3.4 去掉外侧装饰流程线，避免两套流程链并存。
- [x] 3.5 将最近灵感/最近反思历史区移出流程线范围，并去掉重复的「最近保存」标题。

## 4. Capture Boundary Copy / 捕捉边界文案

- [x] 4.1 桌面捕捉入口表达为待澄清/捕捉入口。
- [x] 4.2 周看板 `BACKLOG` 列表达为待安排任务。
- [x] 4.3 OKR/能力入口中的 `inboxItems` 操作文案表达为加入待澄清。
- [x] 4.4 移动端待澄清澄清动作表达为转为待安排任务。
- [x] 4.5 保持 `inboxItems`、`tasks.date === 'BACKLOG'`、`inspirations`、`reflections` 数据路径不变。

## 5. Verification / 验证

- [x] 5.1 运行新增结构测试并确认通过。
- [x] 5.2 运行 `openspec validate --all --strict --no-interactive`。
- [x] 5.3 运行 `node --test tests/*.test.ts`。
- [x] 5.4 运行 `npm run lint`。
- [x] 5.5 运行 `npm run build`。
- [x] 5.6 运行 `npm run android:build`。
- [x] 5.7 使用 in-app Browser 检查 `http://127.0.0.1:5173/` 页面渲染和记录页基本视觉。
