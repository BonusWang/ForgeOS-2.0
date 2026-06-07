# Mobile Light Loop Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the mobile Forge-OS experience with rhythm guidance, inbox clarification, weekly evidence, and readonly system health without adding a fifth mobile section or new persisted models.

**Architecture:** Reuse the existing mobile shell and store slices. `MobileTodayForge` gets display-only rhythm guidance; `MobileWeekProgress` reuses `inboxItems`, tasks, inspirations, and reflections; `MobileAppShell` derives readonly health from existing sync and data state.

**Tech Stack:** React, TypeScript, Zustand store selectors, existing CSS, `node:test` structure tests, OpenSpec CLI.

---

### Task 1: Failing Structure Test

**Files:**
- Create: `tests/mobileLightLoopStructure.test.ts`

- [ ] **Step 1: Write the failing test**

Assert that mobile today contains rhythm labels, progress contains inbox clarification actions and weekly evidence, system contains readonly health selectors, and shell still has exactly four nav items.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mobileLightLoopStructure.test.ts`

Expected: FAIL because the new mobile symbols and text are not present.

### Task 2: Add Mobile Today Rhythm

**Files:**
- Modify: `src/features/mobile/MobileTodayForge.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add a local rhythm array**

Use local display data for `早上`, `白天`, and `晚上`; do not add store fields.

- [ ] **Step 2: Render the rhythm under the top focus card**

Use compact rows so the commitment panel remains visible.

### Task 3: Add Mobile Inbox Clarification

**Files:**
- Modify: `src/features/mobile/MobileWeekProgress.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Read inbox and actions**

Add selectors for `inboxItems`, `removeFromInbox`, and `addInspiration`.

- [ ] **Step 2: Add clarify handlers**

Use `addTask(item.content, today)`, `addTask(item.content, 'BACKLOG')`, `addInspiration(...)`, and `removeFromInbox(item.id)`.

- [ ] **Step 3: Render the queue before the backlog**

Use labels `待澄清`, `今日任务`, `收纳任务`, `灵感`, and `删除`.

### Task 4: Add Mobile Weekly Evidence

**Files:**
- Modify: `src/features/mobile/MobileWeekProgress.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Derive evidence**

Calculate `abilityPoints` from completed week tasks and `relatedReflections` from daily reflections in the selected week.

- [ ] **Step 2: Render evidence metrics**

Show completed, unfinished, ability points, and reflection count in the week console.

### Task 5: Add Mobile System Health

**Files:**
- Modify: `src/features/mobile/MobileAppShell.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Read existing state**

Read tasks, inboxItems, reflections, inspirations, syncConfig, syncStatus, and v3SyncConflicts through `useAppStore`.

- [ ] **Step 2: Render readonly summary**

Show local record count, pending clarification count, sync status, conflict count, and dirty/local pending state before system rows.

### Task 6: Verify

**Files:**
- Modify: `openspec/changes/req_移动端轻闭环升级_20260607/tasks.md`

- [ ] **Step 1: Run focused and full checks**

Run `node --test tests/mobileLightLoopStructure.test.ts`, `openspec validate --all --strict --no-interactive`, `node --test tests/*.test.ts`, `npm run lint`, `npm run build`, and `npm run android:build`.

- [ ] **Step 2: Check Android smoke availability**

Run `adb devices`; if no devices are attached, record the downgrade in `tasks.md`.

- [ ] **Step 3: Clean generated artifacts**

Remove regenerated `dist`, `android/build`, `android/app/build`, and `android/.gradle` after verification.

## Self-Review

- Spec coverage: covers mobile rhythm, clarification, evidence, system health, and four-section boundary.
- Placeholder scan: no placeholders remain.
- Type consistency: uses existing `InboxItem`, `Task`, `Reflection`, `addTask`, `addInspiration`, `removeFromInbox`, `syncConfig`, `syncStatus`, and `v3SyncConflicts`.
