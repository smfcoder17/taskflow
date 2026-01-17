# 📊 Taskflow Reports Page - Complete UX Redesign
## "Your Habit Story" - Sprint 1: Timeline & Narrative Structure

**Design Owner:** Sally (UX Designer)  
**Date:** January 11, 2026  
**Status:** Design & Specifications Complete ✓  
**Next:** Dev Implementation

---

## Executive Summary

Transform the Reports page from a **data dashboard** into a **narrative experience** that tells users the story of their habit journey. This redesign focuses on making analytics motivating, discoverable, and actionable through a timeline-first approach combined with strategic information hierarchy.

### Key Metrics
- **Current Pain Points:** 3 (scattered insights, temporal blindness, lack of narrative)
- **UX Improvements:** +7 (timeline, hero stats, better hierarchy, responsive, accessibility, animations, mobile-first)
- **Performance Impact:** Low impact - same data endpoints
- **Complexity:** Medium (new components, layout restructuring, animation framework)

---

## Part 1: Current State Analysis

### ✅ Current Strengths
1. **Activity Heatmap** - Excellent visual for daily patterns
2. **Habit Breakdown** - Clear per-habit analytics with progress bars
3. **Overview Stats** - Key metrics immediately visible
4. **Responsive Layout** - Works on desktop & mobile (grid-based)
5. **Consistent Styling** - Follows app theme (dark mode, Tailwind)
6. **Real Data** - Connected to Supabase analytics API

### ❌ Current Gaps (UX)
1. **Temporal Awareness:** Only preset ranges (7d/30d/90d) - no custom date picking
2. **Narrative Missing:** Data shows WHAT but not WHY or the STORY
3. **Insights Hidden:** Behavioral insights relegated to side panel
4. **No Timeline:** Can't see progression over the selected period
5. **Passive View:** No drill-down, no interactions beyond time range
6. **Mobile Issues:** 3-column layout breaks on phones, insights disappear
7. **No Motivation:** Missing achievement/milestone markers that inspire
8. **Comparison Missing:** Can't relate habit performance to each other

---

## Part 2: Design Vision - "Your Habit Story"

### Philosophy
Users don't want **reports**; they want **proof of progress**. The redesign transforms raw analytics into a compelling narrative that:
- **Celebrates wins** (streaks, milestones, improvements)
- **Reveals patterns** (best days/times, consistency trends)
- **Inspires action** (personalized recommendations, next steps)
- **Tells the story** (how your habits evolved over the selected period)

### Core Principles
1. **Timeline First** - Time-based view is the hero, not hidden
2. **Progressive Disclosure** - Details revealed on interaction
3. **Mobile-First Structure** - Stack vertically, enhance on desktop
4. **Color as Signal** - Status/performance indicated through color
5. **Micro-Interactions** - Subtle animations guide user attention
6. **Accessibility** - WCAG 2.1 AA compliant, keyboard navigable

---

## Part 3: New Information Architecture

