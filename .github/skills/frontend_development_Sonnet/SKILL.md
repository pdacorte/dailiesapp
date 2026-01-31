# Frontend Development Skill - DailiesApp

```yaml
name: "Frontend Development - Hybrid Approach"
scope: "HTML5, CSS (Flexbox/Grid + Tailwind), Vanilla JavaScript (ES6+)"
stack:
  - "HTML5 (Semantic markup)"
  - "CSS3 (Flexbox, Grid, Custom Properties)"
  - "Tailwind CSS v4.0.0"
  - "Vanilla JavaScript (ES6+)"
  - "IndexedDB (Client-side storage)"
  - "Chart.js (Data visualization)"
  - "Google Drive API (Cloud sync)"
level: "Intermediate to Advanced"
last_updated: "2026-01-23"
focus: "Clean structure, clear segmentation, comprehensive comments"
```

---

## Overview

This skill template defines the **frontend development approach** for DailiesApp, focusing on a **hybrid methodology** that combines:

- **Vanilla CSS** (Flexbox, Grid, Custom Properties) for complex layouts and custom components
- **Tailwind CSS v4.0.0** utilities for rapid styling and consistency
- **Vanilla JavaScript (ES6+)** for application logic, DOM manipulation, and IndexedDB operations

### What "Good" Looks Like

✅ **Code is clearly structured** with logical separation of concerns  
✅ **HTML uses semantic elements** (`<main>`, `<aside>`, `<section>`, `<header>`)  
✅ **CSS is organized** from tokens → layout → components → utilities  
✅ **JavaScript follows patterns** with helper functions, database operations, UI updates, and event handling clearly segmented  
✅ **Comments are comprehensive** explaining what, why, and how for complex logic  
✅ **Responsive design** works seamlessly across mobile, tablet, and desktop  
✅ **Accessibility** includes ARIA attributes, keyboard navigation, and focus management  
✅ **Performance** is optimized with DOM caching, batch operations, and proper cleanup  

### Key Files Reference

- **HTML Structure**: [index.html](../../../index.html)
- **Main JavaScript**: [app.js](../../../app.js)
- **Custom CSS Variables & Layout**: [styles.css](../../../styles.css)
- **Component-Specific CSS**: [custom.css](../../../custom.css)
- **Tailwind Config**: [tailwind.config.js](../../../tailwind.config.js)
- **Google Drive Integration**: [google-drive.js](../../../google-drive.js)

---

## Technology Stack & Tools

### Core Technologies

| Technology | Version | Purpose | Usage Pattern |
|------------|---------|---------|---------------|
| **HTML5** | Latest | Semantic structure | Semantic elements, data attributes, ARIA |
| **CSS3** | Latest | Layout & styling | Flexbox, Grid, Custom Properties, animations |
| **Tailwind CSS** | v4.0.0 | Utility classes | Spacing, colors, typography, responsive |
| **JavaScript** | ES6+ | Application logic | Modules, arrow functions, async/await, template literals |
| **IndexedDB** | Native | Client storage | Persistent data for tasks and time tracking |
| **Chart.js** | Latest (CDN) | Visualization | Line charts (30-day), pie charts (time distribution) |
| **Material Symbols** | Outlined | Icons | Icon font for UI elements |
| **Google Drive API** | v3 | Cloud sync | OAuth 2.0, file CRUD operations |

### Development Tools

```bash
# Install dependencies
npm install

# Development mode (watch Tailwind CSS for changes)
npm run dev

# Production build (minify CSS)
npm run build

# Syntax check JavaScript
node -c app.js
```

**Build Output:**
- `output.css` - Generated Tailwind CSS (development)
- `minified.css` - Minified Tailwind CSS (production)

---

## Development Workflow

### 1. Starting Development

```bash
# Clone repository and install dependencies
cd dailiesapp
npm install

# Start Tailwind CSS watcher
npm run dev

# Open index.html in browser (Live Server recommended)
```

### 2. Making Changes

**HTML Changes:**
1. Edit `index.html` with semantic markup
2. Use data attributes for JavaScript hooks (`data-task-id`, `data-date`)
3. Include ARIA attributes for accessibility
4. Refresh browser to see changes

**CSS Changes:**
1. **For Tailwind utilities**: Add classes directly in HTML, watcher rebuilds automatically
2. **For custom CSS**: Edit `styles.css` or `custom.css`, refresh browser
3. **For theme tokens**: Update CSS variables in `:root` and `.dark` selectors

**JavaScript Changes:**
1. Edit `app.js` with clear function separation
2. Add comprehensive comments for complex logic
3. Test in browser with DevTools console open
4. Verify IndexedDB operations in Application tab

### 3. Testing Strategy

**Manual Testing Checklist:**
- [ ] Test in Chrome, Firefox, Edge, Safari
- [ ] Test responsive layouts (mobile 375px, tablet 768px, desktop 1440px)
- [ ] Test dark mode toggle and theme persistence
- [ ] Test IndexedDB operations (add, update, delete, export, import)
- [ ] Test time tracking functionality
- [ ] Test chart rendering and updates
- [ ] Test Google Drive sync (if configured)
- [ ] Test keyboard navigation and accessibility
- [ ] Test empty states and error scenarios

### 4. Building for Production

```bash
# Build minified CSS
npm run build

# Verify minified.css is linked in index.html for production
# <link rel="stylesheet" href="minified.css">

# Test production build thoroughly
```

---

## Code Conventions

### HTML Structure Conventions

#### Semantic Elements Priority

**Use semantic HTML5 elements to provide meaning:**

```html
<!-- ✅ GOOD: Semantic structure -->
<main class="flex-1 p-6">
  <header class="mb-6">
    <h1 class="text-2xl font-bold">Daily Tasks</h1>
  </header>
  
  <section id="task-section">
    <h2 class="text-xl font-semibold mb-4">Ongoing Tasks</h2>
    <ul id="ongoing-tasks-list" class="space-y-2">
      <!-- Task items -->
    </ul>
  </section>
  
  <aside class="mt-8">
    <h3 class="text-lg font-medium">Statistics</h3>
    <!-- Stats content -->
  </aside>
</main>

<!-- ❌ BAD: Generic divs without semantic meaning -->
<div class="flex-1 p-6">
  <div class="mb-6">
    <div class="text-2xl font-bold">Daily Tasks</div>
  </div>
  <div id="task-section">
    <!-- ... -->
  </div>
</div>
```

#### Data Attributes for JavaScript Hooks

**Use data attributes to connect HTML to JavaScript:**

```html
<!-- Task item with data attributes -->
<li class="task-item" data-task-id="123" data-task-type="Goal">
  <span class="task-title">Complete project milestone</span>
  <button class="complete-btn" data-action="complete">
    <span class="material-symbols-outlined">check_circle</span>
  </button>
  <button class="delete-btn" data-action="delete">
    <span class="material-symbols-outlined">delete</span>
  </button>
</li>

<!-- Date picker with data attribute -->
<input type="date" id="date-picker" data-date="2026-01-23">

<!-- Timer control with data attributes -->
<div class="timer-display" data-timer-running="false" data-task-name="">
  <span id="timer-value">00:00:00</span>
</div>
```

**JavaScript access pattern:**

```javascript
// Get data from element
const taskId = taskElement.dataset.taskId;
const taskType = taskElement.dataset.taskType;
const isRunning = timerElement.dataset.timerRunning === 'true';

// Set data on element
element.dataset.date = getTodayDate();
element.dataset.timerRunning = 'true';
```

#### Modal Dialog Pattern

**Structure for accessible modal dialogs:**

```html
<!-- Modal container (hidden by default) -->
<div id="export-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
    <!-- Modal header -->
    <header class="flex justify-between items-center mb-4">
      <h2 id="modal-title" class="text-xl font-semibold">Export Data</h2>
      <button class="close-modal" aria-label="Close modal">
        <span class="material-symbols-outlined">close</span>
      </button>
    </header>
    
    <!-- Modal body -->
    <div class="modal-body">
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        Choose an export format for your data.
      </p>
      <!-- Modal content -->
    </div>
    
    <!-- Modal footer -->
    <footer class="flex justify-end gap-2 mt-6">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Export</button>
    </footer>
  </div>
</div>
```

