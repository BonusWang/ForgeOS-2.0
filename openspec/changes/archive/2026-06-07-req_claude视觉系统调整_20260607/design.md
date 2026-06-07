## Context / 背景

Forge-OS 当前已有 `classic`、`orbit`、`supabase`、`dossier` 等视觉风格。用户已确认本次不是新增一个与 Orbit 并存的相似风格，而是将现有 Orbit 风格替换为 Claude 风格。上一次 demo 的主要问题是视觉 demo 改动了排版，因此本次实现必须把边界限制在视觉系统、命名和兼容迁移上。

Claude 风格需要严格参考 `docs/DESIGN/DESIGN-claude.md` 的视觉系统，但不能照抄 Claude/Anthropic 的品牌内容、Logo、产品文案或产品叙事。Forge-OS 继续使用自身品牌、导航、页面模块和业务工作流。

## Goals / Non-Goals / 目标与非目标

**Goals / 目标:**

- 用 Claude 风格替换现有 Orbit 风格，不保留 Orbit 和 Claude 两套相似风格。
- 用户可见风格名称从 `Orbit` 改为 `Claude`。
- 新写入的内部风格值、CSS class 和测试描述使用 `claude`。
- 兼容旧移动端本机风格偏好中的 `orbit` 值，读取时自动映射为 `claude`。
- 使用暖奶油画布、珊瑚主色、轻边框、浅色卡片、深色产品表面、8/12/16 圆角和开源/系统字体替代实现 Claude 视觉气质。
- 保持桌面端和手机端既有排版、模块顺序、DOM 业务结构、数据源和操作语义不变。

**Non-Goals / 非目标:**

- 不新增业务页面、业务模块或新的页面状态。
- 不重排周看板、周复盘、反思库、月度 OKR、系统页或手机端底部导航。
- 不修改 store 结构、持久化业务数据、Electron IPC、COS 同步、任务逻辑或反思逻辑。
- 不引入商业字体文件，不复制 Claude/Anthropic 的 Logo、品牌文案或产品内容。
- 不把 demo 中的结构性排版带入产品实现。

## Decisions / 设计决策

### 1. 用 `claude` 取代 `orbit`，而不是新增第五种相似风格

实现上将 `VisualStyle` 的正式值从 `orbit` 改为 `claude`，风格循环变为 `classic -> claude -> supabase -> dossier -> classic`。用户界面展示 `Claude`，按钮提示和测试描述也使用 Claude。

备选方案是保留 `orbit` 并新增 `claude`。这会制造两套暖色参考风格，增加维护成本，也违背“不保留两个类似风格”的要求，因此不采用。

### 2. 旧 `orbit` 只作为兼容输入，不作为新写入值

移动端本机风格偏好已经可能存有 `orbit`。读取本地存储时将 `orbit` 映射为 `claude`，后续写回使用 `claude`。这样用户已有偏好不会失效，同时新数据不继续传播旧名称。

桌面端当前风格未持久化，因此不需要业务数据迁移；只需保证类型判断、CSS class、body data attribute 和 mobile local preference 的写入值统一为 `claude`。

### 3. Claude 视觉只替换 token 和外观层

Claude 风格通过 token 和 CSS class 实现：暖奶油背景、浅卡片表面、珊瑚强调色、深色产品表面、轻边框、较克制阴影和开源/系统字体 fallback。实现不得改变 JSX 的业务模块集合和页面排序。

备选方案是按 Claude 官网重做页面 hero、卡片区或产品展示结构。该方案会改动 Forge-OS 已确认排版和业务工作台语义，明确不采用。

### 4. 字体使用开源或系统替代栈

标题字体使用 `Cormorant Garamond`、`EB Garamond`、Georgia fallback，正文使用 Inter 或系统 sans，代码继续使用 JetBrains Mono / 系统 monospace。实现只配置字体栈，不引入商业字体文件。

### 5. 测试以结构不变和命名替换为核心

测试需要覆盖：风格循环中出现 Claude 不出现 Orbit、旧 `orbit` 存储值会映射为 Claude、新 CSS class 为 `claude-style-shell`、移动端使用 Claude 风格时不改变导航结构和业务入口。测试不应要求新增布局结构。

## Risks / Trade-offs / 风险与取舍

- [Risk] 只改 token 可能无法完全复刻 Claude 官网视觉。  
  [Mitigation] 本次目标是借鉴视觉系统而不是复制官网页面，优先保持 Forge-OS 排版和业务稳定。

- [Risk] 旧 CSS class 或测试中仍残留 `orbit`，导致命名不一致。  
  [Mitigation] 使用结构测试扫描 `App.tsx`、移动端 shell 和 CSS，确保新正式命名为 `claude`，只在兼容读取逻辑中允许 legacy `orbit`。

- [Risk] 字体 fallback 在本机缺少开源字体时视觉差异较大。  
  [Mitigation] 使用 Georgia、系统 sans 和系统 monospace 作为最后 fallback，不引入商业字体文件。

- [Risk] 视觉调整误伤业务布局。  
  [Mitigation] 只改 style token、class 名称和 CSS 外观规则；保留现有组件树、导航顺序、页面状态和业务逻辑测试。
