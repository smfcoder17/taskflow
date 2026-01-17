---
title: 'Reports Page with Advanced Analytics & Insights'
slug: 'reports-page-advanced-analytics'
created: '2026-01-10'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Angular 21', 'Signals', 'Supabase', 'Tailwind CSS v4', 'TypeScript', 'Vitest']
files_to_modify:
  [
    'src/app/pages/reports-page/reports-page.ts',
    'src/app/pages/reports-page/reports-page.html',
    'src/app/pages/reports-page/reports-page.css',
    'src/app/services/supabase-service.ts',
    'src/app/models/models.ts',
  ]
code_patterns:
  [
    'Standalone components',
    'Signal-based state',
    'Single service pattern',
    'Computed signals for derived state',
    'Snake_case to camelCase mapping in service',
  ]
test_patterns:
  [
    'Vitest with vi.mock()',
    'TestBed.configureTestingModule({ imports: [Component] })',
    'Mock Supabase client',
    'await fixture.whenStable()',
  ]
---

# Tech-Spec: Reports Page with Advanced Analytics & Insights

**Created:** 2026-01-10

## Overview

### Problem Statement

Users need a comprehensive view of their habit performance with behavioral insights, temporal comparisons, and deep analytics to understand their patterns and progress. Currently, the app shows daily/weekly views but lacks aggregated insights, trends analysis, and actionable behavioral patterns.

### Solution

Create a full-featured Reports Page displaying:

- Overview statistics (total habits, global completion rate, active streaks)
- GitHub-style heatmap calendar for visual pattern recognition
- Habit-specific breakdown with individual performance metrics
- Behavioral insights panel (best day of week, consistency score, time patterns)
- Week-over-week comparison (last week vs current week)
- Default 30-day view with date range selector

The page leverages existing `HabitLog` data (including `completed_at` timestamps) to compute advanced metrics like consistency scores, day-of-week performance, and temporal trends.

### Scope

**In Scope:**

- Reports page component structure with 4 child components (overview-stats, calendar-heatmap, habit-breakdown, insights-panel)
- New analytics methods in SupabaseService for:
  - Completion rate calculations (overall and per-habit)
  - Consistency score algorithm with gap penalties
  - Week-over-week comparison logic
  - Day-of-week performance analysis
  - Time-of-day pattern aggregation (using existing `completed_at`)
- 30-day default date range with basic date range selector (7d, 30d, 90d options)
- GitHub-style heatmap calendar visualization (CSS-based)
- Responsive design following existing Taskflow patterns

**Out of Scope:**

- Advanced date picker with custom arbitrary range selection
- Export/PDF generation of reports
- Custom goal setting or recommendations based on insights
- Automated notifications triggered by insights
- Comparative analytics between multiple habits
- Historical data beyond what's available in habit_logs

## Context for Development

### Codebase Patterns

**Component Architecture:**

- All components use `standalone: true` with direct imports in `imports: []`
- State management via Angular Signals: `signal()` for mutable state, `computed()` for derived state, `input<T>()` for component inputs
- Service injection via `inject()` function, not constructor DI
- Lifecycle: Data loading in `ngOnInit()` or constructor with async methods
- Pattern from dashboard: `habits = signal<HabitWithStats[]>([])` then `this.habits.set(data)`
- Child components: Use signal-based inputs `data = input<Type>()` instead of decorator `@Input()`

**Service Layer (SupabaseService):**

- Single service handles ALL backend operations (no additional services)
- Methods return `{ data, error }` objects following Supabase pattern
- Snake_case (DB) ↔ camelCase (TS) conversion via private `map*FromDB()` and `map*ToDB()` methods
- User authentication check: `const user = this.session()?.user; if (!user) throw Error`
- Existing analytics methods: `getHabitLogsForDateRange(start, end)`, `getTopStreaks(limit)`, `calculateCurrentStreak(habitId)`

**Data Models (models.ts):**

- Interfaces: `Habit`, `HabitLog`, `HabitWithStats`, `StreakInfo`, `DailyProgress`, `WeeklyProgress`
- `HabitLog` already has: `logDate: string`, `completed: boolean`, `completedAt?: string` (timestamp)
- `HabitWithStats` extends `Habit` with computed fields: `currentStreak`, `longestStreak`, `completedToday`, etc.

