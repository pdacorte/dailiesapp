# Task Completion Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make checking off a task feel native by updating only the affected task-completion UI instead of rebuilding dashboard sections.

**Architecture:** Replace the refresh-based `completeTask()` path with an optimistic completion pipeline. Completion reads task state, applies targeted DOM patches immediately, persists to IndexedDB, then finalizes generated IDs or rolls back on failure. Existing add, delete, time tracking, theme, export, import, and layout behavior stay unchanged.

**Tech Stack:** Plain HTML/CSS/JavaScript, IndexedDB, existing DOM helpers, existing Node unit test sandbox, Tailwind-generated CSS.

---

## File Structure

- Modify `app.js` to add completion state, render helpers, optimistic DOM patch helpers, IndexedDB completion persistence, and rollback handling.
- Modify `custom.css` only if completion transitions need a measured-height class that avoids layout snaps.
- Modify `tests/routines-unit.test.js` to cover completion-only behavior in the existing Node sandbox.

---

## Task 1: Test Completion Does Not Refresh Whole Lists

**Files:**
- Modify: `tests/routines-unit.test.js`

- [ ] **Step 1: Write a failing test**

Add a test that evaluates `app.js`, stubs a fake task database, calls `completeTask(10)`, and asserts `updateDisplayAfterTaskChange()`, `updateDisplay()`, and `updateOngoingTasks()` are not called for successful completion.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: failure because the current `completeTask()` calls `updateDisplayAfterTaskChange()` after the transaction.

---

## Task 2: Add Targeted Render Helpers

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Extract completed item rendering**

Add `createCompletedTaskElement(task, parentTask, index, animate)` and update `updateCompletedTasks()` to use it so a single new completed item can be prepended without rebuilding the list.

- [ ] **Step 2: Add task-card replacement helper**

Add `replaceOngoingTaskElement(task, allTasks, animate)` so a non-negotiable successor can replace only the completed card after IndexedDB assigns its ID.

- [ ] **Step 3: Run test**

Run: `npm test`

Expected: still failing until `completeTask()` uses the helpers.

---

## Task 3: Implement Optimistic Completion Pipeline

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add completion state and mutation builder**

Add an in-flight completion `Set`, `getTaskCompletionContext(taskId)`, and `buildTaskCompletionMutation(task, allTasks)`.

- [ ] **Step 2: Add optimistic UI patches**

Add `applyOptimisticTaskCompletion(mutation)` to disable the checked control, launch confetti, collapse/remove only the affected active row, prepend only one completed item, patch subtask parent progress, increment today count, update today's seven-day cell, and update the chart dataset in place.

- [ ] **Step 3: Add rollback patches**

Add `rollbackOptimisticTaskCompletion(mutation, patch)` that restores the removed row, removes the optimistic completed item, restores direct stats text, and re-enables controls if IndexedDB fails.

- [ ] **Step 4: Persist in one transaction**

Add `persistTaskCompletion(mutation)` that marks the original task complete, creates the next-day non-negotiable successor when needed, and returns the successor with its assigned ID.

- [ ] **Step 5: Replace `completeTask()`**

Make `completeTask(taskId)` orchestrate validation, optimistic patching, persistence, final non-negotiable replacement, and rollback. Do not call `updateDisplay()`, `updateDisplayAfterTaskChange()`, or `updateOngoingTasks()` on success.

- [ ] **Step 6: Run tests**

Run: `npm test`

Expected: pass.

---

## Task 4: Verify Browser-Safe Behavior

**Files:**
- Modify: `custom.css` if transition classes are needed

- [ ] **Step 1: Syntax check**

Run: `node -c app.js`

Expected: no syntax errors.

- [ ] **Step 2: Build CSS**

Run: `npm run build`

Expected: Tailwind build completes and writes `minified.css`.

- [ ] **Step 3: Manual browser check**

Open the app, complete a goal, subtask, and non-negotiable. Expected: no quote refresh, no full ongoing list rebuild, no completed list flash, and no chart teardown flicker.

---

## Self-Review

- Spec coverage: The plan covers task completion only, including goal, subtask, non-negotiable successor, stats, chart, error rollback, and no broad refresh calls.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: Helper names and task properties match existing `app.js` conventions (`task.id`, `parentId`, `status`, `endDate`, `completedAt`, `sortOrder`).