### Layout Structure (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│  REPORTS & ANALYTICS                                             │
│  🎯 Your Habit Story for January 1-11, 2026                     │
│  [Custom Date Picker] | [View: Timeline/Heatmap/Table]          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ╔════════════════════════════════════════════════════════════╗  │
│  ║ 📈 PROGRESS SNAPSHOT                                       ║  │
│  ║ Total Habits: 5 | Completion Rate: 72% | Week vs Last: +8% ║  │
│  ║ Longest Streak: 12 days (Reading) | Status: 🔥 On Fire! ║  │
│  ╚════════════════════════════════════════════════════════════╝  │
│                                                                   │
│  ┌────────────────────────────────────┐ ┌──────────────────────┐ │
│  │ 📊 TIMELINE VIEW                   │ │ 🔥 ACTIVITY HEATMAP  │ │
│  │ (NEW - Primary Analytics)          │ │ (Daily performance)  │ │
│  │                                    │ │                      │ │
│  │ 90%  ▁▂▃▄▅▆▇█ Completion Rate     │ │ [Heatmap grid]       │ │
│  │ 85%  └──────┬──────┘               │ │ Less ◻◻▓▓▓░More      │ │
│  │           Jan 6                    │ │                      │ │
│  │                                    │ │ 📌 Milestone markers │ │
│  │ ✓ Jan 8 - Completed all habits    │ │ 🎯 Perfect weeks     │ │
│  │ 🔥 Jan 4-7 - 4-day streak         │ │                      │ │
│  │ 📉 Jan 3 - Slight dip              │ │                      │ │
│  └────────────────────────────────────┘ └──────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 📋 HABIT PERFORMANCE BREAKDOWN                            │   │
│  │ [Sortable: Completion % | Consistency | Best Day/Time]   │   │
│  │                                                           │   │
│  │ ┌─ Morning Routine          72% | 68% consistency        │   │
│  │ │  ├─ Best on: Monday       └────────█████────┘          │   │
│  │ │  └─ Peak time: 6-8 AM                                  │   │
│  │ │                                                         │   │
│  │ ┌─ Reading                  95% | 92% consistency        │   │
│  │ │  ├─ Best on: Wednesday    └────────████████┘           │   │
│  │ │  └─ Peak time: 8-9 PM     🔥 12-day streak             │   │
│  │ │                                                         │   │
│  │ └─ [5 more habits...] [Load More]                         │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐  │
│  │ 💡 KEY INSIGHTS       │  │ 📅 WEEKLY COMPARISON            │  │
│  │ • Best Day: Monday    │  │ This Week: 72% (18/25)         │  │
│  │ • Peak Time: 6-8 AM   │  │ Last Week: 65% (16/25)         │  │
│  │ • Avg Consistency: 81%│  │ Change: +8% ↗ (Keep it up!) │  │
│  │ • Status: 🔥 On Fire! │  │                                 │  │
│  └──────────────────────┘  └─────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Responsive Stacking)

```
┌─────────────────────────────┐
│ REPORTS & ANALYTICS         │ [Header - sticky]
│ Jan 1-11, 2026          │
│ [📅 Custom Date]        │
├─────────────────────────────┤
│ 📈 PROGRESS SNAPSHOT       │ [Hero card with key metrics]
│ 5 habits | 72% | +8% week  │
│ 🔥 12 streaks             │
├─────────────────────────────┤
│ 📊 TIMELINE VIEW            │ [Horizontal scroll on mobile]
│ ┌─────────────────────────┐ │
│ │ Chart (scroll →)        │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 🔥 ACTIVITY HEATMAP         │ [Smaller, grid-responsive]
│ [Compact heatmap]           │
├─────────────────────────────┤
│ 📋 HABIT BREAKDOWN         │ [Accordion/collapsible]
│ ├─ Habit 1     [Details ▼] │
│ ├─ Habit 2     [Details ▼] │
│ └─ Habit 3     [Details ▼] │
├─────────────────────────────┤
│ 💡 KEY INSIGHTS             │ [Stacked cards]
│ ├─ Best Day: Monday         │
│ ├─ Peak Time: 6-8 AM        │
│ └─ Status: 🔥 On Fire!      │
└─────────────────────────────┘
```

---

## Part 4: Component Specifications

### 🎯 1. HERO SECTION - "Progress Snapshot"
**Purpose:** Immediate high-level overview of user's performance  
**Placement:** Top of page, full width  
**Size:** Desktop 100% width × 120px | Mobile 100% width × 140px

#### Content
```
Left Side:
- 📈 Icon
- "PROGRESS SNAPSHOT" label
- Date range (e.g., "January 1-11, 2026")

Center/Right (3-column layout, mobile stacks to 2):
- Metric 1: Total Active Habits → "5"
- Metric 2: Overall Completion Rate → "72%"
- Metric 3: Week vs Last Week → "+8% ↗"

Extended (on hover/expanded):
- Longest Streak → "12 days (Reading)"
- Status Badge → "🔥 On Fire!" or "📈 Improving" or "⚠️ Struggling"
- Recommendation → "Keep it up! 🚀"
```

#### Design Details
- **Background:** `bg-card-dark` with gradient border top (primary color)
- **Card Style:** Rounded-2xl, border-border-dark-strong, shadow-lg
- **Typography:**
  - Label: `text-xs text-text-dark-secondary` (uppercase, tracking-wide)
  - Value: `text-2xl font-bold text-text-dark-primary`
  - Meta: `text-sm text-text-dark-secondary`
- **Interactions:**
  - Hover: subtle scale (1.02) + border color shift
  - Click extended: reveal full metrics (animation: height expand 300ms ease-out)
  - Status badge: animated pulse on page load

