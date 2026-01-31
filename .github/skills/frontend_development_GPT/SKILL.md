---
name: Front-End Designer (Vanilla CSS + Tailwind + Vanilla JS)
scope: UI/UX implementation for DailiesApp
stack: HTML, Tailwind CSS v4, vanilla CSS (Flex/Grid), vanilla JS
level: intermediate-to-senior
last_updated: 2026-01-23
---

# Skill: Front-End Designer (Vanilla CSS + Tailwind + Vanilla JS)

This skill focuses on building **clean, maintainable, accessible UI** using:

- **Tailwind CSS** for fast, consistent styling (spacing, typography, colors, states)
- **Vanilla CSS** for higher-level layout and patterns (Flex/Grid), custom components, and edge cases
- **Vanilla JS** for UI behavior (event delegation, state-driven rendering, progressive enhancement)

The goal is to keep UI code **clearly structured**, **well commented**, and **segmented by responsibility**.

---

## What “Good” Looks Like

### Outcomes
- The UI remains readable in light/dark mode.
- Layouts are responsive and don’t rely on “magic numbers.”
- Interactive elements work with keyboard + screen readers.
- Styling is consistent: no ad-hoc one-off class soup or scattered CSS overrides.
- JavaScript is predictable: clear state, clear render/update boundaries.

### Non-goals
- Adding new frameworks (React/Vue/etc.).
- Introducing complex build tooling beyond the existing Tailwind pipeline.

---

## Conventions (DailiesApp)

### Use Tailwind for
- Spacing, typography, colors, shadows, borders, hover/focus states
- Responsive variants (e.g., `sm:`, `md:`)
- Dark mode variants (e.g., `dark:`)

### Use vanilla CSS for
- Layout systems (Flex/Grid) when structure matters and classes would become noisy
- Reusable “component shells” (e.g., task row, modal, toast) where semantic naming helps
- Complex states/animations or cross-cutting rules

### Use vanilla JS for
- Event handling, toggles, modals, timers, and DOM updates
- Event delegation for lists (tasks, backups, history)
- Minimal, scoped DOM queries and predictable update functions

---

## File Touchpoints

- `index.html`: semantic structure, ARIA, data-attributes/hooks
- `app.js`: UI logic, event listeners, rendering, IndexedDB interactions
- `styles.css` / `custom.css`: custom CSS for layout/components not covered by Tailwind
- `tailwind.config.js`: tokens, dark mode strategy, theme extensions

---

## Structure Your UI Code (Segmentation Rules)

### HTML
Prefer semantic containers:

- `<main>` for primary content
- `<section>` for dashboard areas
- `<aside>` for secondary panels
- `<button>` for actions (not clickable `<div>`)

Add **stable JS hooks** using `data-*` attributes instead of brittle selectors:

```html
<!-- Hooks are stable; classes can change freely -->
<button
	type="button"
	data-action="toggle-theme"
	class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
				 bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:outline-none
				 focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-100 dark:text-zinc-900">
	Toggle theme
</button>
```

### CSS
Segment by responsibility (recommended ordering inside `styles.css` / `custom.css`):

1. **Tokens** (CSS variables)
2. **Layout primitives** (Flex/Grid helpers)
3. **Components** (task row, modal, toast)
4. **Utilities** (rare, app-specific)
5. **Overrides** (last resort; keep tiny)

### JavaScript
Segment by responsibility:

1. **State** (minimal global state)
2. **DOM hooks** (one place for queries)
3. **Render/update functions** (idempotent when possible)
4. **Event handlers** (thin; call into render/update)
5. **Integration** (IndexedDB, charts, cloud sync)

---

## Layout Skill: Flex + Grid (Vanilla CSS)

### Flex: rows, alignment, “media objects”

Use Flex when you’re aligning items on one axis (toolbars, list rows, header actions).

```css
/* ========== Layout Primitives: Flex ========== */

.l-row {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.l-row--between {
	justify-content: space-between;
}

.l-row__grow {
	flex: 1 1 auto;
	min-width: 0; /* prevents overflow in flex rows */
}
```

### Grid: dashboards, card layouts, consistent spacing

