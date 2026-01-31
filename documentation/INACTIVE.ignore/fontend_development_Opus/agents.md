# AGENTS.md — AI Agent Development Guide

> **Version:** 1.0.0 | **Last Updated:** 2026-01-24 | **Maintainer:** @paulo

---

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Language** | JavaScript (ES6+) |
| **Framework** | Vanilla JS + Tailwind CSS v4.0.0 |
| **Storage** | IndexedDB (client-side) |
| **Build Tool** | PostCSS + Tailwind CLI |
| **Dev Command** | `npm run dev` |
| **Build Command** | `npm run build` |
| **Test Command** | Manual testing (see [Testing](#testing)) |

---

## 1. Project Context

### 1.1 What This Project Does
DailiesApp is a productivity web application for task management and time tracking with:
- Task CRUD operations with auto-creation of recurring tasks
- Time tracking with task-specific logging
- Progress visualization via Chart.js
- Data portability: JSON export/import, Google Drive sync
- Theme support: Light/dark mode with persistence

### 1.2 Architecture Summary
```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   app.js    │  │ google-     │  │   Chart.js      │  │
│  │  (core)     │  │ drive.js    │  │   (CDN)         │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │          │
│         ▼                ▼                   ▼          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              IndexedDB Storage                  │    │
│  │   stores: [tasks, timeTracking]                 │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Critical Rules

> ⚠️ **MUST follow these rules. Violations break the application.**

### 2.1 Code Style — Non-Negotiable

```javascript
// ✅ CORRECT
const taskName = "Daily standup";
const handleClick = (event) => { /* ... */ };
const GOOGLE_DRIVE_CONFIG = { /* ... */ };

// ❌ WRONG
var task_name = "Daily standup";
function handleClick(event) { /* ... */ }  // Use arrow functions for callbacks
const googleDriveConfig = { /* ... */ };   // Constants must be UPPER_SNAKE_CASE
```

| Element | Convention | Example |
|---------|------------|---------|
| Variables | `camelCase` | `taskList`, `currentUser` |
| Functions | `camelCase` | `updateDisplay()`, `exportDatabase()` |
| Constants | `UPPER_SNAKE_CASE` | `DB_NAME`, `API_ENDPOINT` |
| Classes | `PascalCase` | `TaskManager`, `TimeTracker` |

### 2.2 File Modification Rules

1. **Never edit `output.css` or `minified.css`** — these are generated files
2. **Always run `npm run build`** after CSS changes before committing
3. **Destroy Chart.js instances** before creating new ones
4. **Use IndexedDB transactions** — never raw localStorage for app data

### 2.3 Error Handling Pattern

```javascript
// ✅ REQUIRED PATTERN for all async operations
async function performOperation() {
  try {
    const result = await riskyOperation();
    showNotification("Success message", "success");
    return result;
  } catch (error) {
    console.error("performOperation failed:", error);
    showNotification("User-friendly error message", "error");
    throw error; // Re-throw if caller needs to handle
  }
}
```

---

## 3. File Structure

```
dailiesapp/
├── index.html              # Entry point — DO NOT split into components
├── app.js                  # Core application logic (single file)
├── google-drive.js         # Google Drive API integration
├── styles.css              # Source CSS — EDIT THIS
├── output.css              # Generated (dev) — DO NOT EDIT
├── minified.css            # Generated (prod) — DO NOT EDIT
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Dependencies and scripts
├── icons/                  # SVG assets
├── tests/                  # Test utilities (HTML-based)
└── documentation/          # Reference docs
```

### 3.1 Key File Purposes

| File | Purpose | When to Modify |
|------|---------|----------------|
| `app.js` | All core functionality | Adding/changing features |
| `google-drive.js` | OAuth + Drive API | Cloud sync changes only |
| `styles.css` | Custom CSS beyond Tailwind | Complex styling needs |
| `index.html` | UI structure | Adding new UI sections |

---

## 4. Development Workflow

### 4.1 Before Making Changes

```bash
# 1. Start the dev server
npm run dev

# 2. Verify current state works
# Open index.html in browser, test affected features
```

### 4.2 Making Changes

```bash
# For JavaScript changes:
# Edit app.js or google-drive.js directly
# Refresh browser to test

# For CSS/Tailwind changes:
# 1. Edit styles.css or add Tailwind classes in index.html
# 2. npm run dev watches and recompiles automatically

# For HTML changes:
# Edit index.html, refresh browser
```

### 4.3 Before Committing

```bash
# 1. Build production CSS
npm run build

# 2. Verify no syntax errors
node -c app.js
node -c google-drive.js

# 3. Manual testing checklist (see Section 5)
```

---

## 5. Testing

> **No automated test framework.** Follow this manual checklist.

### 5.1 Quick Smoke Test

- [ ] Page loads without console errors
- [ ] Tasks can be added
- [ ] Tasks can be completed/deleted
- [ ] Timer starts/stops correctly
- [ ] Theme toggle works

### 5.2 Full Feature Test

| Feature | Test Steps | Expected Result |
|---------|------------|-----------------|
| Add Task | Enter name → Select type → Submit | Task appears in list |
| Complete Task | Click checkbox | Task marked complete, moved |
| Time Tracking | Click start → wait → stop | Time logged, chart updates |
| Export | Click export | JSON file downloads |
| Import | Select valid JSON | Data restored, UI updates |
| Dark Mode | Toggle theme | All elements adapt |

### 5.3 Test Files

- `tests/test-export.html` — Export/import validation
- `tests/test-google-drive.html` — OAuth flow testing

---

## 6. Common Tasks

### 6.1 Adding a New Feature

```
1. Identify affected files (usually just app.js + index.html)
2. Add HTML structure with Tailwind classes
3. Add JavaScript logic following existing patterns
4. Add event listener in setupEventListeners()
5. Test manually
6. Run npm run build
```

### 6.2 Fixing a Bug

```
1. Reproduce the bug
2. Check browser console for errors
3. Locate relevant function in app.js
4. Apply fix following error handling pattern
5. Test the fix + regression test related features
```

### 6.3 Modifying IndexedDB Schema

```javascript
// In app.js, find initDatabase()
// 1. Increment dbVersion
const dbVersion = 2; // was 1

// 2. Add upgrade logic in onupgradeneeded
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // Create new store or modify existing
  if (!db.objectStoreNames.contains('newStore')) {
    db.createObjectStore('newStore', { keyPath: 'id', autoIncrement: true });
  }
};
```

---

## 7. Data Structures

### 7.1 Task Object

```javascript
{
  id: Number,           // Auto-generated
  title: String,        // Required, non-empty
  type: "Goal" | "Non-Negotiable",
  status: Boolean,      // true = completed
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD" | null
}
```

### 7.2 Time Tracking Entry

```javascript
{
  id: Number,           // Auto-generated
  taskName: String,     // Required
  seconds: Number,      // Duration in seconds
  timestamp: String     // ISO 8601 format
}
```

### 7.3 Export/Import Schema

```javascript
{
  version: "1.0",
  exportDate: "ISO date string",
  appVersion: "1.0",
  tasks: Task[],
  timeTracking: TimeTrackingEntry[]
}
```

---

## 8. API Reference

### 8.1 Core Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `initDatabase()` | Initialize IndexedDB | `Promise<IDBDatabase>` |
| `addTask(title, type)` | Create new task | `Promise<void>` |
| `completeTask(id)` | Mark task complete | `Promise<void>` |
| `deleteTask(id)` | Remove task | `Promise<void>` |
| `startTimer(taskName)` | Begin time tracking | `void` |
| `stopTimer()` | End time tracking | `Promise<void>` |
| `exportDatabase()` | Download JSON backup | `Promise<void>` |
| `importDatabase()` | Restore from JSON | `Promise<void>` |
| `showNotification(msg, type)` | Display toast | `void` |

### 8.2 Google Drive Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `authenticateWithGoogleDrive()` | OAuth flow | `Promise<void>` |
| `uploadBackupToGoogleDrive()` | Save to Drive | `Promise<void>` |
| `listBackupsFromGoogleDrive()` | Get backup list | `Promise<Array>` |
| `downloadBackupFromGoogleDrive(id)` | Restore backup | `Promise<void>` |

---

## 9. Troubleshooting

### 9.1 Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| CSS not updating | Build not run | `npm run build` |
| Chart not rendering | Old instance exists | Call `chart.destroy()` first |
| Data not persisting | Transaction error | Check IndexedDB in DevTools |
| Import fails | Invalid JSON structure | Validate against schema |
| Google Drive 403 | Incorrect OAuth setup | See `GOOGLE_DRIVE_TROUBLESHOOTING.md` |

### 9.2 Debug Commands

```javascript
// In browser console:

// Check database connection
console.log(db);

// List all tasks
db.transaction('tasks').objectStore('tasks').getAll().onsuccess = e => console.log(e.target.result);

// Check timer state
console.log({ isTimerRunning, currentTaskName, elapsedSeconds });

// Force UI refresh
updateDisplay();
updateCharts();
```

---

## 10. Security & Performance

### 10.1 Security Checklist

- [ ] Sanitize all user inputs before DOM insertion
- [ ] Never store sensitive data in localStorage (tokens have expiry)
- [ ] Validate JSON structure before import
- [ ] Use HTTPS for all API calls

### 10.2 Performance Guidelines

| Concern | Solution |
|---------|----------|
| DOM manipulation | Batch updates, use `DocumentFragment` |
| IndexedDB | Use transactions, batch operations |
| Charts | Destroy before recreate, debounce updates |
| Large imports | Process in chunks of 100 |

---

## 11. Commit Standards

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: tasks, timer, export, drive, ui, db
```

**Examples:**
```
feat(tasks): add recurring task support
fix(timer): prevent negative elapsed time
docs(readme): update installation steps
refactor(db): optimize batch insert performance
```

---

## 12. Agent-Specific Instructions

### 12.1 When Adding Code

1. **Match existing patterns** — search for similar functionality first
2. **Single responsibility** — one function, one purpose
3. **Update both ends** — if adding backend logic, add UI too
4. **Include error handling** — always use try/catch pattern

### 12.2 When Debugging

1. **Read error messages** — they usually point to the exact issue
2. **Check browser console** — most errors surface there
3. **Verify data flow** — input → processing → output
4. **Test in isolation** — use browser console to test functions

### 12.3 When Refactoring

1. **Don't change behavior** — same inputs, same outputs
2. **Test before and after** — verify nothing broke
3. **Small commits** — one logical change per commit
4. **Update docs** — if API changes, update this file

### 12.4 Decision Tree

```
Need to modify UI?
├─ Yes → Edit index.html + add Tailwind classes
│        └─ Need custom CSS? → Edit styles.css
└─ No → Edit app.js

Need to add feature?
├─ Related to Google Drive? → Edit google-drive.js
└─ Everything else → Edit app.js

Need to store data?
├─ App data (tasks, time) → IndexedDB
├─ Preferences (theme) → localStorage
└─ Temporary state → JavaScript variables
```

---

## Appendix A: Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.0.0 | Utility CSS framework |
| postcss | latest | CSS processing |
| autoprefixer | latest | Browser compatibility |
| Chart.js | 4.x (CDN) | Data visualization |
| Google APIs | (external) | Drive integration |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| Non-Negotiable | Task that auto-recreates for next day if incomplete |
| Goal | One-time task without recurrence |
| Streak | Consecutive days of completing all tasks |
| Time Entry | Single recorded work session |

---

*This document is the source of truth for AI agents working on this project. Keep it updated.*
