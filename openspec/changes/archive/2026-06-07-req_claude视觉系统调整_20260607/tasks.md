## 1. OpenSpec And Tests / 规格与测试

- [x] 1.1 补齐 Claude 风格替换 Orbit 的设计说明和 delta specs，明确只改视觉不改业务排版。
- [x] 1.2 更新结构测试，先覆盖 Claude 风格循环、旧 `orbit` 偏好兼容、正式 `claude` class/token，以及业务结构不随风格切换变化。

## 2. Desktop Style Replacement / 桌面端风格替换

- [x] 2.1 将桌面端正式视觉类型、风格循环、按钮提示和可见名称从 Orbit 替换为 Claude。
- [x] 2.2 用 `docs/DESIGN/DESIGN-claude.md` 的视觉 token 替换旧 Orbit token，使用开源或系统字体 fallback。
- [x] 2.3 将旧 `orbit-style-shell` 正式 class 和 body data attribute 替换为 `claude-style-shell` / `claude`，不新增业务页面状态或模块结构。

## 3. Mobile Style Replacement / 手机端风格替换

- [x] 3.1 将移动端风格按钮、系统页状态文案和本机独立风格偏好同步为 Claude 命名。
- [x] 3.2 读取旧移动端 `orbit` 偏好时自动映射为 `claude`，新写入值使用 `claude`。
- [x] 3.3 更新移动端 CSS 外观层，使 Claude 风格覆盖原 Orbit 范围但保持底部导航、今日、推进、记录、系统的业务结构不变。

## 4. Verification / 验证

- [x] 4.1 运行相关结构测试，确认旧 Orbit 断言已替换为 Claude 且业务结构约束仍通过。
- [x] 4.2 运行全量 Node 测试、lint 和 build。
- [x] 4.3 如前端页面需要视觉确认，启动本地页面并检查桌面与手机视口的 Claude 风格不改排版。