#### Icon Usage Pattern

**Material Symbols Outlined font:**

```html
<!-- Include in <head> -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

<!-- Icon usage in HTML -->
<button class="icon-btn">
  <span class="material-symbols-outlined">add</span>
</button>

<span class="material-symbols-outlined text-green-500">check_circle</span>
<span class="material-symbols-outlined text-red-500">delete</span>
<span class="material-symbols-outlined">schedule</span>
```

---

### CSS Structure & Conventions

#### When to Use Tailwind vs. Vanilla CSS

**Decision Matrix:**

| Scenario | Use Tailwind | Use Vanilla CSS |
|----------|--------------|-----------------|
| Spacing (padding, margin) | ✅ `p-4`, `mt-6`, `gap-2` | ❌ |
| Colors | ✅ `bg-blue-500`, `text-gray-700` | ⚠️ Theme tokens in CSS vars |
| Typography | ✅ `text-xl`, `font-bold`, `leading-tight` | ❌ |
| Flexbox/Grid layouts | ✅ `flex`, `grid`, `items-center` | ⚠️ Complex layouts |
| Responsive design | ✅ `md:flex`, `lg:grid-cols-3` | ❌ |
| Hover/focus states | ✅ `hover:bg-blue-600`, `focus:ring-2` | ❌ |
| Dark mode | ✅ `dark:bg-gray-800` | ❌ |
| Complex animations | ❌ | ✅ `@keyframes` in CSS |
| Custom component shells | ❌ | ✅ `.task-item`, `.modal-overlay` |
| Print styles | ❌ | ✅ `@media print` |

**Hybrid Pattern Example:**

```css
/* styles.css - Custom component shell with Tailwind integration */

/* Base component structure in vanilla CSS */
.task-item {
  /* Use CSS variables for theming */
  background-color: var(--task-bg);
  border-left: 4px solid var(--task-border);
  transition: all 0.2s ease;
}

.task-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

/* Complex animation in vanilla CSS */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-item-enter {
  animation: fadeIn 0.3s ease-out;
}
```

```html
<!-- HTML combines custom CSS class with Tailwind utilities -->
<li class="task-item flex items-center justify-between p-4 rounded-lg mb-2">
  <span class="text-gray-900 dark:text-gray-100 font-medium">Task title</span>
  <div class="flex gap-2">
    <button class="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
      <span class="material-symbols-outlined">edit</span>
    </button>
  </div>
</li>
```

#### CSS Variables for Theming

**Define theme tokens in `styles.css`:**

```css
/* Light mode (default) */
:root {
  /* Color palette */
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --danger-color: #ef4444;
  
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  /* Text colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  /* Border colors */
  --border-color: #e5e7eb;
  --task-border: #3b82f6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Dark mode */
.dark {
  --primary-color: #60a5fa;
  --primary-hover: #3b82f6;
  --secondary-color: #9ca3af;
  --success-color: #34d399;
  --danger-color: #f87171;
  
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --bg-tertiary: #374151;
  
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  
  --border-color: #374151;
  --task-border: #60a5fa;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}
```

**Usage in custom CSS:**

```css
.custom-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}
```

#### Dark Mode Strategy

**Class-based strategy (configured in `tailwind.config.js`):**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class-based dark mode
  // ...
}
```

**HTML setup:**

```html
<!-- Dark mode controlled by class on <html> element -->
<html lang="en" class="dark">
  <!-- Content automatically switches to dark variants -->
</html>
```

**Tailwind dark mode utilities:**

```html
<!-- Background colors with dark mode -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-gray-100">Content</p>
</div>

<!-- Hover states with dark mode -->
<button class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
  Click me
</button>

<!-- Borders with dark mode -->
<div class="border border-gray-200 dark:border-gray-700">
  Content
</div>
```

**JavaScript theme toggle:**

```javascript
// Toggle dark mode
function toggleTheme() {
  const htmlElement = document.documentElement;
  const isDark = htmlElement.classList.toggle('dark');
  
  // Persist theme preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Update icon display
  updateThemeIcon(isDark);
}

// Apply saved theme on page load
function applyTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  
  updateThemeIcon(isDark);
}

// Call on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  // ... other initialization
});
```

#### Responsive Design Patterns

**Mobile-first approach with Tailwind breakpoints:**

```html
<!-- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px) -->

<!-- Responsive layout -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- Sidebar: full width on mobile, fixed width on desktop -->
  <aside class="w-full md:w-64 lg:w-80">
    <!-- Sidebar content -->
  </aside>
  
  <!-- Main content: full width on mobile, flexible on desktop -->
  <main class="flex-1">
    <!-- Main content -->
  </main>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- Responsive text sizing -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

<!-- Responsive spacing -->
<section class="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</section>

<!-- Responsive visibility -->
<button class="md:hidden">Mobile menu</button>
<nav class="hidden md:block">Desktop navigation</nav>
```

**Custom media queries for complex cases:**

```css
/* styles.css - Complex responsive pattern */

/* Mobile-first base styles */
.sidebar {
  position: fixed;
  left: -100%;
  width: 280px;
  transition: left 0.3s ease;
}

.sidebar.open {
  left: 0;
}

/* Tablet and up: sidebar always visible */
@media (min-width: 768px) {
  .sidebar {
    position: static;
    left: 0;
  }
  
  .sidebar.open {
    /* Reset mobile-specific styles */
    left: 0;
  }
}

/* Desktop: wider sidebar */
@media (min-width: 1024px) {
  .sidebar {
    width: 320px;
  }
}
```

#### Flexbox & Grid Patterns

**Flexbox common patterns:**

```html
<!-- Horizontal centering -->
<div class="flex justify-center items-center h-screen">
  <div>Centered content</div>
</div>

<!-- Space between items -->
<div class="flex justify-between items-center p-4">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Vertical stack with gap -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Responsive flex direction -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Column 1</div>
  <div class="flex-1">Column 2</div>
</div>

<!-- Wrap items -->
<div class="flex flex-wrap gap-2">
  <span class="badge">Tag 1</span>
  <span class="badge">Tag 2</span>
  <span class="badge">Tag 3</span>
</div>
```

**Grid common patterns:**

```html
<!-- Two-column layout -->
<div class="grid grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Responsive grid (1 col mobile, 2 tablet, 3 desktop) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<!-- Auto-fit grid (responsive without breakpoints) -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div>Auto-sized item</div>
  <div>Auto-sized item</div>
</div>

<!-- Grid with specific column sizes -->
<div class="grid grid-cols-[200px_1fr_200px] gap-4">
  <aside>Sidebar</aside>
  <main>Content</main>
  <aside>Sidebar</aside>
</div>

<!-- Grid area template -->
<div class="grid grid-rows-[auto_1fr_auto] h-screen">
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</div>
```

**Custom Grid in vanilla CSS:**

```css
/* Complex grid layout in vanilla CSS */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header header header header header header header header header header"
    "sidebar main main main main main main main main main main main"
    "footer footer footer footer footer footer footer footer footer footer footer footer";
  gap: 1.5rem;
  min-height: 100vh;
}

.dashboard-header {
  grid-area: header;
}

.dashboard-sidebar {
  grid-area: sidebar;
}

.dashboard-main {
  grid-area: main;
}

.dashboard-footer {
  grid-area: footer;
}

/* Responsive adjustment */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

---

### JavaScript Code Conventions

#### ES6+ Features to Use

**Prefer modern JavaScript features:**

