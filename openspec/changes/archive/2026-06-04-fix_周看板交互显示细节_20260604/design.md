# Dashboard Interaction Detail Fix Design / 周看板交互显示细节修复设计

## Context / 背景

`MiniCalendar` 的日期弹出框使用 `position: fixed`，但定位时额外叠加 `window.scrollY` 和 `window.scrollX`，导致页面滚动后弹出框被推离日期格。`AsciiProgress` 使用 `█` 和 `░` 字符拼接进度条，在非等宽字体或浅色风格下容易出现空段视觉异常，且固定 `20ch` 宽度在今日进度卡片中显得过短。

## Goals / Non-Goals / 目标与非目标

目标：

- 日期弹出框始终贴近被点击的日期格，并保持在视口内。
- 今日进度条使用真实 CSS 填充层表达比例，避免字体字符宽度影响。
- 今日进度条在卡片内横向占比更接近 80%，减少无意义空白。
- 不改变现有数据和业务操作语义。

非目标：

- 不新增日历弹层交互功能。
- 不重构 `MiniCalendar` 的数据读取和新增事项逻辑。
- 不改变能力面板等其它场景的进度条默认紧凑宽度。

## Decisions / 设计决策

1. fixed 弹出框直接使用 `getBoundingClientRect()` 的视口坐标，不叠加页面滚动偏移。
2. 当弹出框向上展示后仍可能越过视口顶部时，将顶部夹到安全间距。
3. `AsciiProgress` 渲染为 bracket + track + fill + label，填充比例使用百分比宽度。
4. 通用进度条通过 `--ascii-progress-width` 保留默认宽度；今日进度条通过 `today-progress-bar` 覆盖为 80% 横向占比。

## Risks / Trade-offs / 风险与取舍

- CSS 进度条不再逐字呈现 ASCII 空段，但保留括号和百分比，视觉更稳定。
- 今日进度条变长后更适合卡片扫描；其它小型能力进度条保持原默认宽度。
