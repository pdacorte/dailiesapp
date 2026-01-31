# Front-End Development Skill (Opus)

```yaml
name: Frontend Development - Opus
scope: front-end design, layout, styling, client-side interactivity
stack:
  - Tailwind CSS v4.0
  - Vanilla CSS (Flexbox, Grid)
  - Vanilla JavaScript (ES6+)
  - HTML5 Semantic Elements
level: intermediate
last_updated: 2026-01-23
```

---

## Table of Contents

1. [Overview](#overview)
2. [What "Good" Looks Like](#what-good-looks-like)
3. [Technology Stack](#technology-stack)
4. [File Touchpoints](#file-touchpoints)
5. [Development Workflow](#development-workflow)
6. [HTML Conventions](#html-conventions)
7. [CSS Conventions](#css-conventions)
8. [JavaScript Conventions](#javascript-conventions)
9. [Layout Patterns](#layout-patterns)
10. [Accessibility Baseline](#accessibility-baseline)
11. [Review Checklist](#review-checklist)
12. [Starter Templates](#starter-templates)
13. [Common Pitfalls](#common-pitfalls)

---

## Overview

This skill defines the front-end development approach for DailiesApp, emphasizing a **hybrid styling strategy** that combines the utility-first speed of Tailwind CSS with the precision and maintainability of vanilla CSS for complex layouts and theming.

### Core Philosophy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     HYBRID STYLING APPROACH                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   TAILWIND CSS              VANILLA CSS              VANILLA JS    │
│   ─────────────             ──────────────           ──────────    │
│   • Rapid prototyping       • Complex layouts        • DOM control │
│   • Utility classes         • CSS custom props       • Event mgmt  │
│   • Responsive helpers      • Animations/keyframes   • State mgmt  │
│   • Dark mode prefix        • Component shells       • IndexedDB   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Guiding Principles

1. **Clarity over cleverness** — Code should be readable at first glance
2. **Segmentation** — Separate concerns: structure (HTML), presentation (CSS), behavior (JS)
3. **Comment with intent** — Explain the "why", not the "what"
4. **Consistent patterns** — Reuse established layout and component patterns

---

## What "Good" Looks Like

### ✅ Quality Criteria

| Aspect | Expectation |
|--------|-------------|
| **Structure** | HTML is semantic, CSS is organized by layer, JS is modular |
| **Comments** | Section headers, decision explanations, complex logic annotated |
| **Segmentation** | Clear visual separation between layout, components, utilities |
| **Responsiveness** | Mobile-first approach, tested at all breakpoints |
| **Accessibility** | Keyboard navigable, proper ARIA, focus management |
| **Performance** | Minimal DOM manipulation, cached selectors, no memory leaks |

### ❌ Non-Goals

- Over-engineering simple layouts with complex grid systems
- Inline styles except for truly dynamic values
- jQuery or other DOM libraries (vanilla JS only)
- CSS-in-JS solutions

---

## Technology Stack

| Technology | Version | Purpose | Source |
|------------|---------|---------|--------|
| **Tailwind CSS** | 4.0.0 | Utility-first styling | npm / PostCSS |
| **Vanilla CSS** | CSS3 | Custom properties, Grid, Flexbox | `styles.css`, `custom.css` |
| **Vanilla JS** | ES6+ | DOM manipulation, state, IndexedDB | `app.js` |
| **Chart.js** | 4.x | Data visualization | CDN |
| **Material Symbols** | Outlined | Iconography | Google Fonts CDN |

### CDN Resources

```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Material Symbols -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

<!-- Google Fonts (Inter) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## File Touchpoints

```
dailiesapp/
├── index.html           # Main HTML structure (semantic, data-* attrs)
├── app.js               # Core JavaScript (state, events, IndexedDB)
├── styles.css           # Primary CSS (tokens, layout, components)
├── custom.css           # Additional component styles (overrides)
├── output.css           # Generated Tailwind (dev)
├── minified.css         # Generated Tailwind (prod)
├── tailwind.config.js   # Tailwind configuration (theme, fonts)
└── postcss.config.js    # PostCSS plugins
```

### File Responsibilities

| File | Layer | Contains |
|------|-------|----------|
| `styles.css` | Foundation | CSS tokens, layout primitives, component shells, keyframes |
| `custom.css` | Enhancement | Component overrides, interaction states, drag-drop styles |
| `app.js` | Behavior | Initialization, event handling, state management, CRUD ops |
| `index.html` | Structure | Semantic markup, data attributes, modal templates |

---

## Development Workflow

### Build Commands

```bash
# ─────────────────────────────────────────────────────────────
# DEVELOPMENT
# ─────────────────────────────────────────────────────────────

# Watch mode: auto-compile Tailwind on file changes
npm run dev

# ─────────────────────────────────────────────────────────────
# PRODUCTION
# ─────────────────────────────────────────────────────────────

# Minify CSS for deployment
npm run build

# ─────────────────────────────────────────────────────────────
# VALIDATION
# ─────────────────────────────────────────────────────────────

# Check JavaScript syntax
node -c app.js
```

### Testing Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    MANUAL TESTING MATRIX                     │
├──────────────────────────────────────────────────────────────┤
│  Browser Compat    │  Chrome, Firefox, Safari, Edge         │
│  Responsiveness    │  Mobile (375px), Tablet, Desktop       │
│  Dark Mode         │  Toggle theme, verify all components   │
│  Keyboard Nav      │  Tab order, focus visibility, Escape   │
│  Data Persistence  │  IndexedDB CRUD, export/import         │
└──────────────────────────────────────────────────────────────┘
```

---

## HTML Conventions

### Semantic Structure

```html
<!-- ═══════════════════════════════════════════════════════════
     PAGE STRUCTURE: Use semantic elements for document outline
     ═══════════════════════════════════════════════════════════ -->

<body>
  <aside>          <!-- Sidebar navigation -->
  <main>           <!-- Primary content area -->
    <section>      <!-- Distinct content sections -->
    <article>      <!-- Self-contained content -->
  </main>
  <footer>         <!-- Footer content -->
</body>
```

### Data Attributes for JavaScript Hooks

```html
<!-- ─────────────────────────────────────────────────────────────
     DATA ATTRIBUTES: Use data-* for JS interaction targets
     Prefer data-* over IDs for JS hooks (IDs for landmarks only)
     ───────────────────────────────────────────────────────────── -->

<!-- Action triggers -->
<button data-action="add-task">Add Task</button>
<button data-action="toggle-theme">Toggle Theme</button>

<!-- State containers -->
<div data-state="loading">...</div>
<div data-state="empty">No tasks found</div>

<!-- Component identification -->
<div data-component="task-list">...</div>
<div data-component="time-tracker">...</div>
```

### Modal Pattern

```html
<!-- ═══════════════════════════════════════════════════════════
     MODAL STRUCTURE: Consistent pattern for all dialogs
     ═══════════════════════════════════════════════════════════ -->

<div id="modal-export" 
     class="modal-overlay hidden"
     role="dialog" 
     aria-modal="true"
     aria-labelledby="modal-export-title">
  
  <!-- Backdrop (click to close) -->
  <div class="modal-backdrop" data-action="close-modal"></div>
  
  <!-- Modal content -->
  <div class="modal-content">
    <header class="modal-header">
      <h2 id="modal-export-title">Export Data</h2>
      <button data-action="close-modal" aria-label="Close modal">
        <span class="material-symbols-outlined">close</span>
      </button>
    </header>
    
    <div class="modal-body">
      <!-- Modal content here -->
    </div>
    
    <footer class="modal-actions">
      <button data-action="cancel" class="btn-secondary">Cancel</button>
      <button data-action="confirm" class="btn-primary">Export</button>
    </footer>
  </div>
</div>
```

### Icon Usage

```html
<!-- ─────────────────────────────────────────────────────────────
     ICONS: Material Symbols Outlined with consistent sizing
     ───────────────────────────────────────────────────────────── -->

<!-- Standard icon -->
<span class="material-symbols-outlined">check_circle</span>

<!-- Icon with text (inline) -->
<button>
  <span class="material-symbols-outlined" aria-hidden="true">add</span>
  <span>Add Task</span>
</button>

<!-- Icon-only button (requires aria-label) -->
<button aria-label="Delete task">
  <span class="material-symbols-outlined" aria-hidden="true">delete</span>
</button>
```

---

## CSS Conventions

### Tailwind vs Vanilla CSS Decision Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│                    WHEN TO USE WHAT                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  USE TAILWIND FOR:                 USE VANILLA CSS FOR:           │
│  ─────────────────                 ────────────────────           │
│  ✓ Spacing (p-4, m-2, gap-3)       ✓ CSS custom properties        │
│  ✓ Typography (text-lg, font-bold) ✓ Complex Grid layouts         │
│  ✓ Colors (bg-blue-500, text-white)✓ Keyframe animations          │
│  ✓ Flexbox basics (flex, items-*)  ✓ Component "shells"           │
│  ✓ Responsive (md:, lg: prefixes)  ✓ Pseudo-element styling       │
│  ✓ Dark mode (dark: prefix)        ✓ Multi-property transitions   │
│  ✓ Quick prototyping               ✓ Reusable layout patterns     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### CSS File Organization

```css
/* ═══════════════════════════════════════════════════════════════════
   styles.css — PRIMARY STYLESHEET
   
   ORGANIZATION:
   1. Tailwind Directives
   2. CSS Custom Properties (Tokens)
   3. Base/Reset Styles
   4. Layout Primitives
   5. Component Shells
   6. Utility Classes
   7. Animations/Keyframes
   ═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────
   1. TAILWIND DIRECTIVES
   ───────────────────────────────────────────────────────────────────── */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─────────────────────────────────────────────────────────────────────
   2. CSS CUSTOM PROPERTIES — Design Tokens
   ───────────────────────────────────────────────────────────────────── */
:root {
  /* Colors — Light Mode */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-accent: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* Spacing Scale */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  
  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Borders & Shadows */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}

/* ─────────────────────────────────────────────────────────────────────
   Dark Mode Tokens
   ───────────────────────────────────────────────────────────────────── */
[data-theme="dark"],
.dark {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
}

/* ─────────────────────────────────────────────────────────────────────
   3. BASE STYLES
   ───────────────────────────────────────────────────────────────────── */
body {
  font-family: var(--font-family);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.6;
}

/* ─────────────────────────────────────────────────────────────────────
   4. LAYOUT PRIMITIVES — Reusable Flex/Grid patterns
   ───────────────────────────────────────────────────────────────────── */
/* See Layout Patterns section for detailed examples */

/* ─────────────────────────────────────────────────────────────────────
   5. COMPONENT SHELLS — Structural styling for components
   ───────────────────────────────────────────────────────────────────── */
/* See Starter Templates section for component patterns */

/* ─────────────────────────────────────────────────────────────────────
   6. UTILITY CLASSES — Project-specific utilities
   ───────────────────────────────────────────────────────────────────── */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* ─────────────────────────────────────────────────────────────────────
   7. ANIMATIONS
   ───────────────────────────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn var(--transition-normal) ease-out;
}
```

### Responsive Design

```css
/* ─────────────────────────────────────────────────────────────────────
   RESPONSIVE BREAKPOINTS — Mobile-First Approach
   
   Tailwind defaults:
   sm: 640px   — Small tablets
   md: 768px   — Tablets
   lg: 1024px  — Laptops
   xl: 1280px  — Desktops
   2xl: 1536px — Large screens
   ───────────────────────────────────────────────────────────────────── */

/* Vanilla CSS media queries (when Tailwind isn't sufficient) */
@media (min-width: 768px) {
  .sidebar {
    width: 280px;
    transform: translateX(0);
  }
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 280px 1fr 320px;
  }
}
```

---

## JavaScript Conventions

### File Organization

```javascript
/* ═══════════════════════════════════════════════════════════════════════
   app.js — MAIN APPLICATION SCRIPT
   
   ORGANIZATION:
   1. Constants & Configuration
   2. State Variables
   3. DOM Element Cache
   4. Initialization
   5. Event Listeners Setup
   6. Core Functions (CRUD)
   7. UI Update Functions
   8. Utility Functions
   9. Export/Import Functions
   ═══════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────
const DB_NAME = 'dailiesapp';
const DB_VERSION = 1;
const STORES = {
  TASKS: 'tasks',
  TIME_TRACKING: 'timeTracking'
};

// ─────────────────────────────────────────────────────────────────────────
// 2. STATE VARIABLES
// ─────────────────────────────────────────────────────────────────────────
let db = null;                    // IndexedDB connection
let timerInterval = null;         // Timer interval reference
let currentSeconds = 0;           // Current timer value
let chartInstance = null;         // Chart.js instance (for cleanup)

// ─────────────────────────────────────────────────────────────────────────
// 3. DOM ELEMENT CACHE — Cache frequently accessed elements
// ─────────────────────────────────────────────────────────────────────────
const DOM = {
  taskList: null,
  timerDisplay: null,
  sidebar: null,
  // Populated in init()
};

// ─────────────────────────────────────────────────────────────────────────
// 4. INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Cache DOM elements
  DOM.taskList = document.querySelector('[data-component="task-list"]');
  DOM.timerDisplay = document.getElementById('timer-display');
  DOM.sidebar = document.querySelector('aside');
  
  // Initialize database
  await initDatabase();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial UI render
  await updateDisplay();
}
```

### Event Delegation Pattern

```javascript
// ─────────────────────────────────────────────────────────────────────────
// EVENT DELEGATION — Handle events at container level
// 
// Benefits:
// - Single listener instead of many
// - Automatically handles dynamically added elements
// - Easier to maintain and debug
// ─────────────────────────────────────────────────────────────────────────

function setupEventListeners() {
  // ───────────────────────────────────────────────────────────────────────
  // Task List Actions — Single listener for all task interactions
  // ───────────────────────────────────────────────────────────────────────
  DOM.taskList?.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    
    const action = button.dataset.action;
    const taskId = button.closest('[data-task-id]')?.dataset.taskId;
    
    switch (action) {
      case 'complete-task':
        handleCompleteTask(taskId);
        break;
      case 'delete-task':
        handleDeleteTask(taskId);
        break;
      case 'edit-task':
        handleEditTask(taskId);
        break;
    }
  });
  
  // ───────────────────────────────────────────────────────────────────────
  // Global Actions — Theme toggle, sidebar, etc.
  // ───────────────────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    
    switch (button.dataset.action) {
      case 'toggle-theme':
        toggleTheme();
        break;
      case 'toggle-sidebar':
        toggleSidebar();
        break;
      case 'close-modal':
        closeActiveModal();
        break;
    }
  });
  
  // ───────────────────────────────────────────────────────────────────────
  // Keyboard Shortcuts
  // ───────────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
      closeActiveModal();
    }
    
    // Ctrl/Cmd + S saves (prevent default, trigger save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentWork();
    }
  });
}
```

### Function Naming & Documentation

```javascript
// ─────────────────────────────────────────────────────────────────────────
// FUNCTION DOCUMENTATION PATTERN
// 
// Use JSDoc for complex functions, inline comments for simple ones
// ─────────────────────────────────────────────────────────────────────────

/**
 * Adds a new task to the database and updates the UI
 * 
 * @param {string} title - The task title
 * @param {string} type - Task type: 'Goal' or 'Non-Negotiable'
 * @returns {Promise<number>} The ID of the created task
 * @throws {Error} If database transaction fails
 * 
 * @example
 * const taskId = await addTask('Complete project', 'Goal');
 */
async function addTask(title, type) {
  // Validate input before processing
  if (!title?.trim()) {
    throw new Error('Task title is required');
  }
  
  const task = {
    title: title.trim(),
    type: type || 'Goal',
    status: false,
    startDate: getTodayDate(),
    endDate: null
  };
  
  // Persist to database
  const id = await saveToDatabase(STORES.TASKS, task);
  
  // Update UI to reflect new task
  await updateTaskList();
  
  return id;
}

// Simple utility — inline comment is sufficient
function getTodayDate() {
  // Returns YYYY-MM-DD in local timezone
  return new Date().toLocaleDateString('en-CA');
}
```

### Async/Await Pattern

```javascript
// ─────────────────────────────────────────────────────────────────────────
// ASYNC OPERATIONS — Consistent error handling pattern
// ─────────────────────────────────────────────────────────────────────────

/**
 * Wrapper for async operations with consistent error handling
 */
async function withErrorHandling(operation, errorMessage) {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// Usage example
async function loadTasks() {
  return withErrorHandling(
    () => getAllFromDatabase(STORES.TASKS),
    'Failed to load tasks'
  );
}
```

---

## Layout Patterns

### Flexbox — Sidebar + Main Content

```css
/* ═══════════════════════════════════════════════════════════════════════
   FLEXBOX LAYOUT: Sidebar + Main Content
   
   Use when: Fixed sidebar width, fluid main content
   ═══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────
   VANILLA CSS APPROACH
   ───────────────────────────────────────────────────────────────────────── */
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  /* Fixed width, doesn't shrink */
  flex: 0 0 280px;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  
  /* Scrollable if content overflows */
  overflow-y: auto;
}

.main-content {
  /* Takes remaining space */
  flex: 1 1 auto;
  padding: var(--space-lg);
  
  /* Prevent content from overflowing */
  min-width: 0;
}

/* ─────────────────────────────────────────────────────────────────────────
   TAILWIND EQUIVALENT
   ───────────────────────────────────────────────────────────────────────── */
```

```html
<div class="flex min-h-screen">
  <aside class="flex-none w-70 p-4 bg-slate-100 dark:bg-slate-800 overflow-y-auto">
    <!-- Sidebar -->
  </aside>
  <main class="flex-1 p-6 min-w-0">
    <!-- Main content -->
  </main>
</div>
```

### CSS Grid — Dashboard Layout

```css
/* ═══════════════════════════════════════════════════════════════════════
   CSS GRID LAYOUT: Dashboard with Multiple Regions
   
   Use when: Complex multi-region layouts with precise placement
   ═══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────
   VANILLA CSS APPROACH
   ───────────────────────────────────────────────────────────────────────── */
.dashboard {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-lg);
  
  /* Mobile: single column */
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "stats"
    "chart"
    "tasks";
}

@media (min-width: 768px) {
  .dashboard {
    /* Tablet: two columns */
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "header header"
      "stats  stats"
      "chart  tasks";
  }
}

@media (min-width: 1024px) {
  .dashboard {
    /* Desktop: three columns with sidebar */
    grid-template-columns: 280px 1fr 320px;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "sidebar header  header"
      "sidebar chart   tasks";
  }
}

/* Named grid area assignments */
.dashboard-header { grid-area: header; }
.dashboard-stats { grid-area: stats; }
.dashboard-chart { grid-area: chart; }
.dashboard-tasks { grid-area: tasks; }
.dashboard-sidebar { grid-area: sidebar; }

/* ─────────────────────────────────────────────────────────────────────────
   TAILWIND EQUIVALENT (using arbitrary values for grid-template-areas)
   ───────────────────────────────────────────────────────────────────────── */
```

```html
<div class="grid gap-4 p-6 
            grid-cols-1 
            md:grid-cols-2 
            lg:grid-cols-[280px_1fr_320px]">
  <!-- Use individual placement classes -->
  <header class="md:col-span-2 lg:col-span-2">Header</header>
  <aside class="hidden lg:block lg:row-span-2">Sidebar</aside>
  <section class="min-h-80">Chart</section>
  <section class="min-h-80">Tasks</section>
</div>
```

### Card Grid — Auto-Fill Responsive

```css
/* ═══════════════════════════════════════════════════════════════════════
   AUTO-FILL CARD GRID
   
   Use when: Unknown number of items, responsive without breakpoints
   ═══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────
   VANILLA CSS APPROACH
   ───────────────────────────────────────────────────────────────────────── */
.card-grid {
  display: grid;
  gap: var(--space-md);
  
  /* Auto-fill columns: min 280px, max 1fr */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}

/* ─────────────────────────────────────────────────────────────────────────
   TAILWIND EQUIVALENT
   ───────────────────────────────────────────────────────────────────────── */
```

```html
<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
  <div class="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 shadow-sm">
    Card 1
  </div>
  <div class="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 shadow-sm">
    Card 2
  </div>
  <!-- More cards... -->
</div>
```

### Flexbox — Centered Content

```css
/* ═══════════════════════════════════════════════════════════════════════
   CENTERED CONTENT PATTERNS
   ═══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────
   VANILLA CSS — Perfect centering (horizontal + vertical)
   ───────────────────────────────────────────────────────────────────────── */
.centered-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* ─────────────────────────────────────────────────────────────────────────
   TAILWIND EQUIVALENT
   ───────────────────────────────────────────────────────────────────────── */
```

```html
<div class="flex items-center justify-center min-h-screen">
  <div class="max-w-md w-full p-6">
    Centered content
  </div>
</div>
```

---

## Accessibility Baseline

### Keyboard Navigation

```javascript
// ─────────────────────────────────────────────────────────────────────────
// FOCUS MANAGEMENT — Ensure keyboard users can navigate
// ─────────────────────────────────────────────────────────────────────────

/**
 * Opens a modal and traps focus within it
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Store the element that triggered the modal
  modal.dataset.returnFocus = document.activeElement?.id;
  
  // Show modal
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  
  // Focus first focusable element
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  focusable[0]?.focus();
  
  // Trap focus within modal
  modal.addEventListener('keydown', trapFocus);
}

/**
 * Closes modal and returns focus to trigger element
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Hide modal
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  
  // Return focus to trigger element
  const returnId = modal.dataset.returnFocus;
  if (returnId) {
    document.getElementById(returnId)?.focus();
  }
  
  // Remove focus trap
  modal.removeEventListener('keydown', trapFocus);
}

/**
 * Traps focus within an element (for modals)
 */
function trapFocus(e) {
  if (e.key !== 'Tab') return;
  
  const modal = e.currentTarget;
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
```

### Focus Styles

```css
/* ─────────────────────────────────────────────────────────────────────────
   FOCUS STYLES — Visible focus indicators for keyboard users
   ───────────────────────────────────────────────────────────────────────── */

/* Remove default outline, add custom focus ring */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  z-index: 9999;
}

.skip-link:focus {
  top: var(--space-sm);
}
```

### ARIA Essentials

```html
<!-- ─────────────────────────────────────────────────────────────────────
     ARIA PATTERNS — Common accessible patterns
     ───────────────────────────────────────────────────────────────────── -->

<!-- Live region for dynamic updates -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  <!-- Announce changes to screen readers -->
</div>

<!-- Loading state -->
<button aria-busy="true" aria-describedby="loading-msg">
  <span id="loading-msg" class="visually-hidden">Loading, please wait</span>
  <span class="spinner" aria-hidden="true"></span>
</button>

<!-- Expandable section -->
<button aria-expanded="false" aria-controls="section-1">
  Toggle Section
</button>
<div id="section-1" hidden>
  Collapsible content
</div>

<!-- Tab panel -->
<div role="tablist" aria-label="Task Categories">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Active</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Completed</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Active tasks...
</div>
```

---

## Review Checklist

### Pre-Commit Checklist

```markdown
## Layout & Styling
- [ ] Responsive at all breakpoints (375px, 768px, 1024px, 1280px)
- [ ] Dark mode styling complete and tested
- [ ] No horizontal scroll on any viewport
- [ ] Consistent spacing using design tokens
- [ ] Tailwind vs vanilla CSS choice follows decision matrix

## JavaScript
- [ ] Event listeners use delegation where appropriate
- [ ] DOM elements are cached (not queried repeatedly)
- [ ] Async operations have error handling
- [ ] Chart.js instances destroyed before recreation
- [ ] No console.log statements (except intentional debugging)

## Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] ARIA attributes used correctly
- [ ] Modals trap focus and return focus on close

## Performance
- [ ] No layout thrashing (batch DOM reads/writes)
- [ ] Images optimized and lazy-loaded where appropriate
- [ ] CSS animations use transform/opacity (GPU accelerated)
- [ ] No memory leaks (event listeners cleaned up)

## Code Quality
- [ ] Code is clearly segmented with section headers
- [ ] Complex logic has explanatory comments
- [ ] Function/variable names are descriptive
- [ ] No duplicate code (DRY principle)
```

---

## Starter Templates

### Task Card Component

```html
<!-- ═══════════════════════════════════════════════════════════════════════
     COMPONENT: Task Card
     
     Structure: Header, body, actions footer
     Variants: Active, completed, overdue
     ═══════════════════════════════════════════════════════════════════════ -->

<article 
  class="task-card"
  data-task-id="123"
  data-status="active"
>
  <header class="task-card__header">
    <span class="task-card__type">Goal</span>
    <time class="task-card__date" datetime="2026-01-23">Jan 23</time>
  </header>
  
  <div class="task-card__body">
    <h3 class="task-card__title">Complete project documentation</h3>
  </div>
  
  <footer class="task-card__actions">
    <button data-action="complete-task" aria-label="Mark as complete">
      <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
    </button>
    <button data-action="edit-task" aria-label="Edit task">
      <span class="material-symbols-outlined" aria-hidden="true">edit</span>
    </button>
    <button data-action="delete-task" aria-label="Delete task">
      <span class="material-symbols-outlined" aria-hidden="true">delete</span>
    </button>
  </footer>
</article>
```

```css
/* ─────────────────────────────────────────────────────────────────────────
   Task Card Styles
   ───────────────────────────────────────────────────────────────────────── */

.task-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-accent);
  
  transition: box-shadow var(--transition-fast);
}

.task-card:hover {
  box-shadow: var(--shadow-md);
}

/* Status variants */
.task-card[data-status="completed"] {
  opacity: 0.7;
  border-left-color: var(--color-success);
}

.task-card[data-status="overdue"] {
  border-left-color: var(--color-danger);
}

.task-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.task-card__title {
  font-size: var(--font-size-base);
  font-weight: 500;
  margin: 0;
}

.task-card__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
}

.task-card__actions button {
  padding: var(--space-xs);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.task-card__actions button:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
}
```

### Notification Toast

```html
<!-- ═══════════════════════════════════════════════════════════════════════
     COMPONENT: Notification Toast
     
     Variants: success, error, warning, info
     Auto-dismiss after timeout
     ═══════════════════════════════════════════════════════════════════════ -->

<div 
  class="toast toast--success"
  role="alert"
  aria-live="polite"
>
  <span class="material-symbols-outlined toast__icon" aria-hidden="true">
    check_circle
  </span>
  <p class="toast__message">Task added successfully!</p>
  <button class="toast__close" aria-label="Dismiss notification">
    <span class="material-symbols-outlined" aria-hidden="true">close</span>
  </button>
</div>
```

```css
/* ─────────────────────────────────────────────────────────────────────────
   Toast Notification Styles
   ───────────────────────────────────────────────────────────────────────── */

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  
  animation: slideIn var(--transition-normal) ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Variants */
.toast--success { border-left: 4px solid var(--color-success); }
.toast--error { border-left: 4px solid var(--color-danger); }
.toast--warning { border-left: 4px solid var(--color-warning); }
.toast--info { border-left: 4px solid var(--color-accent); }

.toast__icon {
  font-size: 1.25rem;
}

.toast--success .toast__icon { color: var(--color-success); }
.toast--error .toast__icon { color: var(--color-danger); }

.toast__message {
  margin: 0;
  font-size: var(--font-size-sm);
}

.toast__close {
  margin-left: auto;
  padding: var(--space-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.5;
}

.toast__close:hover {
  opacity: 1;
}
```

```javascript
// ─────────────────────────────────────────────────────────────────────────
// Toast Notification JavaScript
// ─────────────────────────────────────────────────────────────────────────

/**
 * Shows a toast notification
 * 
 * @param {string} message - The notification message
 * @param {'success'|'error'|'warning'|'info'} type - Notification type
 * @param {number} duration - Auto-dismiss duration in ms (default: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  // Icon mapping
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
  
  toast.innerHTML = `
    <span class="material-symbols-outlined toast__icon" aria-hidden="true">
      ${icons[type]}
    </span>
    <p class="toast__message">${message}</p>
    <button class="toast__close" aria-label="Dismiss notification">
      <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
  `;
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Close button handler
  toast.querySelector('.toast__close').addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto-dismiss
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.style.animation = 'slideOut 0.2s ease-in forwards';
  setTimeout(() => toast.remove(), 200);
}
```

---

## Common Pitfalls

### ❌ Pitfall: Chart.js Memory Leaks

```javascript
// ─────────────────────────────────────────────────────────────────────────
// PROBLEM: Creating new chart without destroying old one
// ─────────────────────────────────────────────────────────────────────────

// ❌ BAD — Memory leak, old chart still exists
function updateChart(data) {
  new Chart(ctx, config);  // Creates new chart every time!
}

// ✅ GOOD — Destroy before recreating
let chartInstance = null;

function updateChart(data) {
  // Destroy existing chart if present
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(ctx, config);
}
```

### ❌ Pitfall: DOM Thrashing

```javascript
// ─────────────────────────────────────────────────────────────────────────
// PROBLEM: Alternating reads and writes causes layout recalculation
// ─────────────────────────────────────────────────────────────────────────

// ❌ BAD — Forces layout recalc on each iteration
items.forEach(item => {
  const height = element.offsetHeight;  // READ
  item.style.height = height + 'px';     // WRITE
});

// ✅ GOOD — Batch reads, then batch writes
const heights = items.map(item => element.offsetHeight);  // All READS
items.forEach((item, i) => {
  item.style.height = heights[i] + 'px';                   // All WRITES
});
```

### ❌ Pitfall: Uncached DOM Queries

```javascript
// ─────────────────────────────────────────────────────────────────────────
// PROBLEM: Querying DOM repeatedly in loops or frequent functions
// ─────────────────────────────────────────────────────────────────────────

// ❌ BAD — Queries DOM every time
function updateTimer() {
  document.getElementById('timer').textContent = formatTime(seconds);  // Query every second!
}

// ✅ GOOD — Cache reference once
const timerElement = document.getElementById('timer');

function updateTimer() {
  timerElement.textContent = formatTime(seconds);  // Uses cached reference
}
```

### ❌ Pitfall: Z-Index Wars

```css
/* ─────────────────────────────────────────────────────────────────────────
   PROBLEM: Arbitrary z-index values lead to conflicts
   ───────────────────────────────────────────────────────────────────────── */

/* ❌ BAD — Random values, hard to manage */
.modal { z-index: 9999; }
.dropdown { z-index: 10000; }
.tooltip { z-index: 999999; }

/* ✅ GOOD — Defined scale with custom properties */
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-tooltip: 500;
  --z-notification: 600;
}

.modal-backdrop { z-index: var(--z-modal-backdrop); }
.modal { z-index: var(--z-modal); }
.tooltip { z-index: var(--z-tooltip); }
```

### ❌ Pitfall: Missing Dark Mode Styles

```css
/* ─────────────────────────────────────────────────────────────────────────
   PROBLEM: Hardcoded colors don't adapt to theme
   ───────────────────────────────────────────────────────────────────────── */

/* ❌ BAD — Hardcoded colors */
.card {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

/* ✅ GOOD — Use CSS custom properties */
.card {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* OR with Tailwind */
```

```html
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  Theme-aware card
</div>
```

---

## Quick Reference

### Tailwind Spacing Scale

| Class | Value | Pixels |
|-------|-------|--------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-3` | 0.75rem | 12px |
| `p-4` | 1rem | 16px |
| `p-5` | 1.25rem | 20px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |

### Common Tailwind Patterns

```html
<!-- Flex row with gap -->
<div class="flex items-center gap-4">

<!-- Flex column -->
<div class="flex flex-col gap-2">

<!-- Grid 3 columns -->
<div class="grid grid-cols-3 gap-4">

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">

<!-- Card with shadow -->
<div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">

<!-- Button -->
<button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
```

---

*Last updated: January 23, 2026*