Use Grid when you want two-dimensional layout with predictable tracks.

```css
/* ========== Layout Primitives: Grid ========== */

.l-grid {
	display: grid;
	gap: 1rem;
}

/* Responsive grid without Tailwind class noise */
.l-grid--cards {
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	align-items: start;
}
```

### Prefer CSS variables for theme-friendly values

```css
/* ========== Tokens ========== */

:root {
	--surface: #ffffff;
	--surface-muted: #f4f4f5;
	--text: #18181b;
	--border: #e4e4e7;
	--focus: #3b82f6;
}

.dark {
	--surface: #09090b;
	--surface-muted: #18181b;
	--text: #fafafa;
	--border: #27272a;
	--focus: #60a5fa;
}
```

---

## Styling Skill: Tailwind + Vanilla CSS (Hybrid Pattern)

### Rule of thumb
- If it’s **local and simple**, use Tailwind utilities in the markup.
- If it’s **structural/reused**, create a named class in CSS and keep Tailwind for tokens/states.

### Example: Task row shell in vanilla CSS + Tailwind tokens

```html
<li class="taskRow" data-task-id="123">
	<div class="taskRow__main">
		<label class="taskRow__title">
			<input
				type="checkbox"
				class="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500
							 dark:border-zinc-700 dark:bg-zinc-900"
				data-action="toggle-task" />
			<span class="taskRow__titleText">Morning workout</span>
		</label>
	</div>

	<div class="taskRow__actions">
		<button
			type="button"
			class="rounded-md px-2 py-1 text-xs font-medium
						 bg-zinc-100 text-zinc-900 hover:bg-zinc-200
						 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
			data-action="start-timer">
			Start
		</button>

		<button
			type="button"
			class="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50
						 dark:text-red-300 dark:hover:bg-red-950/40"
			data-action="delete-task">
			Delete
		</button>
	</div>
</li>
```

```css
/* ========== Components: Task Row ========== */

.taskRow {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	padding: 0.75rem;
	border: 1px solid var(--border);
	border-radius: 0.75rem;
	background: var(--surface);
}

.taskRow__main {
	min-width: 0;
}

.taskRow__title {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	cursor: pointer;
}

.taskRow__titleText {
	color: var(--text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.taskRow__actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex: 0 0 auto;
}

/* Explicit focus style for non-Tailwind elements */
.taskRow :focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 35%, transparent);
}
```

---

## Behavior Skill: Vanilla JS (Clear + Maintainable)

### Principles
- **Event delegation** for lists (one listener on the container).
- **Data attributes** for actions: `data-action="..."`.
- **One-way UI updates**: state changes then render.
- Prefer small, named functions over inline anonymous handlers.

### Example: Delegated click handling for task list

```js
// ========== DOM Hooks ==========
const dom = {
	taskList: document.querySelector('[data-role="task-list"]'),
};

// ========== Event Wiring ==========
const setupTaskListEvents = () => {
	if (!dom.taskList) return;

	dom.taskList.addEventListener('click', (event) => {
		const actionEl = event.target.closest('[data-action]');
		if (!actionEl) return;

		const action = actionEl.dataset.action;
		const row = actionEl.closest('[data-task-id]');
		const taskId = row ? Number(row.dataset.taskId) : null;

		switch (action) {
			case 'start-timer':
				if (taskId == null) return;
				startTimerForTask(taskId);
				break;

			case 'delete-task':
				if (taskId == null) return;
				confirmDeleteTask(taskId);
				break;

			default:
				// Keep a default branch so unknown actions fail safely.
				console.warn('Unknown action:', action);
		}
	});
};
```

### Example: Render function boundaries

```js
// Rendering should be idempotent: given the same state, produce the same UI.
const renderTaskRow = (task) => {
	return `
		<li class="taskRow" data-task-id="${task.id}">
			<div class="taskRow__main">
				<label class="taskRow__title">
					<input type="checkbox" data-action="toggle-task" ${task.status ? 'checked' : ''} />
					<span class="taskRow__titleText">${escapeHtml(task.title)}</span>
				</label>
			</div>
			<div class="taskRow__actions">
				<button type="button" data-action="start-timer">Start</button>
				<button type="button" data-action="delete-task">Delete</button>
			</div>
		</li>
	`;
};

// Simple XSS-safe escape for user text.
const escapeHtml = (value) => {
	const div = document.createElement('div');
	div.textContent = String(value);
	return div.innerHTML;
};
```