```javascript
// ✅ GOOD: Use const/let (not var)
const dbName = "dailiesDB";
const dbVersion = 2;
let currentChart = null;
let timerInterval = null;

// ✅ GOOD: Arrow functions for callbacks
getAllRequest.onsuccess = () => {
  const tasks = getAllRequest.result;
  updateDisplay(tasks);
};

// ✅ GOOD: Template literals for strings
const message = `Task "${taskTitle}" completed successfully!`;
const html = `
  <li class="task-item" data-task-id="${taskId}">
    <span>${taskTitle}</span>
  </li>
`;

// ✅ GOOD: Destructuring
const { id, title, type, status } = task;
const [year, month, day] = dateString.split('-');

// ✅ GOOD: Async/await for asynchronous operations
async function loadUserData() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
}

// ✅ GOOD: Spread operator
const newTask = { ...existingTask, completed: true };
const allTasks = [...ongoingTasks, ...completedTasks];

// ✅ GOOD: Default parameters
function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// ✅ GOOD: Optional chaining
const userName = user?.profile?.name ?? 'Guest';

// ❌ BAD: Old-style JavaScript
var x = 5; // Use const/let
function() { return x; } // Use arrow function
"Task " + taskTitle + " completed"; // Use template literal
```

#### Global State Management

**Organize global state at the top of `app.js`:**

```javascript
// ============================================================================
// GLOBAL STATE VARIABLES
// ============================================================================

// Database connection
let db = null;

// Chart instances (must be destroyed before recreating)
let currentChart = null;
let currentPieChart = null;

// Timer state
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let currentTimerTask = "";

// Database configuration
const dbName = "dailiesDB";
const dbVersion = 2;

// User settings
let userSettings = {
  theme: 'light',
  expectedTasksPerDay: 3,
  nonNegotiableEnabled: true
};

// Cache DOM elements (query once, use many times)
let cachedElements = {};
```

**State update pattern:**

```javascript
// Update state, then update UI
function startTimer(taskName) {
  // Update global state
  timerRunning = true;
  currentTimerTask = taskName;
  timerSeconds = 0;
  
  // Update UI to reflect state
  updateTimerDisplay();
  
  // Start interval
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  // Update global state
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  
  // Save to database
  if (timerSeconds > 0) {
    saveTimeTrackingEntry(currentTimerTask, timerSeconds);
  }
  
  // Update UI
  updateTimerDisplay();
  
  // Reset state
  timerSeconds = 0;
  currentTimerTask = "";
}
```

#### Function Organization Pattern

**Organize functions into logical sections:**

```javascript
// ============================================================================
// SECTION 1: HELPER FUNCTIONS
// ============================================================================

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Format date for display (e.g., "Jan 23, 2026")
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Format seconds to HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Show notification to user
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ============================================================================
// SECTION 2: DATABASE OPERATIONS
// ============================================================================

// Initialize IndexedDB connection
function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    
    // Handle database upgrade (first time or version change)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create tasks object store if it doesn't exist
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        taskStore.createIndex('startDate', 'startDate', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
      }
      
      // Create timeTracking object store if it doesn't exist
      if (!db.objectStoreNames.contains('timeTracking')) {
        const timeStore = db.createObjectStore('timeTracking', { keyPath: 'id', autoIncrement: true });
        timeStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    
    // Handle successful connection
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    // Handle errors
    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Add a new task to the database
function addTask(title, type) {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!title || !type) {
      reject(new Error('Title and type are required'));
      return;
    }
    
    // Create task object
    const task = {
      title: title.trim(),
      type: type, // 'Goal' or 'Non-Negotiable'
      status: false, // false = ongoing, true = completed
      startDate: getTodayDate(),
      endDate: null
    };
    
    // Start transaction
    const transaction = db.transaction(['tasks'], 'readwrite');
    const taskStore = transaction.objectStore('tasks');
    const request = taskStore.add(task);
    
    // Handle success
    request.onsuccess = () => {
      resolve(request.result); // Returns the new task ID
    };
    
    // Handle error
    request.onerror = () => {
      console.error('Error adding task:', request.error);
      reject(request.error);
    };
  });
}

// Complete a task (mark as done)
function completeTask(taskId) {
  return new Promise((resolve, reject) => {
    // Start transaction
    const transaction = db.transaction(['tasks'], 'readwrite');
    const taskStore = transaction.objectStore('tasks');
    
    // Get the task first
    const getRequest = taskStore.get(taskId);
    
    getRequest.onsuccess = () => {
      const task = getRequest.result;
      
      if (!task) {
        reject(new Error('Task not found'));
        return;
      }
      
      // Update task properties
      task.status = true;
      task.endDate = getTodayDate();
      
      // Save updated task
      const updateRequest = taskStore.put(task);
      
      updateRequest.onsuccess = () => {
        // If Non-Negotiable, create for tomorrow
        if (task.type === 'Non-Negotiable') {
          createNonNegotiableForTomorrow(task.title);
        }
        
        resolve(task);
      };
      
      updateRequest.onerror = () => {
        console.error('Error updating task:', updateRequest.error);
        reject(updateRequest.error);
      };
    };
    
    getRequest.onerror = () => {
      console.error('Error getting task:', getRequest.error);
      reject(getRequest.error);
    };
  });
}

// Delete a task from the database
function deleteTask(taskId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const taskStore = transaction.objectStore('tasks');
    const request = taskStore.delete(taskId);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error deleting task:', request.error);
      reject(request.error);
    };
  });
}

// Get all tasks from the database
function getAllTasks() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tasks'], 'readonly');
    const taskStore = transaction.objectStore('tasks');
    const request = taskStore.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error getting tasks:', request.error);
      reject(request.error);
    };
  });
}

// ============================================================================
// SECTION 3: UI UPDATE FUNCTIONS
// ============================================================================

// Update the entire display (call after data changes)
async function updateDisplay() {
  try {
    const tasks = await getAllTasks();
    updateOngoingTasks(tasks);
    updateCompletedTasks(tasks);
    updateTaskCounters(tasks);
    updateCharts();
  } catch (error) {
    console.error('Error updating display:', error);
    showNotification('Failed to update display', 'error');
  }
}

// Update ongoing tasks list
function updateOngoingTasks(tasks) {
  const ongoingTasksList = document.getElementById('ongoing-tasks-list');
  
  // Filter ongoing tasks for today
  const todayDate = getTodayDate();
  const ongoingTasks = tasks.filter(task => 
    !task.status && task.startDate === todayDate
  );
  
  // Clear existing list
  ongoingTasksList.innerHTML = '';
  
  // Render tasks or empty state
  if (ongoingTasks.length === 0) {
    ongoingTasksList.innerHTML = `
      <li class="text-gray-500 dark:text-gray-400 text-center py-8">
        No ongoing tasks. Add a task to get started!
      </li>
    `;
    return;
  }
  
  // Render each task
  ongoingTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    ongoingTasksList.appendChild(taskElement);
  });
}

// Create a task element (DOM node)
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all';
  li.dataset.taskId = task.id;
  li.dataset.taskType = task.type;
  
  // Task icon based on type
  const iconClass = task.type === 'Non-Negotiable' ? 'star' : 'flag';
  
  li.innerHTML = `
    <div class="flex items-center gap-3 flex-1">
      <span class="material-symbols-outlined text-blue-500">${iconClass}</span>
      <span class="task-title text-gray-900 dark:text-gray-100 font-medium">${task.title}</span>
    </div>
    <div class="flex items-center gap-2">
      <button class="complete-btn p-2 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors" 
              onclick="handleCompleteTask(${task.id})"
              aria-label="Complete task">
        <span class="material-symbols-outlined text-green-600">check_circle</span>
      </button>
      <button class="delete-btn p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
              onclick="handleDeleteTask(${task.id})"
              aria-label="Delete task">
        <span class="material-symbols-outlined text-red-600">delete</span>
      </button>
    </div>
  `;
  
  return li;
}

// Update timer display
function updateTimerDisplay() {
  const timerValue = document.getElementById('timer-value');
  const timerStatus = document.getElementById('timer-status');
  const startBtn = document.getElementById('start-timer-btn');
  const stopBtn = document.getElementById('stop-timer-btn');
  
  // Update timer value
  timerValue.textContent = formatTime(timerSeconds);
  
  // Update UI based on timer state
  if (timerRunning) {
    timerStatus.textContent = `Tracking: ${currentTimerTask}`;
    startBtn.disabled = true;
    startBtn.classList.add('opacity-50', 'cursor-not-allowed');
    stopBtn.disabled = false;
    stopBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    timerStatus.textContent = 'Timer stopped';
    startBtn.disabled = false;
    startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    stopBtn.disabled = true;
    stopBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// ============================================================================
// SECTION 4: EVENT HANDLERS
// ============================================================================

// Handle add task button click
async function handleAddTask() {
  const titleInput = document.getElementById('task-title-input');
  const typeSelect = document.getElementById('task-type-select');
  
  const title = titleInput.value.trim();
  const type = typeSelect.value;
  
  // Validate input
  if (!title) {
    showNotification('Please enter a task title', 'error');
    return;
  }
  
  try {
    // Add to database
    await addTask(title, type);
    
    // Clear input
    titleInput.value = '';
    
    // Update display
    await updateDisplay();
    
    // Show success message
    showNotification('Task added successfully', 'success');
  } catch (error) {
    console.error('Error adding task:', error);
    showNotification('Failed to add task', 'error');
  }
}

// Handle complete task button click
async function handleCompleteTask(taskId) {
  try {
    await completeTask(taskId);
    await updateDisplay();
    showNotification('Task completed!', 'success');
  } catch (error) {
    console.error('Error completing task:', error);
    showNotification('Failed to complete task', 'error');
  }
}

// Handle delete task button click
async function handleDeleteTask(taskId) {
  // Confirm deletion
  const confirmed = confirm('Are you sure you want to delete this task?');
  
  if (!confirmed) {
    return;
  }
  
  try {
    await deleteTask(taskId);
    await updateDisplay();
    showNotification('Task deleted', 'info');
  } catch (error) {
    console.error('Error deleting task:', error);
    showNotification('Failed to delete task', 'error');
  }
}

// ============================================================================
// SECTION 5: INITIALIZATION
// ============================================================================

// Set up all event listeners
function setupEventListeners() {
  // Add task button
  const addTaskBtn = document.getElementById('add-task-btn');
  addTaskBtn.addEventListener('click', handleAddTask);
  
  // Enter key on task input
  const taskInput = document.getElementById('task-title-input');
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  });
  
  // Theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  // Timer buttons
  const startTimerBtn = document.getElementById('start-timer-btn');
  startTimerBtn.addEventListener('click', () => {
    const taskName = prompt('Enter task name for time tracking:');
    if (taskName) {
      startTimer(taskName);
    }
  });
  
  const stopTimerBtn = document.getElementById('stop-timer-btn');
  stopTimerBtn.addEventListener('click', stopTimer);
  
  // Export/Import buttons
  const exportBtn = document.getElementById('export-btn');
  exportBtn.addEventListener('click', exportDatabase);
  
  const importBtn = document.getElementById('import-btn');
  importBtn.addEventListener('click', importDatabase);
  
  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebar-toggle');
  sidebarToggle.addEventListener('click', toggleSidebar);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize database
    await initializeDB();
    console.log('Database initialized successfully');
    
    // Apply saved theme
    applyTheme();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial display update
    await updateDisplay();
    
    // Set up auto-save
    setupAutoSave();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showNotification('Failed to initialize application', 'error');
  }
});
```