**Styling Patterns:**

- Tailwind CSS v4 with custom properties: `bg-background-dark`, `bg-card-dark`, `text-text-dark-primary`
- Theme colors via CSS variables: `--color-primary`, `--color-background-dark`, `--color-card-dark`
- Icons via Material Symbols: `<span class="material-symbols-outlined">icon_name</span>`
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints
- Card pattern: `bg-card-dark border border-border-dark-strong rounded-2xl p-6 shadow-lg`

**Testing Pattern:**

- Vitest with `describe()`, `it()`, `expect()`, `beforeEach()`
- TestBed: `await TestBed.configureTestingModule({ imports: [ComponentName] }).compileComponents()`
- Mock Supabase: `vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(...) }))`
- Router mock: `{ provide: Router, useValue: { navigate: vi.fn() } }`
- Async stability: `await fixture.whenStable()` before assertions

### Files to Reference

| File                                             | Purpose                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `src/app/pages/reports-page/reports-page.ts`     | Main reports page - currently empty, needs full implementation             |
| `src/app/pages/reports-page/reports-page.html`   | Reports template - currently placeholder                                   |
| `src/app/services/supabase-service.ts`           | Add new analytics methods here (lines 400-550 area for habit log queries)  |
| `src/app/models/models.ts`                       | Add new analytics interfaces (after line 230)                              |
| `src/app/pages/dashboard-page/dashboard-page.ts` | Reference for: loading patterns, computed signals, filtering (lines 1-100) |
| `src/app/pages/calendar-page/calendar-page.ts`   | Reference for: date range handling, log aggregation                        |
| `src/app/models/utilities.ts`                    | Date utilities: `isSameDay()`, `getDayOfWeek()`, `weekDays` constant       |
| `src/styles.css`                                 | Theme variables and global styles                                          |
| `src/app/app.routes.ts`                          | Reports route already exists at line 16 with authGuard                     |

### Technical Decisions

**1. Component Structure - Parent/Child Pattern:**

- Parent: `reports-page.ts` loads ALL data once in `ngOnInit()`
- Children: Pure presentation components receiving data via signal-based `input<T>()` from `@angular/core`
- No service injection in children - keeps them testable and reusable
- Data flow: Parent signals → computed signals → child signal inputs

**2. Analytics Methods Location:**

- ALL new analytics logic goes in `SupabaseService` (single service pattern)
- Method naming: `getAnalytics*()` for data fetching, `calculate*()` for computations
- Place after existing habit methods (around line 500-600 in supabase-service.ts)

**3. Date Range State Management:**

```typescript
// In reports-page.ts
selectedRange = signal<'7d' | '30d' | '90d'>('30d');
dateRange = computed(() => {
  const end = new Date();
  const start = new Date();
  const days = this.selectedRange() === '7d' ? 7 : this.selectedRange() === '30d' ? 30 : 90;
  start.setDate(start.getDate() - days);
  return { start, end };
});
```

**4. Consistency Score Algorithm (in service):**

```typescript
// Formula: (completions / elapsed_days) * 100 - gap_penalty
// gap_penalty = sum of (gap_length - 1) * penalty_weight for gaps > 1 day
// penalty_weight = 2 (configurable)
async calculateConsistencyScore(habitId: string, startDate: string, endDate: string): Promise<number>
```

**5. New TypeScript Interfaces (add to models.ts):**

```typescript
export interface HabitAnalytics {
  habitId: string;
  habitTitle: string;
  icon: string;
  completionRate: number; // percentage
  consistencyScore: number; // percentage with gap penalty
  totalCompletions: number;
  bestDayOfWeek: DayOfWeek;
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface WeekComparison {
  currentWeek: { completions: number; rate: number; startDate: string; endDate: string };
  lastWeek: { completions: number; rate: number; startDate: string; endDate: string };
  change: number; // percentage change
}

export interface BehavioralInsights {
  bestDayOfWeek: { day: DayOfWeek; completionRate: number };
  bestTimeOfDay: { period: string; completionRate: number };
  averageConsistencyScore: number;
  totalActiveHabits: number;
}

export interface HeatmapDay {
  date: string;
  completionRate: number; // 0-100
  completedCount: number;
  totalScheduled: number;
}
```

