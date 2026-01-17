# Taskflow Dashboard (Home) — UX Audit + Redesign Plan (Dashboard v2)

**Owner:** Sally (UX Designer)  
**Date:** January 12, 2026  
**Scope:** Dashboard is the primary daily workspace (highest traffic & time-on-page).  
**Constraint:** Keep existing Taskflow style guide (dark theme, Tailwind, material icons). No code changes in this deliverable.

---

## 1) What’s working (keep it)

- **Daily Progress card** is a strong “north star” metric (simple, motivating).
- **Today list is action-first**: the checkbox interaction is the right primary action.
- **Filters + sort** are thoughtfully built and consistent with the app UI patterns.
- **Weekly progress mini-grid** gives at-a-glance week context.
- **Top streaks** adds motivation and recognition.

---

## 2) What’s missing / what’s wrong (current UX gaps)

### A. Missing: “next best action” + prioritization

Right now, the Dashboard lists everything equally. Most users need:

- “What should I do _now_?”
- “What’s at risk?” (streak risk / overdue)
- “What’s the minimum to feel successful today?”

### B. Weak feedback loop after checking a habit

The toggle triggers network + reload. Without optimistic UI + micro-celebration, the action can feel delayed and less rewarding.

### C. The right rail has low relevance & copy mismatch

The **Productivity Card** copy refers to “tasks” (“high priority tasks”), and the CTA has no navigation. This breaks trust and is wasted prime real estate.

### D. Week widget is ambiguous

When status is “partial”, showing `+{{ day.completed }}` is unclear (completed _what_?). It needs ratio/context (`3/5`) and/or tooltip.

### E. Limited “drill-down” from habit rows

Common needs aren’t supported directly:

- add/view note
- edit habit
- see history (last 7 days)
- skip today (without breaking streak logic)
- understand scheduling (“Why is this habit due today?”)

### F. Localization consistency

Dashboard uses English for “TODAY/YESTERDAY/TOMORROW” + `en-US` formatting. If the product is FR-first, this is a perception hit.

### G. Cognitive load on the busiest screen

Filter + sort are powerful, but for “home” we should reduce decision burden with smart defaults and progressive disclosure.

---

## 3) Design goals (what success looks like)

1. **Actionable**: user can complete today’s must-dos in <30s.
2. **Motivating**: completion feels rewarding; progress is celebrated.
3. **Guiding**: the UI suggests priorities and what’s at risk.
4. **Calm**: information hierarchy reduces cognitive load.
5. **Fast**: perceived performance (optimistic UI, skeletons).
6. **Accessible**: keyboard navigable, clear focus, contrast.

---

## 4) Proposed information architecture (Dashboard v2)

### Desktop (primary)

**Header (sticky)**

- Title: “Today” (or “My Habits”) + date
- Quick actions: `Add habit`, `Plan week` (future), `Go to calendar`

**Hero: “Today Snapshot”**

- Today completion %
- “X of Y habits done”
- Streak status (overall) and/or “at risk” count
- Micro-copy guidance (one line): “2 habits left to hit 80% today”

**Focus section (NEW)**

- 2–3 cards:
  - “At risk” habit(s)
  - “High impact” habit (user-designated or algorithmic)
  - “Quick win” habit (fast to complete)

**Main list: Today’s habits**

- Grouped:
  - “To do” (pending)
  - “Done” (completed collapsed)
- Each row supports a secondary action menu (…)

**Right rail (replace Productivity Card)**

- Week widget (clarified)
- “Insights for you” (one or two actionable insights)
- Streaks OR “Consistency tips” (rotate)

### Mobile

- Sticky header
- Hero snapshot
- Focus cards (horizontal scroll)
- Today list (full width)
- Week widget (compact)

---

## 5) Key UX patterns to introduce

### A. Smart defaults

- Default sort: **Pending first**, then by “at risk” (if available), then name.
- Default filter: `all` but visually highlight “To do” group.

### B. Optimistic toggle + micro-celebration

On check:

- update UI instantly
- show toast: “Nice — +1 completed”
- if 100% day achieved: “Perfect day!” badge + small confetti (optional)

### C. Habit row quick actions (…)

Minimal but high-value:

- `Add note`
- `Edit`
- `View history`
- `Skip today` (if supported)

### D. Progressive disclosure

- Completed habits collapse into a compact section: “Done (5)”
- Advanced filters remain accessible but not visually dominant.

---

## 6) Content & copy upgrades (keep tone consistent)

### Replace “Feeling productive?” card

Current: tasks-themed, inaccurate.

Suggested replacement options:

1. **“Idea of the day”**

   - Short suggestion based on category gaps: “Try a 5-min mindfulness habit.”
   - CTA: `Explore habits` (links to templates or new habit page)

2. **“Keep your streak alive”**

   - “2 habits are at risk today.”
   - CTA: `Focus now`

3. **“Plan tomorrow”** (future)
   - CTA: `Preview tomorrow`

### Week widget labeling

- Replace `+3` with `3/5` and tooltip “Completed / Scheduled”.

---

## 7) Visual hierarchy & layout rules

- Dashboard must feel **lighter** than Reports:
  - fewer borders, more spacing
  - one clear hero + one clear list
- Emphasize **primary action** (toggle) but allow a full-row click target:
  - clicking row opens details or expands actions

---

## 8) States (must be designed)

1. **Loading**

- Skeletons for hero + list rows (avoid spinner-only).

2. **No habits yet**

- Offer starter templates (3 presets): “Hydration”, “Reading”, “Walk 10 min”.

3. **No habits scheduled for that day**

- CTA: `Go to calendar` + `Adjust schedules`.

4. **Filters yield zero results**

- Keep “Clear filters” but add hint: “Try removing category filter.”

5. **Offline / error**

- Non-blocking banner: “We’ll sync when you’re back online.”

---

## 9) Accessibility (home page must be best-in-class)

- Make habit rows keyboard operable:
  - `Space` toggles checkbox
  - `Enter` opens details
- Visible focus rings on all interactive elements
- Provide text alternatives for emoji/status
- Week widget: each day button should have aria-label: “Mon, 3 of 5 completed”

---

## 10) Implementation guidance (for dev later)

### Minimal new UI components (recommended)

- `TodaySnapshotCard` (new, small)
- `FocusHabitsCarousel` (new, optional)
- `HabitRowActionsMenu` (new)

### Reuse existing

- toast component (already exists in app/components)
- confirmation modal for destructive actions

### Data needed (no backend change required to start)

- You can infer “Focus” from current data:
  - pending habits first
  - streakEnabled + low streak or recently missed (if available)

---

## 11) Prioritized backlog

### Quick wins (1 sprint)

- Fix right-rail card copy + CTA wiring
- Change week partial label from `+X` to `X/Y`
- Add optimistic toggle + toast
- Group list: To do / Done

### Sprint 2

- Focus habits section
- Habit row actions menu (notes/edit/history)
- Better empty state templates

### Sprint 3+

- “At risk” detection based on streak decay rules
- Weekly planning mini-flow

---

## Deliverables in this package

- This document (audit + redesign plan)
- Wireframe: `wireframe-dashboard-v2.excalidraw`