#### Error Handling Pattern

**Use try-catch blocks with user feedback:**

```javascript
// Comprehensive error handling example
async function importDatabase() {
  try {
    // Step 1: Get file from user
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    const file = await new Promise((resolve, reject) => {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      fileInput.click();
    });
    
    // Step 2: Read and parse file
    const fileContent = await file.text();
    let data;
    
    try {
      data = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error('Invalid JSON file format');
    }
    
    // Step 3: Validate data structure
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Invalid data structure: missing tasks array');
    }
    
    if (!data.timeTracking || !Array.isArray(data.timeTracking)) {
      throw new Error('Invalid data structure: missing timeTracking array');
    }
    
    // Step 4: Confirm import (will overwrite existing data)
    const confirmed = confirm(
      `Import ${data.tasks.length} tasks and ${data.timeTracking.length} time entries?\n\n` +
      `This will replace your current data.`
    );
    
    if (!confirmed) {
      showNotification('Import cancelled', 'info');
      return;
    }
    
    // Step 5: Clear existing data
    await clearDatabase();
    
    // Step 6: Import tasks
    for (const task of data.tasks) {
      await addTaskFromImport(task);
    }
    
    // Step 7: Import time tracking entries
    for (const entry of data.timeTracking) {
      await addTimeTrackingFromImport(entry);
    }
    
    // Step 8: Update display
    await updateDisplay();
    
    // Step 9: Show success message
    showNotification(
      `Successfully imported ${data.tasks.length} tasks and ${data.timeTracking.length} time entries`,
      'success'
    );
    
  } catch (error) {
    // Log error for debugging
    console.error('Import failed:', error);
    
    // Show user-friendly error message
    let userMessage = 'Failed to import data';
    
    if (error.message.includes('JSON')) {
      userMessage = 'Invalid file format. Please select a valid backup file.';
    } else if (error.message.includes('data structure')) {
      userMessage = 'Invalid backup file structure. File may be corrupted.';
    } else if (error.message === 'No file selected') {
      userMessage = 'No file selected';
    }
    
    showNotification(userMessage, 'error');
  }
}
```

#### Commenting Guidelines

**Write comments that explain WHY, not just WHAT:**

```javascript
// ❌ BAD: Comment just repeats the code
// Set i to 0
let i = 0;

// ✅ GOOD: Comment explains the purpose
// Track the number of consecutive days with completed tasks (streak counter)
let consecutiveDays = 0;

// ❌ BAD: Obvious comment
// Loop through tasks
tasks.forEach(task => {
  // ...
});

// ✅ GOOD: Explains the business logic
// Filter tasks to include only those that:
// 1. Started today or earlier
// 2. Are marked as ongoing (not completed)
// This ensures we don't show future tasks or completed tasks in the ongoing list
const ongoingTasks = tasks.filter(task => 
  task.startDate <= getTodayDate() && !task.status
);

// ✅ GOOD: Explains a workaround or non-obvious code
// Destroy existing chart instance before creating a new one
// This prevents memory leaks and rendering issues with Chart.js
if (currentChart) {
  currentChart.destroy();
  currentChart = null;
}

// ✅ GOOD: Explains complex algorithm
// Calculate streak: count consecutive days (ending today) where at least
// one task was completed. Break the streak if any day has zero completions.
function calculateStreak(tasks) {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = formatDate(checkDate);
    
    // Count completions for this date
    const completions = tasks.filter(t => 
      t.endDate === dateString && t.status
    ).length;
    
    if (completions > 0) {
      streak++;
    } else {
      // Break streak if no completions found
      break;
    }
  }
  
  return streak;
}

// ✅ GOOD: Document function purpose and parameters
/**
 * Creates a confirmation modal dialog with custom message and actions.
 * 
 * @param {string} message - The message to display in the modal
 * @param {Function} onConfirm - Callback function executed when user confirms
 * @param {Function} onCancel - Callback function executed when user cancels (optional)
 * @returns {HTMLElement} The modal element (not appended to DOM)
 * 
 * @example
 * const modal = createConfirmModal(
 *   'Delete this task?',
 *   () => deleteTask(taskId),
 *   () => console.log('Cancelled')
 * );
 * document.body.appendChild(modal);
 */
function createConfirmModal(message, onConfirm, onCancel = null) {
  // Implementation...
}
```

#### IndexedDB Operation Patterns

**Standard patterns for CRUD operations:**