**6. Heatmap Implementation:**

- Pure CSS Grid: `display: grid; grid-template-columns: repeat(7, 1fr);`
- Cell color intensity based on completion rate: 0% = transparent, 100% = full primary color
- Use Tailwind opacity utilities or inline styles with `rgba()`
- Tooltip on hover showing date and completion count

### Technical Decisions

1. **Date Range Management:** Use component signal `selectedRange = signal<'7d' | '30d' | '90d'>('30d')` with computed signal for actual date boundaries. Keep logic in component, not service.

2. **Consistency Score Algorithm:**

   ```
   consistencyScore = (completions / elapsed_days) * 100 - (gap_penalty)
   gap_penalty = sum of (gap_length - 1) for each gap > 1 day
   ```

   Example: 21 completions in 30 days with 3 gaps of 2-3 days = 70% base - ~15% penalty = ~55% consistency

3. **Heatmap Visualization:** Pure CSS grid approach (no D3.js). Grid of day cells with opacity/color intensity based on completion rate for that day. Similar to GitHub contribution graph.

4. **Week Comparison:**

   - "Last week" = 7 days before current week
   - "Current week" = most recent 7 days
   - Compare: total completions, completion rate, active streak changes

5. **Component Communication:** Parent (reports-page) loads all data once, passes to child components via inputs. Children are presentation-only, no service injection.

6. **Time-of-Day Insights:** Extract hour from `completed_at` timestamp. Group completions by hour buckets (morning 6-12, afternoon 12-18, evening 18-24, night 0-6). Display best performing time bucket.

## Implementation Plan

### Tasks

#### Phase 1: Data Models & Service Layer

- [x] Task 1.1: Add new analytics interfaces to models

  - File: `src/app/models/models.ts`
  - Action: Add `HabitAnalytics`, `WeekComparison`, `BehavioralInsights`, `HeatmapDay` interfaces after line 230
  - Notes: Follow existing interface patterns, use proper TypeScript types

- [x] Task 1.2: Implement getHabitLogsWithTimestamps method

  - File: `src/app/services/supabase-service.ts`
  - Action: Create method to fetch logs with `completed_at` timestamps for date range (around line 500)
  - Notes: Include mapping for `completed_at` field, return `{ data, error }` format

- [x] Task 1.3: Implement calculateConsistencyScore method

  - File: `src/app/services/supabase-service.ts`
  - Action: Create method with gap penalty algorithm (formula: `(completions / elapsed_days) * 100 - gap_penalty`)
  - Notes: Gap penalty = sum of (gap_length - 1) \* 2 for each gap > 1 day

- [x] Task 1.4: Implement getHabitAnalytics method

  - File: `src/app/services/supabase-service.ts`
  - Action: Aggregate per-habit analytics (completion rate, best day/time, consistency)
  - Notes: Use `getDayOfWeek()` from utilities, extract hour from `completed_at` for time analysis

- [x] Task 1.5: Implement getWeekComparison method

  - File: `src/app/services/supabase-service.ts`
  - Action: Compare current week (last 7 days) vs previous 7 days, return completion counts and rates
  - Notes: Calculate percentage change between weeks

- [x] Task 1.6: Implement getBehavioralInsights method

  - File: `src/app/services/supabase-service.ts`
  - Action: Aggregate insights across all habits (best day/time globally, avg consistency)
  - Notes: Call `getHabitAnalytics()` for each habit and aggregate results

- [x] Task 1.7: Implement getHeatmapData method
  - File: `src/app/services/supabase-service.ts`
  - Action: Generate array of `HeatmapDay` objects for date range with completion rates
  - Notes: For each day, calculate scheduled habits vs completed ratio

#### Phase 2: Parent Component

