# Forge-OS Command Center Layout

## Design Read

Forge-OS is a desktop-first personal operations workspace for one person planning, executing, reflecting, and reviewing work. The interface should feel like a calm command center, not a decorative parchment dashboard.

## Layout Direction

- Use a persistent left rail for product identity, primary pages, style switch, modules, and theme actions.
- Order primary pages by the user's operating loop: `01 周看板`, `02 周复盘`, `03 反思库`, `04 系统`.
- Make the weekly board the primary canvas on the dashboard.
- Move daily status modules into a right rail: progress, daily reflection, time block, and mood.
- Keep secondary modules below the board as a compact module dock, not a competing first-screen grid.
- Use the same page shell for reflection, weekly review, and system pages so navigation and page width feel consistent.
- Keep weekly review out of the dashboard toolbar; the stable entry belongs in the left rail.
- Treat module management as a settings panel: show module name, description, target area, enabled state, and enabled count.

## Visual Rules

- Reduce the visible ASCII border noise; use borders for grouping, not decoration.
- Keep a single accent color per style.
- Prefer modern workbench spacing: dense, aligned, and calm.
- Empty areas should collapse or become low-emphasis affordances.
- Style switching may change tokens and surface treatment, but not the business module collection or workflow shape.
- Module enablement UI may change presentation, but it must keep the existing module registry and toggle semantics.

## Style Modes

- Classic keeps the original retro parchment look as the default Forge-OS identity.
- Orbit keeps the warm editorial/workbench treatment introduced by the earlier reference pass.
- Supabase uses the local `Supabase-showcase` reference as a dark developer-product treatment: near-black surfaces, `#3ecf8e` accent, rounded cards, subtle borders, and system UI fonts.
- All style modes must render the same page components for the current business page. A style may change tokens, radius, typography, borders, hover/focus states, and empty-state treatment, but it must not add, remove, duplicate, or reorder business modules.

## Scope

- Allowed: shell layout, page containers, module placement, CSS presentation, interaction affordances.
- Not allowed: task storage, reflection persistence, mood save logic, weekly review data logic, module enablement logic.