```javascript
// CREATE: Add new record
function addRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    // Open a readwrite transaction on the specified store
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Add the data (auto-generates ID if using autoIncrement)
    const request = store.add(data);
    
    request.onsuccess = () => {
      // Resolve with the generated ID
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error(`Error adding to ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

// READ: Get single record by ID
function getRecordById(storeName, id) {
  return new Promise((resolve, reject) => {
    // Use readonly transaction for read operations
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result); // null if not found
    };
    
    request.onerror = () => {
      console.error(`Error getting from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

// READ: Get all records
function getAllRecords(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result); // Array of all records
    };
    
    request.onerror = () => {
      console.error(`Error getting all from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

// READ: Query by index
function getRecordsByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error(`Error querying ${storeName} by ${indexName}:`, request.error);
      reject(request.error);
    };
  });
}

// UPDATE: Modify existing record
function updateRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    // Data must include the keyPath property (e.g., id)
    if (!data.id) {
      reject(new Error('Record must have an id property'));
      return;
    }
    
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // put() will update if exists, create if doesn't exist
    const request = store.put(data);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error(`Error updating ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

// DELETE: Remove record by ID
function deleteRecord(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error deleting from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

// DELETE: Clear entire store
function clearStore(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error clearing ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

// BATCH: Add multiple records efficiently
async function batchAddRecords(storeName, records) {
  // Process in chunks to avoid blocking
  const chunkSize = 100;
  
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Add all records in the chunk
      chunk.forEach(record => {
        store.add(record);
      });
      
      // Wait for transaction to complete
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = () => {
        console.error(`Batch add failed:`, transaction.error);
        reject(transaction.error);
      };
    });
  }
}
```

---

## Component Patterns Library

### Task Item Component

**HTML Structure:**

```html
<li class="task-item flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all mb-2" 
    data-task-id="123" 
    data-task-type="Goal">
  <!-- Left side: Icon and title -->
  <div class="flex items-center gap-3 flex-1">
    <span class="material-symbols-outlined text-blue-500">flag</span>
    <span class="task-title text-gray-900 dark:text-gray-100 font-medium">
      Complete project milestone
    </span>
  </div>
  
  <!-- Right side: Action buttons -->
  <div class="flex items-center gap-2">
    <button class="complete-btn p-2 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors" 
            aria-label="Complete task">
      <span class="material-symbols-outlined text-green-600">check_circle</span>
    </button>
    <button class="delete-btn p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            aria-label="Delete task">
      <span class="material-symbols-outlined text-red-600">delete</span>
    </button>
  </div>
</li>
```

**JavaScript Generator:**

```javascript
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all mb-2';
  li.dataset.taskId = task.id;
  li.dataset.taskType = task.type;
  
  // Choose icon based on task type
  const iconClass = task.type === 'Non-Negotiable' ? 'star' : 'flag';
  
  li.innerHTML = `
    <div class="flex items-center gap-3 flex-1">
      <span class="material-symbols-outlined text-blue-500">${iconClass}</span>
      <span class="task-title text-gray-900 dark:text-gray-100 font-medium">${escapeHtml(task.title)}</span>
    </div>
    <div class="flex items-center gap-2">
      <button class="complete-btn p-2 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors" 
              onclick="handleCompleteTask(${task.id})"
              aria-label="Complete task">
        <span class="material-symbols-outlined text-green-600">check_circle</span>
      </button>
      <button class="delete-btn p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
              onclick="handleDeleteTask(${task.id})"
              aria-label="Delete task">
        <span class="material-symbols-outlined text-red-600">delete</span>
      </button>
    </div>
  `;
  
  return li;
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### Modal Dialog Component

**HTML Template:**

```html
<!-- Modal overlay (add .hidden class to hide) -->
<div id="modal-overlay" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden" 
     role="dialog" 
     aria-modal="true" 
     aria-labelledby="modal-title">
  
  <!-- Modal content -->
  <div class="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
    
    <!-- Modal header -->
    <header class="flex items-center justify-between mb-4">
      <h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Modal Title
      </h2>
      <button class="close-modal text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              aria-label="Close modal">
        <span class="material-symbols-outlined">close</span>
      </button>
    </header>
    
    <!-- Modal body -->
    <div class="modal-body">
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        This is the modal content. You can place any content here.
      </p>
      
      <!-- Form or other content -->
      <div class="space-y-4">
        <!-- Content goes here -->
      </div>
    </div>
    
    <!-- Modal footer -->
    <footer class="flex justify-end gap-2 mt-6">
      <button class="btn-secondary px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        Cancel
      </button>
      <button class="btn-primary px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
        Confirm
      </button>
    </footer>
    
  </div>
</div>
```

**JavaScript Control:**

```javascript
// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  
  if (!modal) {
    console.error(`Modal ${modalId} not found`);
    return;
  }
  
  // Show modal
  modal.classList.remove('hidden');
  
  // Focus on first focusable element
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    firstFocusable.focus();
  }
  
  // Trap focus within modal
  trapFocus(modal);
}

// Hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  
  if (!modal) {
    console.error(`Modal ${modalId} not found`);
    return;
  }
  
  modal.classList.add('hidden');
  
  // Remove focus trap
  removeFocusTrap(modal);
}

// Trap focus within modal (accessibility)
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Handle tab key
  modal.addEventListener('keydown', function handleTab(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
  
  // Handle escape key
  modal.addEventListener('keydown', function handleEscape(e) {
    if (e.key === 'Escape') {
      hideModal(modal.id);
    }
  });
  
  // Close on overlay click
  modal.addEventListener('click', function handleOverlayClick(e) {
    if (e.target === modal) {
      hideModal(modal.id);
    }
  });
}

// Remove focus trap (cleanup)
function removeFocusTrap(modal) {
  // Clone and replace to remove all event listeners
  const newModal = modal.cloneNode(true);
  modal.parentNode.replaceChild(newModal, modal);
}
```

### Form Input Component

**HTML Pattern:**

```html
<div class="form-group mb-4">
  <label for="task-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Task Title
  </label>
  <input type="text" 
         id="task-title" 
         name="taskTitle"
         class="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
         placeholder="Enter task title"
         required
         aria-required="true"
         aria-describedby="task-title-error">
  <p id="task-title-error" class="text-red-500 text-sm mt-1 hidden" role="alert">
    Please enter a task title
  </p>
</div>

<div class="form-group mb-4">
  <label for="task-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Task Type
  </label>
  <select id="task-type" 
          name="taskType"
          class="form-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
    <option value="Goal">Goal</option>
    <option value="Non-Negotiable">Non-Negotiable</option>
  </select>
</div>
```

**JavaScript Validation:**

```javascript
// Validate form input
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    const value = input.value.trim();
    const errorElement = document.getElementById(`${input.id}-error`);
    
    if (!value) {
      // Show error
      isValid = false;
      input.classList.add('border-red-500');
      input.setAttribute('aria-invalid', 'true');
      
      if (errorElement) {
        errorElement.classList.remove('hidden');
      }
    } else {
      // Clear error
      input.classList.remove('border-red-500');
      input.setAttribute('aria-invalid', 'false');
      
      if (errorElement) {
        errorElement.classList.add('hidden');
      }
    }
  });
  
  return isValid;
}

// Clear form errors
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.classList.remove('border-red-500');
    input.setAttribute('aria-invalid', 'false');
    
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  });
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formId = e.target.id;
  
  // Validate form
  if (!validateForm(formId)) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Get form data
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    // Process form data
    await processFormData(data);
    
    // Clear form
    e.target.reset();
    clearFormErrors(formId);
    
    // Show success
    showNotification('Form submitted successfully', 'success');
  } catch (error) {
    console.error('Form submission failed:', error);
    showNotification('Failed to submit form', 'error');
  }
}
```

### Button Variants

**HTML Styles:**

```html
<!-- Primary button -->
<button class="btn-primary px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Primary Action
</button>

<!-- Secondary button -->
<button class="btn-secondary px-4 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
  Secondary Action
</button>

