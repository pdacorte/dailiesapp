# Routines Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Routines tab where users set a simple weekday theme name, and show today's routine beside the existing date header.

**Architecture:** Store weekly routine names as a single object in the existing IndexedDB `settings` store under `weeklyRoutines`. Add one new view section controlled by the existing `setActiveView()` tab system. Keep the feature name-only for now and display a compact badge in the shared header when today has a routine.

**Tech Stack:** Plain HTML/CSS/JavaScript, IndexedDB, existing Tailwind utility classes, existing `custom.css` components.

---

## File Structure

- Modify `index.html` to add the Routines sidebar item and `#routines-section` editor.
- Modify `app.js` to add routines settings helpers, view routing, form behavior, header rendering, and backup compatibility.
- Modify `custom.css` to add the routine editor layout and header routine badge styles.
- Modify `google-drive.js` so Drive backups include the routines object.
- Create `tests/routines-unit.test.js` as a small Node-based behavior test for routines helper logic.

---

## Task 1: Test Routine Data Behavior

**Files:**
- Create: `tests/routines-unit.test.js`

- [x] **Step 1: Write a failing test**

Create a Node test that evaluates `app.js` in a minimal browser-like sandbox and asserts the routines helper API exists, returns blank defaults for all seven weekdays, merges saved values with defaults, and trims today's routine display value.

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/routines-unit.test.js`

Expected: failure because routines helpers do not exist yet.

---

## Task 2: Add Routine Data Helpers

**Files:**
- Modify: `app.js`

- [x] **Step 1: Add constants**

Add `WEEKLY_ROUTINES_SETTING_KEY` and `WEEKDAY_ROUTINES` near existing global constants.

- [x] **Step 2: Add helper functions**

Add `getDefaultWeeklyRoutines()`, `getWeeklyRoutines()`, `setWeeklyRoutines()`, and `getTodayRoutineName()` after `setSettingValue()`.

- [x] **Step 3: Run routine unit test**

Run: `node tests/routines-unit.test.js`

Expected: pass.

---

## Task 3: Add Routines UI and Routing

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [x] **Step 1: Add sidebar link**

Add a `Routines` link with `data-view="routines"` after the Calendar link.

- [x] **Step 2: Add routines section**

Add a hidden `#routines-section` after `#calendar-section` with seven inputs: `routine-monday`, `routine-tuesday`, `routine-wednesday`, `routine-thursday`, `routine-friday`, `routine-saturday`, and `routine-sunday`.

- [x] **Step 3: Wire the view**

Update `setActiveView()` to hide `#routines-section` by default and show it for the `routines` view.

- [x] **Step 4: Add form handlers**

Add `populateRoutinesUI()` and `saveRoutines(event)`, then register the form submit listener in `setupEventListeners()`.

---

## Task 4: Add Header Badge and Styles

**Files:**
- Modify: `app.js`
- Modify: `custom.css`

- [x] **Step 1: Render today's routine**

Make `updateTodayInfo()` async and add a `today-routine-badge` only when `getTodayRoutineName()` returns a non-empty string.

- [x] **Step 2: Add CSS**

Add `.today-routine-badge`, `.routines-form`, `.routines-weekday-list`, `.routine-day-row`, and `.routines-actions` styles with mobile wrapping.

---

## Task 5: Backup Compatibility

**Files:**
- Modify: `app.js`
- Modify: `google-drive.js`

- [x] **Step 1: Export routines**

Add `routines` to `exportDatabase()` and `saveToCloud()` export payloads.

- [x] **Step 2: Import routines safely**

Read `importData.routines` when present, merge it with defaults, and save it after existing task/time import flows. Older backups without `routines` import with empty routine defaults.

- [x] **Step 3: Add routines to Google Drive backups**

Update `getCurrentBackupData()` to include `routines` when `getWeeklyRoutines()` is available.

---

## Task 6: Verification

**Files:**
- Verify: `tests/routines-unit.test.js`
- Verify: `app.js`
- Verify: `google-drive.js`
- Verify: `minified.css`

- [x] **Step 1: Run automated checks**

Run: `node tests/routines-unit.test.js`, `node -c app.js`, `node -c google-drive.js`, and `npm run build`.

- [x] **Step 2: Browser verification**

Open the app, save a routine for today, verify the badge appears on all tabs, clear the routine, and verify the badge disappears.

- [x] **Step 3: Responsive verification**

Check desktop and mobile widths for header wrapping and routine editor layout.
