## ADDED Requirements
> 中文：新增需求

### Requirement: Claude style provides visual and interaction treatment / Claude 风格提供视觉与交互处理

Claude 风格 MUST 参考 `docs/DESIGN/DESIGN-claude.md` 的视觉系统，使用 Forge-OS 自有内容实现暖奶油画布、珊瑚主色、浅色卡片表面、深色产品表面、细边框、8/12/16 圆角层级和编辑感标题层级。

#### Scenario: Claude style uses expected visual tokens / Claude 风格使用预期视觉 token

- **WHEN** 用户切换到 Claude 风格
- **THEN** 页面 MUST 使用暖奶油背景、珊瑚强调色、浅色卡片表面、细边框和克制圆角
- **AND** 标题字体 MUST 使用开源或系统替代字体栈
- **AND** 系统 MUST NOT 引入商业字体文件

#### Scenario: Claude style avoids copied brand content / Claude 风格不照抄品牌内容

- **WHEN** Claude 风格实现完成
- **THEN** 页面 MUST 继续展示 Forge-OS 品牌、导航文案和业务内容
- **AND** 页面 MUST NOT 复制 Claude 或 Anthropic 的 Logo、品牌文案或产品叙事

#### Scenario: Claude style preserves business structure / Claude 风格保留业务结构

- **WHEN** 用户在 Claude 风格下查看周看板、反思库、周复盘、月度 OKR 或系统页
- **THEN** 页面业务模块集合、模块顺序和业务操作语义 MUST 保持不变
- **AND** store 结构、持久化格式、Electron IPC 合约和同步逻辑 MUST 不发生变化

## MODIFIED Requirements
> 中文：修改需求

### Requirement: Style toggle replaces separate new system page / 风格切换替代独立新系统页

系统 MUST（必须）使用风格切换入口在原风格、Claude 风格、Supabase 参考风格和 Dossier 风格之间切换，而不是通过 `[◇ 新系统]` 跳转到独立页面。

#### Scenario: Style toggle is available / 风格切换可用

- **WHEN** 用户查看应用导航
- **THEN** 导航展示风格切换入口
- **AND** 导航不展示 `[◇ 新系统]`

#### Scenario: Toggle cycles through visual styles / 可循环切换风格

- **WHEN** 用户连续点击风格切换入口
- **THEN** 系统在原风格、Claude 风格、Supabase 风格和 Dossier 风格之间循环
- **AND** 当前功能页面保持在同一业务页面上

### Requirement: Layout polish preserves business behavior / 排版优化保持业务行为

系统 MUST（必须）只通过页面层容器、网格、间距和视觉交互呈现优化布局，不得改变业务模块集合、业务操作语义或数据契约。

#### Scenario: Business modules remain same per page / 每页业务模块集合保持不变

- **WHEN** 页面排版优化完成
- **THEN** 周看板、反思库、周复盘和系统页保留各自原有业务模块集合
- **AND** 不因排版优化新增、删除或复制业务模块

#### Scenario: Style toggle shares the same structure / 风格切换共享同一结构

- **WHEN** 用户在 classic、Claude、Supabase 和 Dossier 风格之间切换
- **THEN** 当前业务页面的 DOM 业务模块集合和顺序保持一致
- **AND** 风格切换只改变视觉表现

#### Scenario: Data and operations remain unchanged / 数据与操作保持不变

- **WHEN** 页面排版优化实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约和业务操作逻辑均不发生变化

### Requirement: Dashboard layout optimization preserves business behavior / 周看板排版优化保持业务行为

系统 MUST（必须）只通过模块重排、布局容器、网格、间距和视觉交互优化来改善桌面端体验，不得改变业务处理逻辑。

#### Scenario: Store and data contracts remain unchanged / 数据契约保持不变

- **WHEN** 桌面端周看板排版优化实现完成
- **THEN** store 结构、持久化格式、Electron IPC 合约和模块业务操作语义均不发生变化

#### Scenario: Style modes share the same dashboard structure / 风格模式共享同一周看板结构

- **WHEN** 用户在原风格、Claude 风格、Supabase 风格和 Dossier 风格之间切换
- **THEN** 所有风格使用同一套周看板基础排版
- **AND** 风格切换不得改变今日执行条、周看板和辅助沉淀区的模块集合或顺序

#### Scenario: Desktop layout remains readable without horizontal page overflow / 桌面端布局可读且页面不横向溢出

- **WHEN** 用户在电脑端常见宽度查看周看板页面
- **THEN** 今日执行条和辅助沉淀区使用适合桌面扫描的网格布局
- **AND** 页面主体不产生非预期的横向滚动
- **AND** 周看板自身可以保留内部横向滚动以承载任务列

## REMOVED Requirements
> 中文：移除需求

### Requirement: Orbit style provides visual and interaction treatment / Orbit 风格提供视觉与交互处理

**Reason**: Orbit 风格被 Claude 风格替换，不再作为独立可选风格保留。

**Migration**: 用户可见名称、正式内部值和 CSS class 迁移为 Claude；读取旧存储值 `orbit` 时映射为 `claude`。