<!-- Danger button -->
<button class="btn-danger px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
  Delete
</button>

<!-- Success button -->
<button class="btn-success px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
  Confirm
</button>

<!-- Icon button -->
<button class="btn-icon p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Settings">
  <span class="material-symbols-outlined">settings</span>
</button>

<!-- Disabled button -->
<button class="btn-primary px-4 py-2 bg-blue-500 text-white font-medium rounded-lg opacity-50 cursor-not-allowed" disabled>
  Disabled
</button>
```

### Empty State Component

**HTML Pattern:**

```html
<div class="empty-state flex flex-col items-center justify-center p-12 text-center">
  <span class="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">
    inbox
  </span>
  <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
    No tasks yet
  </h3>
  <p class="text-gray-500 dark:text-gray-400 mb-6">
    Get started by adding your first task!
  </p>
  <button class="btn-primary px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
    Add Task
  </button>
</div>
```

---

## Accessibility Guidelines

### Keyboard Navigation

**Essential keyboard support:**

```javascript
// Ensure all interactive elements are keyboard accessible
// Tab: Move forward through elements
// Shift + Tab: Move backward through elements
// Enter/Space: Activate buttons and links
// Escape: Close modals and dropdowns
// Arrow keys: Navigate within components (e.g., date picker, select)

// Example: Keyboard navigation for custom component
function setupKeyboardNav(element) {
  element.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        element.click();
        break;
        
      case 'Escape':
        closeComponent(element);
        break;
        
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        navigateItems(element, e.key === 'ArrowDown' ? 1 : -1);
        break;
    }
  });
}

// Ensure custom interactive elements have tabindex
// tabindex="0" - Include in natural tab order
// tabindex="-1" - Programmatically focusable, but not in tab order
```

### ARIA Attributes

**Required ARIA patterns:**

```html
<!-- Button with icon only (needs aria-label) -->
<button aria-label="Delete task" class="icon-btn">
  <span class="material-symbols-outlined" aria-hidden="true">delete</span>
</button>

<!-- Form input with error (use aria-describedby) -->
<input type="text" 
       id="task-title"
       aria-required="true"
       aria-invalid="false"
       aria-describedby="task-title-error">
<p id="task-title-error" role="alert" class="hidden">
  Task title is required
</p>

<!-- Modal dialog (use role and aria-modal) -->
<div id="modal" 
     role="dialog" 
     aria-modal="true" 
     aria-labelledby="modal-title"
     aria-describedby="modal-description">
  <h2 id="modal-title">Confirm Delete</h2>
  <p id="modal-description">Are you sure you want to delete this task?</p>
</div>

<!-- Loading state (use aria-live) -->
<div aria-live="polite" aria-busy="true">
  Loading...
</div>

<!-- Expandable section (use aria-expanded) -->
<button aria-expanded="false" aria-controls="section-content">
  Show Details
</button>
<div id="section-content" hidden>
  Details content
</div>

<!-- Navigation landmark -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="#tasks">Tasks</a></li>
    <li><a href="#stats">Statistics</a></li>
  </ul>
</nav>

<!-- Search landmark -->
<div role="search">
  <label for="search-input">Search tasks</label>
  <input type="search" id="search-input">
</div>
```

### Focus Management

**Visible focus indicators:**

```css
/* Ensure focus is visible (don't remove outlines without replacement) */

/* ❌ BAD: Removes focus indicator completely */
button:focus {
  outline: none;
}

/* ✅ GOOD: Custom focus indicator using focus-visible */
button:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* ✅ GOOD: Tailwind focus utilities */
```

```html
<button class="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
  Button with focus ring
</button>
```

**JavaScript focus management:**

```javascript
// Move focus to newly created element
function addTaskToList(task) {
  const taskElement = createTaskElement(task);
  taskList.appendChild(taskElement);
  
  // Focus on the new task's first action button
  const firstButton = taskElement.querySelector('button');
  if (firstButton) {
    firstButton.focus();
  }
}

// Return focus after modal closes
let lastFocusedElement = null;

function openModal(modalId) {
  // Save current focus
  lastFocusedElement = document.activeElement;
  
  showModal(modalId);
}

function closeModal(modalId) {
  hideModal(modalId);
  
  // Restore focus
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}
```

### Screen Reader Considerations

**Accessible text patterns:**

```html
<!-- Live regions for dynamic content updates -->
<div id="notification-region" 
     aria-live="polite" 
     aria-atomic="true" 
     class="sr-only">
  <!-- Dynamically updated messages appear here -->
</div>

<!-- Screen reader only text (sr-only utility class) -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>

<button>
  <span class="material-symbols-outlined" aria-hidden="true">delete</span>
  <span class="sr-only">Delete task</span>
</button>

<!-- Descriptive link text (avoid "click here") -->
<!-- ❌ BAD -->
<a href="/docs">Click here</a> for documentation.

<!-- ✅ GOOD -->
<a href="/docs">View documentation</a>
```

**JavaScript announcements:**

```javascript
// Announce dynamic updates to screen readers
function announceToScreenReader(message) {
  const liveRegion = document.getElementById('notification-region');
  
  if (!liveRegion) {
    console.warn('Live region not found');
    return;
  }
  
  // Clear previous message
  liveRegion.textContent = '';
  
  // Set new message (delay ensures screen reader picks it up)
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
  
  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 3000);
}

// Usage
async function handleCompleteTask(taskId) {
  await completeTask(taskId);
  announceToScreenReader('Task completed successfully');
}
```

---

## Performance & Best Practices

### Chart.js Memory Management

**Prevent memory leaks:**

```javascript
// Global chart instance references
let currentChart = null;
let currentPieChart = null;

// Destroy existing chart before creating new one
function updateChart(canvasId, chartData, chartOptions) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Destroy existing chart instance
  if (canvasId === 'main-chart' && currentChart) {
    currentChart.destroy();
    currentChart = null;
  } else if (canvasId === 'pie-chart' && currentPieChart) {
    currentPieChart.destroy();
    currentPieChart = null;
  }
  
  // Create new chart instance
  const newChart = new Chart(ctx, {
    type: chartData.type,
    data: chartData.data,
    options: chartOptions
  });
  
  // Store reference
  if (canvasId === 'main-chart') {
    currentChart = newChart;
  } else if (canvasId === 'pie-chart') {
    currentPieChart = newChart;
  }
  
  return newChart;
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (currentChart) {
    currentChart.destroy();
  }
  if (currentPieChart) {
    currentPieChart.destroy();
  }
});
```

### DOM Query Caching

**Cache frequently accessed elements:**

```javascript
// ❌ BAD: Query DOM repeatedly
function updateDisplay() {
  document.getElementById('task-list').innerHTML = '';
  document.getElementById('task-list').appendChild(newElement);
  document.getElementById('task-list').classList.add('updated');
}

// ✅ GOOD: Cache DOM element
const taskList = document.getElementById('task-list');

function updateDisplay() {
  taskList.innerHTML = '';
  taskList.appendChild(newElement);
  taskList.classList.add('updated');
}

// ✅ EVEN BETTER: Cache all frequently used elements on init
const elements = {};

function cacheElements() {
  elements.taskList = document.getElementById('task-list');
  elements.completedList = document.getElementById('completed-list');
  elements.timerDisplay = document.getElementById('timer-display');
  elements.chartCanvas = document.getElementById('chart-canvas');
  // ... cache all other frequently used elements
}

// Call once on page load
document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  // ... rest of initialization
});

// Use cached elements
function updateDisplay() {
  elements.taskList.innerHTML = '';
  elements.taskList.appendChild(newElement);
}
```

### IndexedDB Batch Operations

**Process large datasets efficiently:**

```javascript
// ❌ BAD: Sequential operations (slow for large datasets)
async function importTasks(tasks) {
  for (const task of tasks) {
    await addTask(task.title, task.type);
  }
}

