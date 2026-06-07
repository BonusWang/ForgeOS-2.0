# Forge-OS Design Audit Checklist

This checklist adapts Taste Skill as a Forge-OS review standard. Forge-OS is a dense personal operations workspace, so use these rules as layout and usability gates, not as landing-page styling defaults.

## Design Read

- Page kind: personal productivity workspace and desktop-first product UI.
- Audience: one focused user repeatedly scanning, planning, reviewing, and maintaining personal systems.
- Visual language: monastic terminal, restrained, tactile, information-dense.
- Dials: `DESIGN_VARIANCE 3-4`, `MOTION_INTENSITY 1-2`, `VISUAL_DENSITY 7-8`.

## Review Gates

1. Preserve business structure.
   - Style changes must not add, remove, reorder, or duplicate business modules unless a requirement says so.
   - Classic and orbit styles must share the same page module collection and page shape.
   - Store shape, persistence, Electron IPC, and operation semantics must remain unchanged.

2. Use workspace density intentionally.
   - Large desktop blank space must either support scanning or be removed.
   - Cards should not stretch to wide empty rectangles when their content is short.
   - Empty states should be visually quieter than active work.

3. Keep the weekly board primary.
   - The dashboard first screen should make today's status scannable, then put the weekly board in a clear primary position.
   - Empty day columns should be visually quieter than columns with tasks.
   - The board may scroll horizontally inside itself, but the page must not create accidental horizontal overflow.

4. Make review pages feel like tools.
   - Weekly review needs a compact toolbar, an obvious writing area, and a supporting evidence area.
   - Reflection library needs the reflection list to feel intentional even when there are few cards.
   - System page should feel like a settings console, not four cards floating at the top.

5. Maintain consistent rhythm.
   - Main pages should share page padding, max-width logic, module gap, title treatment, and interaction feedback.
   - Use CSS Grid for page layout; avoid layout math that depends on magic flex widths.
   - Navigation active/hover/focus states must be stable and not cause width jumps.
   - Primary navigation order should follow the operating loop: weekly board, weekly review, reflection library, system.
   - Do not duplicate the same primary navigation action inside a page toolbar unless it is needed for the active workflow.

6. Keep visual style restrained.
   - One accent color per style.
   - No decorative gradient/orb treatment.
   - Motion is limited to hover, active, focus, and drag feedback.
   - Text must fit containers and not overlap at desktop or mobile widths.

7. Make settings panels scannable.
   - Module management should show module state, target area, and enabled count without requiring the user to decode symbols.
   - Enabled state should be recognizable but not dominate every row when most modules are active.
   - Cards or rows should be fully clickable and keyboard-focusable, with no nested button confusion.

## Pre-Ship Checks

- `npm run build` passes.
- `npm run lint` passes.
- Desktop screenshots for dashboard, reflection, weekly review, and system show no accidental horizontal page overflow.
- Classic/orbit style toggle preserves page module collection and basic page shape.
- Module picker opens within the viewport, has no accidental horizontal overflow, and preserves module toggle behavior.