#### Responsive
- Desktop: 120px fixed height
- Tablet: 140px (metrics wrap)
- Mobile: 180px (full stack)

---

### 📊 2. TIMELINE VIEW - "Your Habit Journey"
**Purpose:** Primary analytics - shows progression over selected period  
**Placement:** Below hero, desktop 66% width (lg:col-span-2) | Mobile full width  
**Type:** New Component: `timeline-view` (chart-based)

#### What It Shows
1. **Main Line Chart**
   - X-axis: Dates in selected range
   - Y-axis: Daily completion percentage
   - Line: Smooth curve with gradient fill below
   - Color: Primary accent
   - Interactive points: Show tooltip on hover

2. **Milestone Markers**
   - ✓ Perfect days (100% completion)
   - 🔥 Streak days (consecutive completions)
   - 📈 Peak days (highest week performance)
   - 📉 Lowest days (below average)
   - Visual: Colored dots/badges on the line

3. **Trend Indicators**
   - Average line: Secondary color, dashed
   - Trend arrow: ↗ Improving, ↘ Declining, → Stable
   - Text: "Trend: +3% per week"

#### Data Flow
```
Timeline Component receives:
- Array of {date, completionRate, habits, events}
- Selected range (start_date, end_date)
- Period (7d/30d/90d/custom)

Calculates:
- Daily completion %
- Trend (linear regression)
- Milestones (perfect days, streaks)
- Average line
- Peak/low days
```

#### Technical Approach
- **Chart Library:** Chart.js or ngx-charts (recommend ngx-charts for Angular 21 standalone)
- **Dimensions:** 
  - Desktop: ~600px width × 300px height
  - Mobile: 100% width × 250px height (smaller)
- **Interaction:**
  - Hover: tooltip with date, completion %, specific habits
  - Click: expand day detail (modal or card)
  - Tap (mobile): same as click

#### Styling
- **Background:** `bg-background-dark/50`
- **Border:** `border border-border-dark`
- **Chart Colors:**
  - Line: `--color-primary`
  - Fill gradient: `primary` (100% opacity) → primary (10% opacity)
  - Average line: `--color-text-dark-secondary` (dashed)
  - Points: Match category (perfect=gold, streak=orange, peak=green)

---

