# Orbit Empty State Image Adjustment Design / Orbit 空状态图片调整设计

## Context / 背景

当前多个空状态组件复用 `resources.emptyState`，图片是旧像素风。orbit 风格已隐藏导航 logo，但内容区空状态图仍显示，导致视觉语言不统一。

## Goals / Non-Goals / 目标与非目标

目标：

- orbit 风格下不再显示不匹配的旧空状态图。
- 原风格保持现状。
- 改动集中，便于未来替换为新的 orbit 空状态图。

非目标：

- 不替换业务逻辑。
- 不重新设计所有空状态布局。

## Decisions / 设计决策

1. 给所有 `resources.emptyState` 图片增加 `alo-empty-state-image` class。
2. 在 orbit 样式外壳中通过 CSS 隐藏 `.alo-empty-state-image`。
3. 保留空状态文案和留白，避免页面突然变得拥挤。

## Risks / Trade-offs / 风险与取舍

- 直接隐藏图片会减少一点视觉提示，但比保留不匹配插图更符合 orbit 风格。
- 未来如果要换成新的图片，只需改 class 对应样式或资源。
