# Mobile Capture Stepper Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile record page use a real clickable Stepper for inspiration and reflection, and clarify capture/backlog wording without changing data contracts.

**Architecture:** Keep all data paths in the existing store. Refactor `MobileCaptureHub.tsx` locally so both inspiration and reflection use one clickable stepper renderer with variable step counts. Use copy-only changes for `inboxItems` versus `BACKLOG` tasks, keeping persistence and sync unchanged.

**Tech Stack:** React, TypeScript, CSS, `node:test`, OpenSpec CLI, Vite, Android Gradle build.

---

### Task 1: Failing Structure Test

**Files:**
- Create: `tests/mobileCaptureStepperBoundary.test.ts`

- [ ] **Step 1: Write the failing test**

Create a structure test that reads source files and asserts:
- `MobileCaptureHub.tsx` has a reusable clickable stepper (`mobile-capture-stepper`, `aria-current`, no disabled pending-only behavior).
- Inspiration has `content/source/tags/review` steps.
- Reflection step generation supports more than four steps and is not hard-coded to the old four-step union only.
- Outer `mobile-capture-rail` is removed.
- Recent history headings are `最近灵感` / `最近反思` without `最近保存`.
- Visible copy distinguishes `待澄清` from `待安排任务`.
- Store paths still use `inboxItems`, `BACKLOG`, `addInspiration`, and `saveReflection`.

Run:

```powershell
node --test tests/mobileCaptureStepperBoundary.test.ts
```

Expected: FAIL before implementation because the old record page still has `mobile-capture-rail`, disabled pending step buttons, repeated `最近保存`, and old `收纳箱` copy.

### Task 2: OpenSpec Gate

**Files:**
- Modify: `openspec/changes/req_移动端记录页Stepper与捕捉边界优化_20260607/tasks.md`

- [ ] **Step 1: Validate the new change**

Run:

```powershell
openspec validate --all --strict --no-interactive
```

Expected: PASS with the active change included.

### Task 3: Mobile Capture Stepper

**Files:**
- Modify: `src/features/mobile/MobileCaptureHub.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Replace decorative rail with a real stepper**

Remove the outer `mobile-capture-rail` markup from `MobileCaptureHub.tsx`. Rename the internal flow list to `mobile-capture-stepper` and render each step as a button with:
- `type="button"`
- `aria-current={isActive ? 'step' : undefined}`
- `aria-label={`切换到${step.label}步骤`}`
- no `disabled={isPending}` gating

- [ ] **Step 2: Make reflection steps variable length**

Replace the old fixed `ReflectionCaptureStep = 'obstacle' | 'solution' | 'effect' | 'review'` shape with step metadata derived from the active reflection template questions plus a final review step. Keep fallback labels from `reflectionQuestionFallbackLabels`.

- [ ] **Step 3: Render only the active step body**

Render inspiration body from the active inspiration step and reflection body from the active reflection step. The review step summarizes prior fields and preserves the current save behavior.

- [ ] **Step 4: Separate history from the stepper**

Render recent history after the workflow as a sibling section. In `renderRecentList`, remove the small label `最近保存`; use only the mode-specific title and count.

- [ ] **Step 5: Update mobile capture CSS**

Update `src/index.css`:
- Remove or neutralize `.mobile-capture-rail` and `.mobile-capture-rail::before`.
- Style `.mobile-capture-stepper` as the only vertical process chain.
- Keep stable spacing between workflow and history.
- Avoid nested card-heavy borders around the history area.

### Task 4: Capture Boundary Copy

**Files:**
- Modify: `src/features/capture/DesktopCaptureInbox.tsx`
- Modify: `src/features/tasks/TaskBoard.tsx`
- Modify: `src/features/mobile/MobileWeekProgress.tsx`
- Modify: `src/features/okr/OKRInboxColumn.tsx`
- Modify: `src/features/okr/OKRPanel.tsx`
- Modify: `src/features/abilities/AbilityTraining.tsx`
- Modify: `src/copy/forge-copy.ts`
- Modify: `src/copy/monkQuotes.ts`
- Modify: `src/features/weekly-review/weeklyReviewDraft.ts`

- [ ] **Step 1: Rename capture inbox copy**

Change desktop capture title to `捕捉箱 / 待澄清`; keep button copy `待澄清`.

- [ ] **Step 2: Rename backlog task copy**

Change visible task backlog title from `收纳箱` to `待安排任务`. Keep `date="BACKLOG"` and all task movement logic unchanged.

- [ ] **Step 3: Rename inbox action copy**

Change OKR and ability collect actions from `添加到收纳箱` / `已在收纳箱` to `加入待澄清` / `已在待澄清`.

- [ ] **Step 4: Rename clarification target copy**

Change `收纳任务` action labels to `转为待安排任务` or `待安排任务`. Keep implementation calling `addTask(..., 'BACKLOG', ...)`.

### Task 5: Verification

**Files:**
- Modify: `openspec/changes/req_移动端记录页Stepper与捕捉边界优化_20260607/tasks.md`

- [ ] **Step 1: Run focused tests**

Run:

```powershell
node --test tests/mobileCaptureStepperBoundary.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full verification**

Run:

```powershell
openspec validate --all --strict --no-interactive
node --test tests/*.test.ts
npm run lint
npm run build
npm run android:build
```

Expected: all commands exit 0. Vite chunk-size and Gradle deprecation warnings are acceptable if builds succeed.

- [ ] **Step 3: Browser check**

Open or reload `http://127.0.0.1:5173/` in the in-app Browser. Check the record page renders and has no console errors. Prefer a mobile viewport if the Browser session supports it; otherwise confirm page root renders and rely on structural tests for mobile-only code.

## Self-Review

- Spec coverage: covers clickable Stepper, variable reflection steps, history separation, and capture/backlog wording.
- Placeholder scan: no placeholders or unspecified implementation steps.
- Type consistency: stepper metadata and string ids are local to `MobileCaptureHub.tsx`; store paths remain unchanged.