// ✅ GOOD: Batch operations in single transaction
async function importTasks(tasks) {
  return new Promise((resolve, reject) => {
    // Open single transaction for all operations
    const transaction = db.transaction(['tasks'], 'readwrite');
    const taskStore = transaction.objectStore('tasks');
    
    // Add all tasks in the same transaction
    tasks.forEach(task => {
      taskStore.add(task);
    });
    
    // Transaction completes when all operations finish
    transaction.oncomplete = () => {
      resolve();
    };
    
    transaction.onerror = () => {
      console.error('Batch import failed:', transaction.error);
      reject(transaction.error);
    };
  });
}

// ✅ EVEN BETTER: Batch with chunking for very large datasets
async function importTasksChunked(tasks) {
  const chunkSize = 100;
  
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['tasks'], 'readwrite');
      const taskStore = transaction.objectStore('tasks');
      
      chunk.forEach(task => {
        taskStore.add(task);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    
    // Allow UI to update between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### Debouncing Frequent Updates

**Prevent excessive function calls:**

```javascript
// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage: Debounce search input
const searchInput = document.getElementById('search-input');
const debouncedSearch = debounce(performSearch, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

function performSearch(query) {
  // Expensive search operation
  console.log('Searching for:', query);
  // ... search logic
}

// Usage: Debounce window resize
const debouncedResize = debounce(() => {
  updateCharts();
  recalculateLayout();
}, 150);

window.addEventListener('resize', debouncedResize);

// Throttle utility (alternative: limit calls to once per interval)
function throttle(func, interval) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= interval) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// Usage: Throttle scroll event
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', throttledScroll);
```

### Lazy Loading

**Load resources on demand:**

```javascript
// Lazy load charts (only create when section is visible)
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const chartId = entry.target.dataset.chartId;
      loadChart(chartId);
      
      // Unobserve after loading
      chartObserver.unobserve(entry.target);
    }
  });
});

// Observe chart containers
document.querySelectorAll('[data-chart-id]').forEach(container => {
  chartObserver.observe(container);
});

// Lazy load heavy components
async function loadGoogleDriveIntegration() {
  if (!window.googleDriveLoaded) {
    // Load Google API library
    await loadScript('https://apis.google.com/js/api.js');
    
    // Initialize
    await initializeGoogleDrive();
    
    window.googleDriveLoaded = true;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

---

## Testing & QA Checklist

### Manual Testing Procedures

**Before committing code, verify:**

#### Functionality Testing
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Forms validate correctly (required fields, data types)
- [ ] Buttons trigger correct actions
- [ ] Navigation works across all pages/sections
- [ ] IndexedDB operations complete successfully
- [ ] Export/import maintains data integrity
- [ ] Time tracking calculates correctly
- [ ] Charts render with accurate data
- [ ] Empty states display when appropriate
- [ ] Error handling shows user-friendly messages

#### Cross-Browser Testing
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)
- [ ] Mobile browsers (Safari iOS, Chrome Android)

#### Responsive Testing
- [ ] Mobile (375px width minimum)
- [ ] Tablet (768px width)
- [ ] Desktop (1024px, 1440px, 1920px widths)
- [ ] Landscape and portrait orientations
- [ ] Text remains readable at all sizes
- [ ] Buttons/links remain tappable (minimum 44x44px)
- [ ] No horizontal scrolling on small screens

#### Dark Mode Testing
- [ ] All components have dark mode variants
- [ ] Text contrast meets WCAG AA standards (4.5:1)
- [ ] Theme persists after page reload
- [ ] Theme toggle works smoothly
- [ ] Charts adapt to theme changes
- [ ] Icons remain visible in both themes

#### Accessibility Testing
- [ ] All interactive elements keyboard accessible (Tab navigation)
- [ ] Focus indicators visible on all elements
- [ ] Screen reader announces content correctly
- [ ] ARIA attributes present where needed
- [ ] Form errors announced to screen readers
- [ ] Modals trap focus correctly
- [ ] Alt text for images (if applicable)
- [ ] Semantic HTML structure
- [ ] Color not used as only indicator (icons, text)

#### Performance Testing
- [ ] Page loads in under 3 seconds
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] IndexedDB operations complete quickly
- [ ] Charts destroy old instances before creating new
- [ ] Large datasets don't freeze UI
- [ ] Smooth scrolling and animations (60fps)
- [ ] No console errors or warnings

#### Data Integrity Testing
- [ ] Export contains all data
- [ ] Import restores all data correctly
- [ ] No data loss after browser refresh
- [ ] IndexedDB versioning handles upgrades
- [ ] Date calculations work across timezones
- [ ] Time tracking totals accurate

---

## Common Issues & Solutions

### Issue: IndexedDB Connection Fails

**Problem:** Database doesn't initialize on page load

**Symptoms:**
- Console error: "Failed to open database"
- Tasks don't persist after refresh
- "Database not initialized" errors

**Solutions:**

```javascript
// 1. Check browser support
if (!window.indexedDB) {
  console.error('IndexedDB not supported in this browser');
  showNotification('Your browser does not support local storage. Please use a modern browser.', 'error');
  return;
}

// 2. Handle version conflicts
request.onblocked = (event) => {
  console.warn('Database upgrade blocked. Close all other tabs with this app open.');
  showNotification('Please close all other tabs with this app open and refresh.', 'warning');
};

// 3. Clear corrupted database
async function clearDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onsuccess = () => {
      console.log('Database cleared successfully');
      resolve();
    };
    
    request.onerror = () => {
      console.error('Failed to clear database');
      reject();
    };
  });
}

