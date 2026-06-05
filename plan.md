# Plan: Daily Task rework + mobile optimization

Decisions (confirmed with user):
- Rename `Non-Negotiable` -> new canonical type `Daily`; migrate old data; accept both on import.
- Completed daily task: create successor dated **tomorrow**, hide it until that day arrives (date-gate the ongoing list).
- "Streak for Dailies": a day counts only if it had >=1 daily task AND all daily instances for that date are complete; a day with zero daily tasks stops the dailies streak.
- Mobile = `<= 640px` (matches existing breakpoint).
- Mobile quote collapse state persisted in localStorage.
- Mobile sidebar: fully slides off-screen when collapsed; floating hamburger reopens it as an overlay drawer.

---

## A. Data model: rename `Non-Negotiable` -> `Daily`
1. New canonical type `"Daily"` for new tasks.
2. One-time migration after DB open: rewrite stored `type === "Non-Negotiable"` -> `"Daily"`, guarded by settings flag `dailyTypeMigrated`.
3. Import (app.js ~3863): accept `['Goal','Non-Negotiable','Daily']`; normalize `Non-Negotiable` -> `Daily`.
4. completeTask logic (app.js ~1490/1499): `isNonNegotiable` -> `isDaily` (`=== "Daily"`); successor `type:"Daily"`.
5. Badge: add `.task-type-badge.daily` (amber, incl. dark + tokyo-night); JS emits `daily` class. Keep `.non-negotiable` rules as fallback.

## B. UI label changes (all versions)
6. index.html `#task-type` option + `#default-task-type` option -> value `"Daily"`, label `"Daily Task"`.
7. Help text -> "Daily Task".
8. `typeLabel(type)` helper: Goal->"Goal", Daily->"Daily"; use where badge prints `${task.type}`.

## C. Completed daily tasks disappear until next day (all versions)
9. Successor `startDate = tomorrow` (local tz) in buildTaskCompletionMutation.
10. Ongoing filter date-gate: `!task.status && (!task.startDate || task.startDate <= getTodayDate())`. Apply to ALL active-task reads (ongoing list, focus zone, sortOrder calc, optimistic completion).
11. Verify optimistic completion path does not re-insert future successor into today's DOM.

## D. Settings: streak mode toggle (all versions)
12. Setting `streakMode`: `"goals"` (default) | `"dailies"`.
13. Settings UI control "Streak for Goals" (default) / "Streak for Dailies"; persist + load.
14. Rewrite `updateStreak` to branch on `streakMode`:
    - goals: current behavior (any completion that date).
    - dailies: day counts only if >=1 daily task for date and all complete; zero daily tasks stops streak.

## E. Auto-capitalize first letter in task bar (all versions)
15. `input` listener on `#task-input`: uppercase first char, preserve caret.

## F. Mobile-only (<= 640px)
16. Collapsible quote: toggle button (mobile-only), `toggleQuoteCollapse()`, persist `quoteCollapsedMobile` in localStorage.
17. Remove pill on mobile; color the task item itself per type (indigo=Goal, amber=Daily) via data attr/class; add bottom legend (mobile-only).
18. Sidebar drawer: collapsed -> translateX(-100%)/width:0 off-screen; floating hamburger reopens as overlay drawer with backdrop; default collapsed on mobile first load.

## G. Build & verify
19. `npm run build` if new utility classes introduced.
20. Manual checks desktop + mobile (<=640px): capitalize, daily disappear/reappear, streak modes, mobile quote/sidebar/pills/legend, import migration.
21. Update AGENTS.md terminology + streakMode/mobile docs (optional).

## Files
- index.html, app.js, custom.css, AGENTS.md (docs)

## Risks
- Ongoing date-gate must be applied to every `!task.status` active read.
- Dailies streak with zero daily tasks stops streak (per user).