- [x] Task 2.1: Implement reports-page component logic

  - File: `src/app/pages/reports-page/reports-page.ts`
  - Action: Add signals for all data, date range logic, loading methods in `ngOnInit()`
  - Notes: Follow dashboard pattern - inject service, create signals, load data async

- [x] Task 2.2: Add computed signals for derived state

  - File: `src/app/pages/reports-page/reports-page.ts`
  - Action: Create `dateRange` computed signal based on `selectedRange`, format date strings
  - Notes: Use pattern from Technical Decisions section

- [x] Task 2.3: Implement date range selector logic
  - File: `src/app/pages/reports-page/reports-page.ts`
  - Action: Add method to change range ('7d', '30d', '90d'), reload data on change
  - Notes: Effect or manual call to reload when range changes

#### Phase 3: Child Components - Overview Stats

- [x] Task 3.1: Create overview-stats component structure

  - File: `src/app/pages/reports-page/components/overview-stats/overview-stats.ts`
  - Action: Create standalone component with signal-based `input<T>()` properties for stats data (import `input` from `@angular/core`)
  - Notes: No service injection, pure presentation component, use `totalHabits = input<number>()`, `completionRate = input<number>()`, etc.

- [x] Task 3.2: Create overview-stats template

  - File: `src/app/pages/reports-page/components/overview-stats/overview-stats.html`
  - Action: Display total habits, completion rate, active streaks in card layout
  - Notes: Use card pattern: `bg-card-dark border border-border-dark-strong rounded-2xl p-6`

- [x] Task 3.3: Style overview-stats component
  - File: `src/app/pages/reports-page/components/overview-stats/overview-stats.css`
  - Action: Add responsive grid layout for stat cards
  - Notes: Use Tailwind utilities, ensure mobile-first design

#### Phase 4: Child Components - Calendar Heatmap

- [x] Task 4.1: Create calendar-heatmap component structure

  - File: `src/app/pages/reports-page/components/calendar-heatmap/calendar-heatmap.ts`
  - Action: Create component with signal-based `heatmapData = input<HeatmapDay[]>()` (import `input` from `@angular/core`)
  - Notes: Compute grid layout (7 columns for days of week)

- [x] Task 4.2: Create calendar-heatmap template

  - File: `src/app/pages/reports-page/components/calendar-heatmap/calendar-heatmap.html`
  - Action: CSS grid layout with day cells, opacity based on completion rate
  - Notes: Add tooltips showing date and completion count on hover

- [x] Task 4.3: Style calendar-heatmap component
  - File: `src/app/pages/reports-page/components/calendar-heatmap/calendar-heatmap.css`
  - Action: Grid layout, color intensity logic (use `rgba()` with primary color), hover effects
  - Notes: 0% completion = transparent, 100% = full `--color-primary`

#### Phase 5: Child Components - Habit Breakdown

- [x] Task 5.1: Create habit-breakdown component structure

  - File: `src/app/pages/reports-page/components/habit-breakdown/habit-breakdown.ts`
  - Action: Create component with signal-based `habitAnalytics = input<HabitAnalytics[]>()` (import `input` from `@angular/core`)
  - Notes: Display list of habits with individual metrics

- [x] Task 5.2: Create habit-breakdown template

  - File: `src/app/pages/reports-page/components/habit-breakdown/habit-breakdown.html`
  - Action: List each habit with icon, title, completion rate, consistency score
  - Notes: Use `@for` loop, show visual progress bars for percentages

- [x] Task 5.3: Style habit-breakdown component
  - File: `src/app/pages/reports-page/components/habit-breakdown/habit-breakdown.css`
  - Action: Card layout with habit rows, progress bar styling
  - Notes: Use primary color for progress bars

#### Phase 6: Child Components - Insights Panel

- [x] Task 6.1: Create insights-panel component structure

  - File: `src/app/pages/reports-page/components/insights-panel/insights-panel.ts`
  - Action: Create component with signal-based `insights = input<BehavioralInsights>()` and `weekComparison = input<WeekComparison>()` (import `input` from `@angular/core`)
  - Notes: Display actionable insights and week comparison