### 🔥 3. ACTIVITY HEATMAP - (Refactored)
**Purpose:** Historical pattern recognition - visual "heat" of activity  
**Placement:** Desktop: same row as timeline, 33% width | Mobile: full width below timeline  
**Existing Component:** `calendar-heatmap` (update, don't rebuild)

#### Updates from Current Design
1. **Add Milestone Overlays**
   - 🎯 Perfect week badge on top-left of week cells
   - ⭐ Best week of selected range highlighted with glowing border
   - 🔥 Longest streak marked with flame icon

2. **Enhanced Hover States**
   - Tooltip shows: Date | X/Y habits completed | Completion % | Habits listed
   - Animated scale (1.15) on hover

3. **Legend Improvements**
   - Visual: gradient from 10% → 90% opacity
   - Add text labels: "No Habits" | "Partial" | "Most Complete" | "Perfect Day"
   - Explain: "Darker = More habits completed that day"

4. **Mobile Responsive**
   - Cells: reduce size to ~24px on mobile
   - Arrange: show only 4-5 weeks instead of full period
   - Scrollable: horizontal scroll for older weeks

#### Layout
- Desktop: 600px × 200px (4-5 weeks visible)
- Mobile: 100% width, 5-6 rows showing 4 weeks at a time, scrollable

---

### 📋 4. HABIT BREAKDOWN - (Restructured)
**Purpose:** Per-habit analytics with actionable insights  
**Placement:** Full width, below heatmap  
**Existing Component:** `habit-breakdown` (major refactor)

#### New Structure
```
Header Row:
[Sort By: Completion % ▼] [View: List/Cards ▼] [Filter ▼]

For Each Habit (Card Layout):
┌─────────────────────────────────────────────────────┐
│ 💪 Habit Name                              [Expand ▼]│
│                                                     │
│ 72% Completion Rate          68% Consistency       │
│ ████░░░ (18/25 days)        ███████░░ (17/25)     │
│                                                     │
│ 📊 Details (Hidden, Expand on click):              │
│ • Best Day: Monday (91% completion)                │
│ • Peak Time: 6-8 AM (95% success rate)             │
│ • Current Streak: 3 days                           │
│ • Avg. Time to Complete: 15 minutes                │
│ • Frequency: Daily                                 │
│                                                     │
│ 📈 Trend: +5% week-over-week (↗ Good!)            │
│ 💡 Insight: You're most consistent on Mondays      │
└─────────────────────────────────────────────────────┘
```

#### Card Interactions
- **Click:** Expand/collapse details with smooth animation (height: 200px → 350px)
- **Hover:** Card border highlights, detail preview shows
- **Sort:** Change order of cards (completion % ↓, consistency ↓, name A-Z, etc.)
- **Filter:** Show only habits with X criteria (high/low completion, specific day, time range)

#### Mobile Version
- Cards stack fully vertical
- Expand/collapse by default (collapsed for quick scanning)
- Details open in accordion style

#### Responsive
- Desktop: 2-column grid (max 2 habits per row) | Full width
- Tablet: 1 column | Full width
- Mobile: 1 column | Full width, narrower padding

---

### 💡 5. INSIGHTS PANEL - (Repurposed & Moved)
**Purpose:** Behavioral patterns & actionable recommendations  
**Placement:** Desktop: Below habit breakdown (full width) | Mobile: Same  
**Current Component:** `insights-panel` (redesign)

#### Content Reorganization
```
┌─────────────────────────────────────────────────────┐
│ 💡 YOUR INSIGHTS & PATTERNS                         │
│                                                     │
│ ┌──────────────────┬──────────────────┐             │
│ │ 🏆 BEST PERFORMER │ ⚡ QUICK STATS  │             │
│ │                   │                  │             │
│ │ Habit: Reading    │ Best Day: Mon   │             │
│ │ 95% completion    │ Peak Time: 8 PM │             │
│ │ 12-day streak     │ Avg Consistency │             │
│ │ 🔥 On Fire!       │ 81%             │             │
│ └──────────────────┴──────────────────┘             │
│                                                     │
│ ┌──────────────────┬──────────────────┐             │
│ │ 📈 THIS VS LAST  │ 💪 RECOMMENDATIONS            │
│ │ Current: 72%     │                  │             │
│ │ Last Week: 65%   │ 1. Your Monday  │             │
│ │ Change: +8% ↗    │    performance  │             │
│ │ Streak: 3 days   │    is excellent.│             │
│ │                  │    Keep it up! 🚀             │
│ │                  │                  │             │
│ │                  │ 2. Try completing            │
│ │                  │    habits earlier             │
│ │                  │    (6-8 AM) - your            │
│ │                  │    peak time.                 │
│ │                  │                  │             │
│ │                  │ 3. Wednesday is  │             │
│ │                  │    your weakest  │             │
│ │                  │    day. Plan for  │             │
│ │                  │    it!            │             │
│ └──────────────────┴──────────────────┘             │
└─────────────────────────────────────────────────────┘
```

#### Card Structure
```
4 Cards in 2×2 Grid (Desktop)
1. Best Performer (Habit with highest completion)
2. Quick Stats (Best day, peak time, avg consistency)
3. Weekly Comparison (This week vs last)
4. Personalized Recommendations (2-3 bullet points)

Mobile: Stack vertically (1 column)
Tablet: 2 columns
```

#### Recommendations Engine (Logic for Dev)
```
IF completion < 50% THEN
  - "Try breaking your habit into smaller parts"
  
IF consistency_score < 70% THEN
  - "Set a consistent time to complete your habit"
  - "Best time for you: [peak time]"
  
IF week_over_week_improvement > 5% THEN
  - "Great progress! Keep it up! 🚀"
  
IF streak > 7 THEN
  - "[X]-day streak! You're on fire! 🔥"

IF best_day found THEN
  - "You're most consistent on [day]"

IF worst_day found THEN
  - "[Day] is your weakest day. Plan ahead!"
```

---

### ⏰ 6. DATE PICKER & TIME RANGE - (Enhanced)
**Purpose:** Easy date range selection with custom options  
**Placement:** Sticky header (top)  
**Current:** Simple button group (7d/30d/90d) - REPLACE

#### New Design
```
┌─────────────────────────────────────────────────────────┐
│ Reports & Analytics | 📅 Date Range                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Preset Buttons]           [Custom Date Picker]        │
│ [📅 7 Days] [📅 30 Days] [📅 90 Days]  [📅 Custom ▼]  │
│                            [From: MM/DD/YYYY] [To: ...] │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Preset Options
- **7 Days:** Last 7 days (including today)
- **30 Days:** Last 30 days (default load)
- **90 Days:** Last 90 days
- **Custom:** Date picker (start + end date)
- **This Week:** Mon-Sun of current week
- **Last Week:** Previous week Mon-Sun
- **This Month:** 1st-28/30/31 of current month

#### Mobile Version
- Buttons stack horizontally with scroll if needed
- Custom opens modal with date pickers
- Preset buttons are larger touch targets (44px height)

---

## Part 5: Visual Design System

### Color Palette (Using Taskflow Theme)
```
Primary Color:        #13ec5b (Green - accent for success)
Background Dark:      #102216 (Deep green-dark)
Card Dark:            #1c2d21 (Dark card background)
Border Dark:          #23482f (Subtle border)
Border Strong:        #326744 (Emphasized border)
Text Primary:         #ffffff (White text)
Text Secondary:       #92c9a4 (Light green-gray)
Text Tertiary:        #6a8f7b (Dimmed text)

Chart Colors:
- Main Line:          #13ec5b (Primary)
- Average Line:       #92c9a4 (Secondary, dashed)
- Perfect Days:       #fbbf24 (Gold/amber)
- Streak Days:        #f97316 (Orange)
- Peak Days:          #10b981 (Emerald)
- Low Days:           #ef4444 (Red)
```

### Typography
```
Headings:
- H1: text-3xl font-bold text-text-dark-secondary
- H2: text-2xl font-bold text-text-dark-primary
- H3: text-xl font-semibold text-text-dark-primary

Body:
- Regular: text-base text-text-dark-primary
- Secondary: text-sm text-text-dark-secondary
- Small: text-xs text-text-dark-tertiary
- Label: text-xs uppercase tracking-wide text-text-dark-secondary

Numbers (Metrics):
- Large: text-4xl font-bold text-text-dark-primary
- Medium: text-2xl font-bold text-text-dark-primary
- Small: text-lg font-semibold text-text-dark-primary
```

### Spacing
```
Container Padding:   px-4 sm:px-6 lg:px-8, py-8
Card Padding:        p-6
Section Gap:         space-y-6 (24px)
Internal Gap:        space-y-4 (16px)
Element Spacing:     gap-4 (16px) or gap-3 (12px)
```

### Rounded Corners
```
Containers: rounded-2xl (16px)
Cards: rounded-xl (12px) or rounded-2xl
Buttons: rounded-lg (8px)
Icons: rounded-lg (8px) or rounded-xl
Micro elements: rounded-full or no rounding
```

### Shadows
```
Cards: shadow-lg (0 10px 15px -3px rgba(0,0,0,0.1))
Hover: shadow-xl (0 20px 25px -5px rgba(0,0,0,0.1))
Floating: shadow-2xl
```

---

## Part 6: Interaction Design & Animations

### Micro-interactions
```
1. Hero Stats - On Page Load
   - Each metric fades in + scale up (duration: 300ms, stagger: 50ms)
   - Status badge pulses once
   
2. Timeline Chart - On Data Load
   - Line draws from left to right (duration: 1s)
   - Points appear in sequence
   - Fill gradient animates in (duration: 600ms)

3. Card Hover
   - Border color: border-dark → border-dark-strong
   - Scale: 1.0 → 1.02
   - Shadow: shadow-lg → shadow-xl
   - Duration: 200ms ease-out
   
4. Habit Card Expand/Collapse
   - Max-height: 200px → 350px (or auto-height)
   - Opacity of details: 0 → 1
   - Duration: 300ms ease-out
   
5. Sort/Filter Change
   - Cards fade out (150ms)
   - Reorder in DOM
   - Cards fade in (150ms)
   
6. Tooltip Appearance
   - Scale: 0.8 → 1.0
   - Opacity: 0 → 1
   - Duration: 150ms ease-out
```

### Accessibility
```
- All animations respect prefers-reduced-motion
- Keyboard navigation: Tab through all interactive elements
- Focus indicators: Ring around focused element
- ARIA labels on all icons and buttons
- Screen reader text for chart data
- Color contrast: AA compliant (4.5:1 for text, 3:1 for graphics)
```

---

## Part 7: Development Instructions for Dev Team

### Component File Structure
```
src/app/pages/reports-page/
├── reports-page.ts                    (Main container)
├── reports-page.html
├── reports-page.css
├── reports-page.spec.ts
└── components/
    ├── progress-snapshot/            (NEW)
    │   ├── progress-snapshot.ts
    │   ├── progress-snapshot.html
    │   ├── progress-snapshot.css
    │   └── progress-snapshot.spec.ts
    ├── timeline-view/                 (NEW)
    │   ├── timeline-view.ts
    │   ├── timeline-view.html
    │   ├── timeline-view.css
    │   └── timeline-view.spec.ts
    ├── calendar-heatmap/              (REFACTOR)
    │   ├── calendar-heatmap.ts
    │   ├── calendar-heatmap.html
    │   ├── calendar-heatmap.css
    │   └── calendar-heatmap.spec.ts
    ├── habit-breakdown/               (REFACTOR)
    │   ├── habit-breakdown.ts
    │   ├── habit-breakdown.html
    │   ├── habit-breakdown.css
    │   └── habit-breakdown.spec.ts
    ├── insights-panel/                (REFACTOR)
    │   ├── insights-panel.ts
    │   ├── insights-panel.html
    │   ├── insights-panel.css
    │   └── insights-panel.spec.ts
    └── date-range-selector/           (NEW or REFACTOR)
        ├── date-range-selector.ts
        ├── date-range-selector.html
        ├── date-range-selector.css
        └── date-range-selector.spec.ts
```

### Key Implementation Notes

#### 1. Progress Snapshot Component
**Type:** New Standalone Component

```typescript
// Input signals
@input() totalHabits: number;
@input() completionRate: number;
@input() weekComparison: { current: number, last: number, change: number };
@input() longestStreak: { habit: string, days: number };

// Computed signals
statusBadge = computed(() => {
  const rate = this.completionRate();
  if (rate >= 80) return { text: 'On Fire! 🔥', color: 'text-orange-500' };
  if (rate >= 60) return { text: 'Improving 📈', color: 'text-blue-500' };
  return { text: 'Struggling ⚠️', color: 'text-red-500' };
});

// Expand/collapse state
expanded = signal(false);
toggleExpanded = () => this.expanded.update(v => !v);
```

#### 2. Timeline View Component
**Type:** New Standalone Component  
**Chart Library:** ngx-charts (NgxChartsModule)

```typescript
// Input signals
@input() timelineData: Array<{date: string, rate: number, habits: string[]}>;
@input() selectedRange: '7d' | '30d' | '90d' | 'custom';

// Processed data for chart
chartData = computed(() => {
  return this.timelineData().map(day => ({
    name: day.date,
    value: day.rate
  }));
});

// Trend calculation
trendIndicator = computed(() => {
  const data = this.timelineData();
  const first = data[0]?.rate || 0;
  const last = data[data.length - 1]?.rate || 0;
  const trend = ((last - first) / first) * 100;
  return { direction: trend > 0 ? '↗' : trend < 0 ? '↘' : '→', value: Math.abs(trend) };
});

// On hover/click
onPointHover(day: any) {
  this.showTooltip.set(day);
}
```

#### 3. Calendar Heatmap - Refactor Updates
```typescript
// Keep existing but add:

// Milestone overlays
perfectDays = signal<string[]>([]);
bestWeek = signal<string | null>(null);
longestStreak = signal<{ start: string, end: string } | null>(null);

// Enhanced tooltip
tooltipData = signal<{date: string, rate: number, completed: number, total: number} | null>(null);

// Mobile responsive sizes
cellSize = computed(() => {
  return window.innerWidth < 768 ? 24 : 28;
});
```

#### 4. Habit Breakdown - Major Refactor
```typescript
// Input
@input() habitAnalytics: HabitAnalytics[];

// State
sortBy = signal<'completion' | 'consistency' | 'name'>('completion');
filterActive = signal(false);
expandedHabitId = signal<string | null>(null);

// Computed sorted data
sortedHabits = computed(() => {
  const habits = this.habitAnalytics();
  const sortBy = this.sortBy();
  
  return [...habits].sort((a, b) => {
    if (sortBy === 'completion') return b.completionRate - a.completionRate;
    if (sortBy === 'consistency') return b.consistencyScore - a.consistencyScore;
    return a.habitTitle.localeCompare(b.habitTitle);
  });
});

// Toggle expand with animation
toggleExpand(habitId: string) {
  this.expandedHabitId.set(
    this.expandedHabitId() === habitId ? null : habitId
  );
}
```

#### 5. Insights Panel - Reorganize
```typescript
// Input
@input() insights: BehavioralInsights;
@input() weekComparison: WeekComparison;

// Computed signals for each section
bestPerformer = computed(() => {
  // Find habit with highest completion rate
});

recommendations = computed(() => {
  const insights = this.insights();
  const recs: string[] = [];
  
  if (insights.averageConsistencyScore < 70) {
    recs.push(`Set a consistent time to complete your habit. You're best at ${insights.bestTimeOfDay.period}!`);
  }
  
  if (insights.bestDayOfWeek) {
    recs.push(`You're most consistent on ${insights.bestDayOfWeek.day}. Try to maintain that momentum!`);
  }
  
  // More logic...
  return recs;
});
```

#### 6. Date Range Selector - New/Refactor
```typescript
// Output signals
@output() rangeChanged = new EventEmitter<{start: string, end: string}>();
@output() presetSelected = new EventEmitter<'7d' | '30d' | '90d'>();

selectedPreset = signal<'7d' | '30d' | '90d' | 'custom'>('30d');
customRange = signal<{start: string, end: string} | null>(null);
showCustomPicker = signal(false);

selectPreset(preset: '7d' | '30d' | '90d') {
  this.selectedPreset.set(preset);
  this.presetSelected.emit(preset);
  // Calculate date range and emit rangeChanged
}

selectCustomRange(start: string, end: string) {
  this.selectedPreset.set('custom');
  this.customRange.set({start, end});
  this.rangeChanged.emit({start, end});
}
```

### Data Models (Extend models.ts)

```typescript
// Add these to src/app/models/models.ts

export interface TimelineDay {
  date: string;
  completionRate: number;
  completedHabits: number;
  totalHabits: number;
  habits: HabitLog[];
  isMilestone?: 'perfect' | 'streak' | 'peak' | 'low';
}

export interface ReportsPageData {
  timelineData: TimelineDay[];
  heatmapData: HeatmapDay[];
  habitAnalytics: HabitAnalytics[];
  weekComparison: WeekComparison;
  displayInsights: BehavioralInsights;
  topStreaks: StreakInfo[];
}

export interface BehavioralInsights {
  bestDayOfWeek: { day: string; rate: number };
  bestTimeOfDay: { period: string; rate: number };
  averageConsistencyScore: number;
  totalActiveHabits: number;
  longestStreak: { habitId: string; habitTitle: string; days: number };
  recommendations: string[];
}
```

### Service Methods (Extend SupabaseService)

```typescript
// In src/app/services/supabase-service.ts

async getTimelineData(startDate: string, endDate: string): Promise<TimelineDay[]> {
  // Call RPC function: get_timeline_data(start_date, end_date)
  // Returns array of {date, completion_rate, completed_habits, total_habits}
  // Parse and convert snake_case to camelCase
}

async getBehavioralInsights(startDate: string, endDate: string): Promise<BehavioralInsights> {
  // Call RPC function: get_behavioral_insights(start_date, end_date)
  // Calculate best day, best time, consistency score, longest streak
  // Generate recommendations based on patterns
}
```

### Styling Guide (Tailwind CSS)

```css
/* reports-page.css */

/* Hero section animations */
.hero-metric {
  @apply opacity-0 scale-95;
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.hero-metric:nth-child(1) { animation-delay: 0ms; }
.hero-metric:nth-child(2) { animation-delay: 50ms; }
.hero-metric:nth-child(3) { animation-delay: 100ms; }

/* Timeline chart animations */
.timeline-chart {
  @apply opacity-0;
  animation: fadeIn 0.6s ease-out 0.3s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Card hover effect */
.card-base {
  @apply transition-all duration-200 ease-out;
}

.card-base:hover {
  @apply scale-102 shadow-xl;
  border-color: var(--color-border-dark-strong);
}

/* Habit card expand */
.habit-card {
  @apply overflow-hidden transition-all duration-300 ease-out;
}

.habit-card.expanded {
  @apply h-auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timeline-chart {
    max-height: 250px;
  }

  .habit-card {
    @apply text-sm;
  }

  .progress-snapshot {
    @apply py-6;
  }
}
```

### Testing Checklist (For Dev)
```
Unit Tests (Vitest + Angular TestBed):
- [ ] Progress Snapshot renders all metrics correctly
- [ ] Progress Snapshot expands/collapses on click
- [ ] Timeline View fetches and displays data
- [ ] Timeline hover shows correct tooltip data
- [ ] Heatmap cells render with correct opacity
- [ ] Habit Breakdown sorts correctly by each option
- [ ] Habit Card expand/collapse animation works
- [ ] Insights calculations match backend data
- [ ] Date Range Selector emits correct events
- [ ] Mobile responsive layout switches correctly

E2E Tests (Cypress):
- [ ] Reports page loads with all sections visible
- [ ] Time range buttons work and reload data
- [ ] Sorting habits changes card order
- [ ] Expanding habit card reveals details
- [ ] Tooltip appears on chart hover
- [ ] Mobile view stacks all sections vertically
- [ ] Custom date picker opens and allows selection
```

---

## Part 8: Migration & Roll-out Plan

### Phase 1: Development (Week 1-2)
1. Create new components (Progress Snapshot, Timeline View, Date Range Selector)
2. Refactor existing components (Heatmap, Habit Breakdown, Insights)
3. Update data models and service methods
4. Implement all styling and animations
5. Write and pass unit tests

### Phase 2: QA & Testing (Week 3)
1. E2E testing on desktop & mobile
2. Accessibility audit (WCAG 2.1 AA)
3. Performance testing (lighthouse)
4. Browser compatibility check
5. User feedback from beta testers

### Phase 3: Deployment (Week 4)
1. Code review & merge to main
2. Deploy to staging
3. Deploy to production
4. Monitor analytics and user feedback
5. Hotfixes as needed

### Backward Compatibility
- Old report links still work
- Existing data integrations unaffected
- SupabaseService updated but maintains same data structure

---

## Part 9: Success Metrics (Post-Launch)

### User Engagement
- Reports page visit frequency (target: +30%)
- Time spent on page (target: +2 min average)
- Insights clicked/expanded (target: >60% interaction rate)
- Custom date range usage (target: >20% of sessions)

### User Satisfaction
- NPS score for reports feature (target: >7/10)
- Feature completion rate (target: >80%)
- Support tickets reduced (target: -40%)

### Performance
- Page load time (target: <2s)
- Chart rendering time (target: <500ms)
- Mobile Lighthouse score (target: >85)

---

## Part 10: Future Enhancements (Sprint 2+)

### Sprint 2: Comparison & Achievements
- Habit comparison mode (side-by-side 2+ habits)
- Achievement badges (7-day streak, perfect week, etc.)
- Milestone timeline (visual milestones reached)
- Habit leaderboard (if multi-user feature added)

### Sprint 3: Predictive & AI
- AI recommendations (based on user patterns)
- Predictive alerts ("You usually struggle on Fridays")
- Smart habit suggestions ("Try morning routine at 6 AM")
- Goal progress tracking

### Sprint 4: Export & Sharing
- Export reports to PDF
- Share progress with friends/accountability partner
- Print-friendly view
- Email summary reports

### Sprint 5: Advanced Analytics
- Correlation analysis (which habits support each other?)
- Cumulative impact view (if I complete X habit, completion rate +Y%)
- Seasonal patterns (trends across months/seasons)
- Custom dashboards (user-configurable widgets)

---

## Appendices

### A. Wire Frame Annotations (Detailed Specs)
See accompanying Excalidraw file: `wireframe-reports-redesign.excalidraw`

### B. Component Props & Inputs
See detailed component specifications in Part 4

### C. Color & Typography Reference
See design system in Part 5

### D. Animation Specifications
See micro-interactions in Part 6

### E. SQL Schema Updates Needed
(If backend refactoring required - coordinate with API team)

---

**Design Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Status:** ✅ Ready for Development  
**Next Step:** Schedule dev kickoff meeting