// 4. Retry connection with exponential backoff
async function initializeDatabaseWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await initializeDB();
      return;
    } catch (error) {
      console.error(`Database init attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error('Failed to initialize database after multiple attempts');
}
```

### Issue: Chart.js Memory Leaks

**Problem:** Application slows down after repeated chart updates

**Symptoms:**
- Increasing memory usage in DevTools
- Lag when updating charts
- Browser tab becomes unresponsive

**Solutions:**

```javascript
// Always destroy chart before creating new instance
let chartInstance = null;

function updateChart(data) {
  const ctx = document.getElementById('chart-canvas').getContext('2d');
  
  // Destroy existing instance
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  
  // Create new instance
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Clean up on component unmount or page unload
window.addEventListener('beforeunload', () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
```

### Issue: Dark Mode Theme Flicker

**Problem:** Page flashes light theme before applying dark theme on load

**Symptoms:**
- Brief white flash when loading page
- Theme applies after content renders

**Solutions:**

```html
<!-- Add inline script in <head> BEFORE any styles -->
<head>
  <script>
    // Apply theme immediately (before page renders)
    (function() {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  
  <!-- Other head content -->
</head>
```

### Issue: Date/Timezone Calculation Errors

**Problem:** Tasks show on wrong dates or disappear

**Symptoms:**
- Today's tasks don't appear
- Tasks appear one day off
- Inconsistent behavior across timezones

**Solutions:**

```javascript
// Always use local timezone for date calculations

// ❌ BAD: Can be affected by timezone
const today = new Date().toISOString().split('T')[0];

// ✅ GOOD: Force local timezone
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ GOOD: Parse dates in local timezone
function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

// ❌ BAD: May parse in UTC
const date = new Date('2026-01-23'); // Could be Jan 22 in some timezones!

// ✅ GOOD: Explicit local timezone
const date = new Date(2026, 0, 23); // Always Jan 23 in local timezone
```

### Issue: XSS Vulnerability in Task Titles

**Problem:** User input rendered without escaping

**Symptoms:**
- Task titles can execute JavaScript
- `<script>` tags in task titles execute
- Security vulnerability

**Solutions:**

```javascript
// Always escape user input before rendering

// ❌ BAD: Direct innerHTML with user input
taskElement.innerHTML = `<span>${task.title}</span>`;

// ✅ GOOD: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

taskElement.innerHTML = `<span>${escapeHtml(task.title)}</span>`;

// ✅ EVEN BETTER: Use textContent (no HTML parsing)
const span = document.createElement('span');
span.textContent = task.title; // Automatically escaped
taskElement.appendChild(span);
```

---

## Copy-Paste Templates

### Starter HTML Section Template

```html
<section id="section-name" class="mb-8">
  <!-- Section header -->
  <header class="flex items-center justify-between mb-4">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
      Section Title
    </h2>
    <button class="btn-primary px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
      Action
    </button>
  </header>
  
  <!-- Section content -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <!-- Content goes here -->
  </div>
</section>
```

### IndexedDB CRUD Template

```javascript
// Database configuration
const dbName = "myAppDB";
const dbVersion = 1;
let db = null;

// Initialize database
function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Create indexes
        itemStore.createIndex('name', 'name', { unique: false });
        itemStore.createIndex('created', 'created', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Create
function addItem(itemData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.add(itemData);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Read
function getItem(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Update
function updateItem(itemData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.put(itemData);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Delete
function deleteItem(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get all
function getAllItems() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### Event Handler Setup Template

```javascript
// Set up all event listeners
function setupEventListeners() {
  // Button click events
  document.getElementById('add-btn').addEventListener('click', handleAdd);
  document.getElementById('save-btn').addEventListener('click', handleSave);
  document.getElementById('delete-btn').addEventListener('click', handleDelete);
  
  // Form submission
  document.getElementById('main-form').addEventListener('submit', handleSubmit);
  
  // Input events
  document.getElementById('search-input').addEventListener('input', handleSearch);
  document.getElementById('filter-select').addEventListener('change', handleFilter);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcut);
  
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // Window events
  window.addEventListener('resize', handleResize);
  window.addEventListener('beforeunload', handleBeforeUnload);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeDB();
    setupEventListeners();
    await loadInitialData();
    console.log('Application initialized');
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});
```

### Form Validation Template

```javascript
// Validate form
function validateForm(formElement) {
  const errors = [];
  
  // Get all required inputs
  const requiredInputs = formElement.querySelectorAll('[required]');
  
  requiredInputs.forEach(input => {
    const value = input.value.trim();
    const label = input.previousElementSibling?.textContent || input.name;
    
    // Check if empty
    if (!value) {
      errors.push(`${label} is required`);
      showInputError(input, `${label} is required`);
    } else {
      clearInputError(input);
    }
    
    // Type-specific validation
    if (value && input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${label} must be a valid email`);
        showInputError(input, 'Invalid email format');
      }
    }
    
    if (value && input.type === 'url') {
      try {
        new URL(value);
      } catch {
        errors.push(`${label} must be a valid URL`);
        showInputError(input, 'Invalid URL format');
      }
    }
    
    if (value && input.type === 'number') {
      const min = input.min ? parseFloat(input.min) : null;
      const max = input.max ? parseFloat(input.max) : null;
      const num = parseFloat(value);
      
      if (min !== null && num < min) {
        errors.push(`${label} must be at least ${min}`);
        showInputError(input, `Minimum value is ${min}`);
      }
      
      if (max !== null && num > max) {
        errors.push(`${label} must be at most ${max}`);
        showInputError(input, `Maximum value is ${max}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Show input error
function showInputError(input, message) {
  input.classList.add('border-red-500');
  input.setAttribute('aria-invalid', 'true');
  
  const errorId = `${input.id}-error`;
  let errorElement = document.getElementById(errorId);
  
  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.id = errorId;
    errorElement.className = 'text-red-500 text-sm mt-1';
    errorElement.setAttribute('role', 'alert');
    input.parentElement.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  input.setAttribute('aria-describedby', errorId);
}

// Clear input error
function clearInputError(input) {
  input.classList.remove('border-red-500');
  input.setAttribute('aria-invalid', 'false');
  
  const errorId = `${input.id}-error`;
  const errorElement = document.getElementById(errorId);
  
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

// Handle form submit
async function handleSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const validation = validateForm(form);
  
  if (!validation.isValid) {
    showNotification('Please fix form errors', 'error');
    return;
  }
  
  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  try {
    // Process data
    await processFormData(data);
    
    // Reset form
    form.reset();
    
    showNotification('Form submitted successfully', 'success');
  } catch (error) {
    console.error('Form submission failed:', error);
    showNotification('Failed to submit form', 'error');
  }
}
```

---

## Review Checklist

Before submitting code for review, ensure:

### Code Quality
- [ ] Code follows ES6+ conventions (const/let, arrow functions, template literals)
- [ ] Functions are small and single-purpose (max ~50 lines)
- [ ] Comprehensive comments explain complex logic
- [ ] No console.log statements left in code (use console.error for errors only)
- [ ] Variable and function names are descriptive
- [ ] No hardcoded values (use constants)
- [ ] Error handling with try-catch blocks
- [ ] Input validation before processing

### HTML Structure
- [ ] Semantic HTML elements used throughout
- [ ] Data attributes for JavaScript hooks
- [ ] ARIA attributes where needed
- [ ] Accessible forms with labels and error messages
- [ ] Modal dialogs structured correctly
- [ ] No inline event handlers (use addEventListener)

### CSS & Styling
- [ ] Tailwind utilities used for common patterns
- [ ] Custom CSS only for complex cases
- [ ] CSS variables for theme tokens
- [ ] Dark mode variants for all components
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] No !important unless absolutely necessary
- [ ] Animations perform at 60fps

### JavaScript Patterns
- [ ] Global state organized at top of file
- [ ] Functions grouped logically (helpers, database, UI, events)
- [ ] IndexedDB operations use promises
- [ ] Chart instances destroyed before recreating
- [ ] Event listeners cleaned up when needed
- [ ] No memory leaks (tested in DevTools)
- [ ] Debouncing/throttling for frequent operations

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels for icon-only buttons
- [ ] Screen reader announcements for dynamic updates
- [ ] Form errors announced to screen readers
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Modals trap focus correctly

### Performance
- [ ] DOM queries cached where possible
- [ ] Batch IndexedDB operations
- [ ] Charts destroyed and recreated properly
- [ ] No blocking operations on main thread
- [ ] Images optimized (if applicable)
- [ ] CSS/JS minified for production

### Testing
- [ ] Tested in Chrome, Firefox, Safari, Edge
- [ ] Tested on mobile (iOS Safari, Chrome Android)
- [ ] Tested at mobile (375px), tablet (768px), desktop (1440px) sizes
- [ ] Dark mode tested thoroughly
- [ ] All CRUD operations work
- [ ] Export/import maintains data integrity
- [ ] Error scenarios handled gracefully
- [ ] No console errors

### Documentation
- [ ] Complex functions have JSDoc comments
- [ ] README updated if needed
- [ ] Breaking changes noted
- [ ] Examples provided for new patterns

---

## Summary

This skill template defines the frontend development approach for DailiesApp:

1. **Hybrid Methodology**: Combine Tailwind CSS utilities with vanilla CSS for complex patterns
2. **ES6+ JavaScript**: Use modern features (const/let, arrow functions, async/await, template literals)
3. **Clear Structure**: Organize code into logical sections (helpers, database, UI, events)
4. **Comprehensive Comments**: Explain WHY code exists, not just WHAT it does
5. **Accessibility First**: ARIA attributes, keyboard navigation, screen reader support
6. **Performance Optimized**: Cache DOM queries, batch operations, destroy chart instances
7. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
8. **Dark Mode Support**: Class-based strategy with CSS variables
9. **Error Handling**: Try-catch blocks with user-friendly notifications
10. **IndexedDB Patterns**: Standard CRUD operations with promises

**Key Principles:**
- **Semantic HTML** provides structure and accessibility
- **Tailwind utilities** for common patterns; vanilla CSS for complex cases
- **JavaScript functions** are small, focused, and well-documented
- **User experience** is paramount: fast, accessible, responsive
- **Code quality** maintained through consistent patterns and thorough testing

**Remember:** This is a living document. Update it as patterns evolve and new best practices emerge.

---

*Last updated: January 23, 2026*