- [x] Task 6.2: Create insights-panel template

  - File: `src/app/pages/reports-page/components/insights-panel/insights-panel.html`
  - Action: Show best day/time, consistency score, week-over-week comparison with change indicator
  - Notes: Use icons (arrow up/down) for week comparison change

- [x] Task 6.3: Style insights-panel component
  - File: `src/app/pages/reports-page/components/insights-panel/insights-panel.css`
  - Action: Card layout, highlight positive changes in green, negative in red
  - Notes: Use semantic colors for change indicators

#### Phase 7: Main Page Assembly

- [x] Task 7.1: Create reports-page template with child components

  - File: `src/app/pages/reports-page/reports-page.html`
  - Action: Assemble all child components with proper data binding, add date range selector
  - Notes: Pass signals as inputs using `[property]="signal()"` syntax

- [x] Task 7.2: Style reports-page layout

  - File: `src/app/pages/reports-page/reports-page.css`
  - Action: Create responsive grid layout for all sections
  - Notes: Stack on mobile, 2-column on tablet+, ensure proper spacing

- [x] Task 7.3: Add loading states
  - File: `src/app/pages/reports-page/reports-page.html`
  - Action: Add loading spinner/skeleton when data is being fetched
  - Notes: Use `@if (isLoading())` pattern from dashboard

#### Phase 8: Testing

- [x] Task 8.1: Write unit tests for service analytics methods

  - File: `src/app/services/supabase-service.spec.ts`
  - Action: Test all 7 new methods with mocked Supabase responses
  - Notes: Test consistency score with various gap scenarios (no gaps, small gaps, large gaps), edge cases (no completions, single completion)

- [x] Task 8.2: Write tests for reports-page component

  - File: `src/app/pages/reports-page/reports-page.spec.ts`
  - Action: Test component creation, data loading on init, date range changes triggering reload, loading states
  - Notes: Mock SupabaseService with all new methods, verify signals updated correctly, test error handling

- [x] Task 8.3: Write tests for overview-stats component

  - File: `src/app/pages/reports-page/components/overview-stats/overview-stats.spec.ts`
  - Action: Test rendering with valid stats, empty stats, edge values (0%, 100%)
  - Notes: Verify signal-based inputs work, test all stat displays (total habits, completion rate, streaks)

- [x] Task 8.4: Write tests for calendar-heatmap component

  - File: `src/app/pages/reports-page/components/calendar-heatmap/calendar-heatmap.spec.ts`
  - Action: Test heatmap rendering with various data (full range, partial data, empty), tooltip display
  - Notes: Test color intensity calculation, grid layout, hover states

- [x] Task 8.5: Write tests for habit-breakdown component

  - File: `src/app/pages/reports-page/components/habit-breakdown/habit-breakdown.spec.ts`
  - Action: Test rendering habit list with analytics, empty state, progress bars display
  - Notes: Verify each habit shows icon, title, completion rate, consistency score correctly

- [x] Task 8.6: Write tests for insights-panel component
  - File: `src/app/pages/reports-page/components/insights-panel/insights-panel.spec.ts`
  - Action: Test behavioral insights display, week comparison display, change indicators (up/down arrows)
  - Notes: Test positive/negative change styling, best day/time rendering, empty insights handling

### Acceptance Criteria

#### Core Functionality

- [x] AC 1: Given user navigates to /reports, when page loads with default 30-day range, then overview stats display total habits, global completion rate, and top 3 streaks
- [x] AC 2: Given user has habit logs in date range, when heatmap renders, then each day shows correct completion rate as color intensity (0% transparent, 100% full primary color)
- [x] AC 3: Given user hovers over heatmap day cell, when mouse enters, then tooltip displays date and "X/Y completed"
- [x] AC 4: Given user has completed habits, when habit breakdown section renders, then each habit shows icon, title, completion rate percentage, and consistency score
- [x] AC 5: Given user clicks date range selector (7d/30d/90d), when selection changes, then all data reloads for new date range
- [x] AC 6: Given user has logs with completed_at timestamps, when insights panel loads, then best day of week and best time of day display with percentages
- [x] AC 7: Given current week and last week data exists, when week comparison loads, then shows completion counts, rates, and percentage change with up/down indicator
- [x] AC 8: Given user has gaps in habit completion, when consistency score calculates, then score reflects gap penalties (formula: base% - gap_penalty)