---

## Accessibility Baseline (Required)

- All interactive elements are reachable by keyboard.
- Visible focus (`:focus-visible`) is never removed without replacement.
- Buttons have clear names (text or `aria-label`).
- Modals:
	- Use `role="dialog"` and `aria-modal="true"`
	- Focus moves into modal on open; returns to trigger on close
	- Escape closes the modal

### Modal skeleton

```html
<div class="fixed inset-0 hidden" data-role="modal" aria-hidden="true">
	<!-- Backdrop -->
	<div class="absolute inset-0 bg-black/50" data-action="close-modal"></div>

	<!-- Dialog -->
	<div
		class="absolute left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2
					 rounded-xl bg-white p-4 shadow-xl dark:bg-zinc-900"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title">
		<div class="l-row l-row--between">
			<h2 id="modal-title" class="text-base font-semibold">Modal title</h2>
			<button type="button" data-action="close-modal" aria-label="Close">
				✕
			</button>
		</div>
		<div class="mt-3">
			<!-- content -->
		</div>
	</div>
</div>
```

---

## Responsive + Dark Mode Rules

- Design mobile-first: base styles for small screens, then add `sm:`/`md:` enhancements.
- Don’t hardcode colors in CSS unless they are derived from variables.
- Dark mode must remain readable (no low-contrast text, no invisible borders).

---

## Performance & Maintainability

- Avoid repeated DOM querying inside loops; cache selectors.
- Prefer `DocumentFragment` or `innerHTML` once per render, not per item.
- Destroy and recreate Chart.js instances when needed (avoid leaks).
- Keep CSS selectors shallow; avoid overly specific chains.

---

## Review Checklist (Use in PRs)

### Layout & styling
- Uses Flex/Grid intentionally (not mixed randomly).
- Tailwind utilities are readable and consistent (no duplicated/conflicting classes).
- Custom CSS is segmented: tokens → layout → components → utilities → overrides.

### JS behavior
- Uses `data-*` hooks and event delegation for dynamic lists.
- Clear separation between state update and rendering.
- User-provided text is escaped or inserted via `textContent`.

### A11y
- Keyboard navigation works.
- Visible focus exists on all interactive elements.
- Modal interactions follow baseline rules.

### QA (manual)
- Test in light + dark.
- Test at narrow width (mobile) and desktop.
- Verify empty states (no tasks, no time entries, no backups).

---

## Starter Template (Copy/Paste)

Use this section when creating a new UI piece.

### 1) Markup (semantic + hooks)

```html
<section class="l-grid l-grid--cards" aria-label="[Feature name]">
	<div class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
		<header class="l-row l-row--between">
			<h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">[Title]</h3>
			<button type="button" data-action="[action]" class="text-sm underline">[Action]</button>
		</header>
		<div class="mt-3" data-role="[feature-body]"></div>
	</div>
</section>
```

### 2) CSS (component shell)

```css
/* ========== Components: [Feature] ========== */

.feature {
	/* Keep this as the structural shell; prefer Tailwind for colors/spacing if local */
	display: grid;
	gap: 0.75rem;
}
```

### 3) JS (events + render)

```js
// ========== [Feature] ==========

const setupFeature = () => {
	const root = document.querySelector('[data-role="[feature-body]"]');
	if (!root) return;

	// Render once on init
	renderFeature(root);

	// Optional events
	root.addEventListener('click', (event) => {
		const actionEl = event.target.closest('[data-action]');
		if (!actionEl) return;
		// Handle actions
	});
};

const renderFeature = (root) => {
	// Keep it deterministic: compute UI from state, then update DOM.
	root.innerHTML = '<p class="text-sm text-zinc-600 dark:text-zinc-300">[Empty state]</p>';
};
```

