# System Trust Rituals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a readonly system health summary and usage ritual guide from `docs/product/forge-os-expert-agent-review.md` first-stage recommendations.

**Architecture:** Add two focused system-page panels under `src/features/system`: `DataHealthPanel` derives readonly health state from the existing Zustand store and platform storage URL, while `UsageRitualPanel` renders collapsible workflow guidance from `systemCopy`. Keep storage, V3 sync, Electron IPC, Android storage, and persisted contracts unchanged.

**Tech Stack:** React 19, TypeScript, Zustand, Vite, Node `node:test`, OpenSpec.

---

## File Structure

- Create `tests/systemTrustStructure.test.ts`: structural tests for health summary, ritual guide, README copy, and readonly boundaries.
- Modify `src/copy/system-copy.ts`: add `health` and `ritual` copy groups.
- Create `src/features/system/DataHealthPanel.tsx`: readonly derived health panel.
- Create `src/features/system/UsageRitualPanel.tsx`: collapsible ritual panel.
- Modify `src/pages/System.tsx`: render the two new panels without removing existing panels.
- Modify `README.md`: add Forge-OS usage rhythm.
- Modify `openspec/changes/req_系统信任与使用节奏_20260607/tasks.md`: check off completed tasks as implementation progresses.

### Task 1: Red Test For System Trust

**Files:**
- Create: `tests/systemTrustStructure.test.ts`

- [ ] **Step 1: Write the failing structure test**

Create `tests/systemTrustStructure.test.ts` with assertions that require `DataHealthPanel`, `UsageRitualPanel`, health/ritual copy, README rhythm, and no forbidden mutating sync calls in the health panel.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/systemTrustStructure.test.ts`

Expected: FAIL because `src/features/system/DataHealthPanel.tsx` and `src/features/system/UsageRitualPanel.tsx` do not exist yet.

### Task 2: Add System Copy And Panels

**Files:**
- Modify: `src/copy/system-copy.ts`
- Create: `src/features/system/DataHealthPanel.tsx`
- Create: `src/features/system/UsageRitualPanel.tsx`

- [ ] **Step 1: Add copy groups**

Add `systemCopy.health` with title, summary labels, and status labels. Add `systemCopy.ritual` with title, collapsed summary, and five steps: morning, daytime, evening, weekend, monthEnd.

- [ ] **Step 2: Implement readonly health panel**

Create `DataHealthPanel.tsx`. It must call `useAppStore` to read existing collections, `syncConfig`, and `syncStatus`; call `getPlatformStorageDisplayUrl()` once through state initialization; derive counts and labels; render an `AsciiBox` with no action buttons and no calls to `setSyncStatus`, `updateSyncConfig`, `runV3Sync`, or `useAppStore.setState`.

- [ ] **Step 3: Implement collapsible ritual panel**

Create `UsageRitualPanel.tsx`. It must use local `useState` only for open/closed UI, render an `AsciiBox`, a toggle button, and the five ritual entries from `systemCopy.ritual.steps`.

### Task 3: Wire System Page And README

**Files:**
- Modify: `src/pages/System.tsx`
- Modify: `README.md`

- [ ] **Step 1: Render panels**

Import `DataHealthPanel` and `UsageRitualPanel` in `System.tsx`. Render `DataHealthPanel` above `DataBackupPanel` in the identity column and `UsageRitualPanel` above `SyncPanel` in the operations column.

- [ ] **Step 2: Update README**

Replace the one-line README with a short Forge-OS description and a `## 使用节奏` section listing morning, daytime, evening, weekend, and month-end usage. Include a sentence that this rhythm does not add a separate data model.

### Task 4: Green Verification

**Files:**
- Modify: `openspec/changes/req_系统信任与使用节奏_20260607/tasks.md`

- [ ] **Step 1: Run focused structure test**

Run: `node --test tests/systemTrustStructure.test.ts`

Expected: PASS.

- [ ] **Step 2: Run OpenSpec validation**

Run: `openspec validate --all --strict --no-interactive`

Expected: PASS.

- [ ] **Step 3: Run full Node tests**

Run: `node --test tests/*.test.ts`

Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 5: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Mark OpenSpec tasks complete**

Update `openspec/changes/req_系统信任与使用节奏_20260607/tasks.md` from `- [ ]` to `- [x]` for completed tasks.