#### Edge Cases

- [x] AC 9: Given user has no habits, when reports page loads, then displays empty state message "No habits tracked yet"
- [x] AC 10: Given user has no logs in selected date range, when page loads, then displays "No data for this period"
- [x] AC 11: Given service returns error, when loading data, then error is handled gracefully without crash
- [x] AC 12: Given mobile viewport, when page renders, then all sections stack vertically and remain readable

#### Data Accuracy

- [x] AC 13: Given habit has 21 completions in 30 days with no gaps, when consistency score calculates, then returns 70% (21/30 \* 100)
- [x] AC 14: Given habit has 21 completions with 3 gaps of 2 days each, when consistency score calculates, then returns approximately 67% (70% - 3% penalty)
- [x] AC 15: Given logs with completed_at timestamps, when time-of-day analysis runs, then correctly categorizes into morning/afternoon/evening/night buckets
- [x] AC 16: Given weekly frequency habit, when completion rate calculates, then only counts scheduled days in denominator

#### Integration

- [x] AC 17: Given reports route already exists with authGuard, when unauthenticated user tries to access, then redirects to login
- [x] AC 18: Given page uses SupabaseService, when data loads, then all methods return { data, error } format
- [x] AC 19: Given child components receive data via signal-based input<T>(), when parent data changes, then children re-render with updated values

## Additional Context

### Dependencies

**External:**

- No new external libraries needed (use existing Supabase, Angular, Tailwind)
- Relies on existing `habit_logs` table schema with `completed_at` column

**Internal:**

- Depends on `SupabaseService.getHabitLogsForDateRange()` (already exists)
- Depends on `SupabaseService.getTopStreaks()` (already exists)
- Depends on utilities from `models/utilities.ts`: `getDayOfWeek()`, `isSameDay()`
- Route already configured in `app.routes.ts` with `authGuard`

**Data Dependencies:**

- Requires user authentication session
- Requires habits to exist in database
- Optimal with at least 7-30 days of habit log history

### Testing Strategy

**Unit Tests (Service Layer):**

- Test each analytics method independently with mocked Supabase responses
- Test consistency score algorithm with various scenarios:
  - Perfect completion (no gaps)
  - Multiple small gaps (1-2 days)
  - Large gaps (5+ days)
  - Edge case: single completion
  - Edge case: no completions
- Test date range calculations for 7d, 30d, 90d
- Test time-of-day bucketing logic
- Test day-of-week aggregation

**Component Tests:**

- Test parent component (reports-page):
  - Verifies data loading on init
  - Verifies date range changes trigger reload
  - Verifies signals update correctly
  - Mock SupabaseService methods
- Test each child component:
  - Render with valid data
  - Render with empty data
  - Render with edge case values (0%, 100%, null)
  - Verify signal-based input<T>() binding works

**Integration Tests:**

- Manual testing of complete user flow:
  - Navigate to /reports
  - View all sections with real data
  - Change date ranges and verify updates
  - Test on mobile viewport
  - Test with various data scenarios (new user, power user, gaps in data)

### Notes

**High-Risk Items:**

- Consistency score algorithm complexity - ensure gap detection logic is accurate
- Heatmap rendering performance with large date ranges (90 days = ~90 cells)
- Time-of-day analysis requires parsing `completed_at` timestamps correctly
- Date range calculations must handle timezone differences properly

**Known Limitations:**

- Time-of-day insights are basic (4 buckets only) - not hour-by-hour breakdown
- Week comparison is fixed to last 7 vs current 7 days - no custom range selection
- No caching of analytics results - recalculates on every page load
- Heatmap uses simple CSS grid - may not scale well beyond 90 days

**Future Considerations (Out of Scope but Noted):**

- Add caching/memoization for expensive analytics calculations
- Implement custom date range picker for arbitrary comparisons
- Add export to PDF/CSV functionality
- Add trend line charts for completion rates over time
- Implement goal setting based on analytics insights
- Add notifications when consistency drops below threshold
- Compare multiple habits side-by-side
