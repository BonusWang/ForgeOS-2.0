# Mobile Back And A11y Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Android/mobile hardening by making transient panels close before section navigation and by improving TalkBack-readable labels for key mobile controls.

**Architecture:** Add one local mobile hook for transient panel history. Keep panel state inside existing mobile components. Use native accessibility attributes and existing CSS only.

**Tech Stack:** React, TypeScript, browser history API, existing mobile CSS, `node:test`, OpenSpec CLI.

---

### Task 1: Failing Structure Test

**Files:**
- Create: `tests/mobileBackA11yStructure.test.ts`

- [ ] **Step 1: Write the failing test**

Assert that `useMobilePanelHistory` exists, mobile panels use it, bottom nav has explicit `aria-label`, system health is a status region, and inbox action buttons have descriptive labels.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mobileBackA11yStructure.test.ts`

Expected: FAIL because the hook and labels are missing.

### Task 2: Add Panel History Hook

**Files:**
- Create: `src/features/mobile/useMobilePanelHistory.ts`

- [ ] **Step 1: Implement the hook**

Use `useEffect` and `useRef` to push a temporary history state when `isOpen` changes to true. Add a `popstate` listener that calls the latest close callback.

### Task 3: Wire Mobile Panels

**Files:**
- Modify: `src/features/mobile/MobileTodayForge.tsx`
- Modify: `src/features/mobile/MobileWeekProgress.tsx`
- Modify: `src/features/mobile/MobileCaptureHub.tsx`
- Modify: `src/features/mobile/MobileAppShell.tsx`

- [ ] **Step 1: Import and use the hook**

Connect today task sheet, weekly review panel, backlog schedule sheet, capture composer, and system tools panel.

### Task 4: Improve Accessibility Labels

**Files:**
- Modify: `src/features/mobile/MobileAppShell.tsx`
- Modify: `src/features/mobile/MobileWeekProgress.tsx`

- [ ] **Step 1: Label bottom nav**

Add `aria-label={`切换到${item.label}模块`}` to the four mobile nav buttons.

- [ ] **Step 2: Label inbox actions**

Add descriptive labels such as `澄清为今日任务 ${item.content}` and `删除待澄清事项 ${item.content}`.

- [ ] **Step 3: Mark health as status**

Add `role="status"` and `aria-live="polite"` to mobile system health.

### Task 5: Verify

**Files:**
- Modify: `openspec/changes/req_移动端返回与无障碍收尾_20260607/tasks.md`

- [ ] **Step 1: Run focused and full verification**

Run `node --test tests/mobileBackA11yStructure.test.ts`, `openspec validate --all --strict --no-interactive`, `node --test tests/*.test.ts`, `npm run lint`, `npm run build`, and `npm run android:build`.

- [ ] **Step 2: Check Android smoke availability**

Run `adb devices`; if no devices are attached, record the downgrade in `tasks.md`.

- [ ] **Step 3: Clean generated artifacts**

Remove regenerated `dist`, `android/build`, `android/app/build`, and `android/.gradle`.

## Self-Review

- Spec coverage: covers back priority, TalkBack labels, and mobile keyboard panel controls.
- Placeholder scan: no placeholders remain.
- Type consistency: uses existing React state and browser history only; no store or data-contract changes.
