# Growth Loop Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining Forge expert-review stages by adding a lightweight desktop capture inbox, phase-grouped module management, and derived growth evidence views.

**Architecture:** Reuse the existing `inboxItems`, tasks, inspirations, reflections, objectives, abilities, and weekly reviews. Add display components and one lightweight inbox action only; do not add new persisted entities or modify sync contracts.

**Tech Stack:** React, TypeScript, Zustand store slices, existing structure tests with `node:test`, OpenSpec CLI.

---

### Task 1: Lock Scope With Failing Structure Test

**Files:**
- Create: `tests/growthLoopStructure.test.ts`

- [ ] **Step 1: Write the failing test**

Create a structure test that asserts Dashboard renders `DesktopCaptureInbox`, capture uses existing actions, module picker has phase groups, evidence views are derived, and no `EvidenceRecord` model exists.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/growthLoopStructure.test.ts`

Expected: FAIL because the new components and symbols do not exist yet.

### Task 2: Add Lightweight Desktop Capture

**Files:**
- Modify: `src/store/slices/okrSlice.ts`
- Create: `src/features/capture/DesktopCaptureInbox.tsx`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/features/okr/OKRInboxColumn.tsx`

- [ ] **Step 1: Add `addInboxItem(content: string): string` to the OKR slice**

Use the existing `InboxItem` shape and `generateId()` helper. Store ordinary captures in `inboxItems` without objective metadata.

- [ ] **Step 2: Create `DesktopCaptureInbox`**

Use local component state for the draft and expanded list. On submit call `addInboxItem`; on clarify call `addTask`, `addInspiration`, and `removeFromInbox` as appropriate.

- [ ] **Step 3: Render it above `TaskBoard` in `Dashboard`**

Keep the TaskBoard drag-and-drop boundary unchanged.

- [ ] **Step 4: Change OKR inbox copy to “待澄清”**

Keep drag behavior unchanged, only make the copy general enough for ordinary ideas.

### Task 3: Group Modules by Forge Phase

**Files:**
- Modify: `src/features/modules/ModulePicker.tsx`

- [ ] **Step 1: Add a local phase configuration**

Map existing module IDs into display-only phase groups.

- [ ] **Step 2: Render grouped sections**

Keep toggles bound to existing `enabledModules`; do not add core pages to persistence.

### Task 4: Add Derived Growth Evidence

**Files:**
- Modify: `src/pages/WeeklyReview.tsx`
- Create: `src/features/evidence/GrowthEvidenceArchive.tsx`
- Create: `src/features/evidence/MonthlyEvidencePreview.tsx`
- Modify: `src/pages/Reflection.tsx`
- Modify: `src/pages/MonthlyOKR.tsx`

- [ ] **Step 1: Enhance weekly evidence**

Derive ability points and related reflection counts from existing task/reflection state.

- [ ] **Step 2: Create `GrowthEvidenceArchive`**

Read existing tasks, weekly reviews, reflections, objectives, and abilities from store; render a compact derived archive.

- [ ] **Step 3: Create `MonthlyEvidencePreview`**

Read current-month tasks, weekly reviews, and objective progress from store; render the monthly evidence entry.

- [ ] **Step 4: Wire evidence components into Reflection and MonthlyOKR pages**

Do not modify data contracts or store structure.

### Task 5: Verify and Clean Generated Artifacts

**Files:**
- Modify: `openspec/changes/req_增长闭环补全_20260607/tasks.md`

- [ ] **Step 1: Run focused test**

Run: `node --test tests/growthLoopStructure.test.ts`

Expected: PASS.

- [ ] **Step 2: Run OpenSpec validation**

Run: `openspec validate --all --strict --no-interactive`

Expected: all changes/specs pass.

- [ ] **Step 3: Run project tests and builds**

Run: `node --test tests/*.test.ts`, `npm run lint`, `npm run build`, and `npm run android:build`.

- [ ] **Step 4: Check Android smoke availability**

Run: `adb devices`. If no device is attached, record that `android:smoke` is downgraded because no ADB device is available.

- [ ] **Step 5: Clean generated build artifacts**

Remove regenerated `dist`, `android/build`, `android/app/build`, and `android/.gradle` after verification to preserve the lightweight project base.

## Self-Review

- Spec coverage: covers desktop capture, module phase grouping, weekly/reflection/monthly evidence, and non-goal boundaries.
- Placeholder scan: no TBD or deferred implementation details remain.
- Type consistency: uses existing `InboxItem`, `addTask`, `addInspiration`, `weeklyReviews`, `objectives`, `abilities`, and `enabledModules`.
