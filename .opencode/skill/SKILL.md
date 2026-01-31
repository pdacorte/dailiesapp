# Front-end Designer Skill Guide

Purpose: A concise, practical handbook for front-end designers contributing to this repo. Focus: Tailwind + vanilla CSS + vanilla JS, accessible patterns, Chart.js usage, and Google Drive sync UX.

--

## Quick Links
- Repo home: [AGENTS.md](AGENTS.md)
- Main app: [index.html](index.html)
- App logic: [app.js](app.js)
- Styles: [styles.css](styles.css)
- Tailwind config: [tailwind.config.js](tailwind.config.js)
- Google Drive sync: [google-drive.js](google-drive.js)
- Test pages: [tests/](tests/)

--

## 1. Goals & Constraints
- Offline-first UI: primary persistence is IndexedDB; UI must work without network.
- Small bundle: no frameworks — use vanilla JS and selective libraries (Chart.js via CDN).
- Tailwind-driven layout with small, focused custom CSS in `styles.css` for tokens and complex states.

## 2. Tools & Local Workflow
- Tailwind v4 configured in `tailwind.config.js`.
- Dev commands (see package.json / AGENTS.md):

```bash
npm install
npm run dev     # watch / build Tailwind during development
npm run build   # production CSS
```

Designer tasks that change styles should run the dev build locally before visual QA.

## 3. Design Tokens & Theming
- Primary tokens live in `styles.css` as CSS variables (colors, radii, spacing). Prefer using these tokens when adding custom CSS.
- Dark mode: class-based (`dark` on `document.documentElement` or root container). Use Tailwind `dark:` utilities for variants and rely on variables for non-utility CSS.
- Font and base sizing are configured in `tailwind.config.js` — prefer Tailwind tokens for spacing and type scale.

Guidance:
- When adding a new color/token, add it to `tailwind.config.js` and mirror a CSS variable in `styles.css` for non-utility components.

## 4. Markup & Tailwind Conventions
- Keep markup semantic: use `<main>`, `<aside>`, `<header>`, `<section>`.
- Prefer Tailwind utilities for layout/spacing. Add custom CSS only for:
	- complex animations
	- focus/active outlines that must meet a11y contrast
	- cross-browser fixes
- Avoid long inline class lists by extracting small component classes (if reused) in `styles.css` or adding small tokens to `tailwind.config.js`.

Example guidance (no full snippet):
- Use `flex items-center gap-2` for icon + label rows. (See `#sidebar` in [index.html](index.html)).
- For badges, prefer Tailwind backgrounds + `rounded-full px-2`.

## 5. JavaScript Patterns
- Use ES6 modules / arrow functions / `const` and `let`.
- Small DOM-updating functions are preferred over large re-renders: e.g., `updateOngoingTasks()`, `updateCharts()` exist in `app.js`.
- Timer and drag handlers are in `app.js`: keep side-effects isolated, avoid global mutable state when possible.
- IndexedDB operations are batched for imports/exports; follow the existing helper patterns to avoid transaction mistakes.

Do: try/catch around async DB calls, log via `console.error()` and show friendly user notifications via existing `showNotification()` helper.

## 6. Component Catalog (patterns + copy-ready snippets)
Below are concise, reusable patterns. Adapt classes to match design tokens.

- Task item (structure):

```html
<li class="task-item flex items-center justify-between p-2 rounded"> 
	<div class="left flex items-center gap-2"> 
		<input type="checkbox" aria-label="Complete task"> 
		<span class="title">Task title</span>
	</div>
	<div class="actions flex items-center gap-2"> 
		<button class="btn-delete" aria-label="Delete task">✕</button>
	</div>
</li>
```

- Add task form pattern: small input + submit, keep validation synchronous and minimal; hook into existing `#add-task-form` in `index.html`.

- Timer control pattern: single button that toggles classes and `aria-pressed`, update label text to show running state (see `#timer-control-btn`).

## 7. Charts & Performance
- Charts use Chart.js. Rules:
	- Destroy existing Chart instances before recreating to prevent leaks.
	- Lazy-create charts when their container becomes visible.
	- For large datasets, downsample or show summaries in the UI to avoid rendering large arrays.

Performance tips:
- Batch DOM updates and IndexedDB writes (existing import code batches items).
- Debounce frequent inputs that trigger storage or heavy recalculations.

## 8. Accessibility Checklist (Designer-focused)
- All interactive controls must have accessible names (use `aria-label` or visible text).
- Modals: set `role="dialog"` and `aria-modal="true"`, trap focus, restore focus to the trigger on close.
- Keyboard: ensure task items and timer controls are reachable and operable by keyboard.
- Color contrast: check dark mode contrasts for token changes.

## 9. Google Drive Sync UX
- Provide clear auth states: signed-out, loading, permission denied, quota errors.
- In the drive modal show progress states for upload/download and a fallback to clipboard/localStorage backup if Drive fails.
- For error states provide a retry and a re-authenticate action (see `google-drive.js`).

## 10. Code Review Checklist (Design PRs)
- Visual: check spacing, alignment, and responsive behavior across breakpoints.
- CSS: prefer Tailwind utilities; new CSS must be justified and tokenized.
- Accessibility: aria labels, keyboard, focus management, and contrast.
- JS: small, focused functions; no silent failures; DB errors surface to user.
- Tests: verify with the manual pages in `tests/` (export/import, google-drive callbacks).

## 11. Quick Snippets (Copy-paste)
- Minimal button with focus-visible style:

```html
<button class="btn px-3 py-1 rounded bg-primary text-white focus:outline-none focus:ring-2">Do</button>
```

- Modal skeleton (structure only):

```html
<div class="modal fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
	<div class="modal-panel bg-white dark:bg-slate-800 rounded p-4">...content...</div>
</div>
```

## 12. How to Test Locally
1. Run Tailwind dev build:

```bash
npm run dev
```

2. Open `index.html` in a browser (serve via simple HTTP server or open file). Use `tests/test-export.html` and `tests/test-google-drive.html` to exercise export/import and Drive flows.

## 13. Where to Find Examples
- Task & timer interactions: [index.html](index.html), [app.js](app.js)
- Styles/tokens: [styles.css](styles.css), [tailwind.config.js](tailwind.config.js)
- Google Drive & modals: [google-drive.js](google-drive.js), tests in [tests/](tests/)

--

If you want, I can also extract a small `examples/` folder with ready-to-run HTML snippets for designers; tell me which components to extract first.

