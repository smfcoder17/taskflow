# 📋 Reports Page Redesign - Technical Specification Sheet
## Quick Reference for Development Team

**Document:** Tech Specs v1.0  
**Date:** January 11, 2026  
**For:** Development Team  
**Status:** ✅ Ready to Code  

---

## 🚀 Quick Start Checklist

- [ ] Read [ux-design-reports-page-redesign.md](ux-design-reports-page-redesign.md) (full design doc)
- [ ] Open [wireframe-reports-redesign.excalidraw](wireframe-reports-redesign.excalidraw) in Excalidraw (visual reference)
- [ ] Review component structure below
- [ ] Install ngx-charts: `npm install ngx-charts @angular/common`
- [ ] Create new components and refactor existing ones
- [ ] Run tests: `npm test`

---

## 📁 Component File Structure

```
src/app/pages/reports-page/
├── reports-page.ts                    ← Main container (MODIFY)
├── reports-page.html                  ← Main layout (REFACTOR)
├── reports-page.css                   ← Global styles
├── reports-page.spec.ts               ← Update tests
└── components/
    ├── progress-snapshot/             ← NEW
    │   ├── progress-snapshot.ts
    │   ├── progress-snapshot.html
    │   ├── progress-snapshot.css
    │   └── progress-snapshot.spec.ts
    ├── timeline-view/                 ← NEW (ngx-charts)
    │   ├── timeline-view.ts
    │   ├── timeline-view.html
    │   ├── timeline-view.css
    │   └── timeline-view.spec.ts
    ├── calendar-heatmap/              ← REFACTOR (add overlays)
    │   ├── calendar-heatmap.ts
    │   ├── calendar-heatmap.html      ← Add milestone badges
    │   ├── calendar-heatmap.css
    │   └── calendar-heatmap.spec.ts
    ├── habit-breakdown/               ← REFACTOR (add sort/expand)
    │   ├── habit-breakdown.ts
    │   ├── habit-breakdown.html
    │   ├── habit-breakdown.css
    │   └── habit-breakdown.spec.ts
    ├── insights-panel/                ← REFACTOR (reorganize)
    │   ├── insights-panel.ts
    │   ├── insights-panel.html
    │   ├── insights-panel.css
    │   └── insights-panel.spec.ts
    └── date-range-selector/           ← NEW
        ├── date-range-selector.ts
        ├── date-range-selector.html
        ├── date-range-selector.css
        └── date-range-selector.spec.ts
```

---

## 🎯 Component Specifications (Brief)

### 1️⃣ PROGRESS SNAPSHOT (New)
**Type:** Standalone  
**Purpose:** Hero section with key metrics and expandable details

```typescript
Inputs:
  - totalHabits: number
  - completionRate: number
  - weekComparison: { current: %, last: %, change: % }
  - longestStreak: { habit: string, days: number }
  
Computed:
  - statusBadge: 'On Fire!' | 'Improving' | 'Struggling'
  - expandedState: boolean (signal)

Template:
  - Metric cards: 3 main (4 extended on expand)
  - Status badge with icon/color
  - Animated expand/collapse
  - Recommendation text
```

**Styling Notes:**
- Background: gradient border top (primary color)
- Metrics: large font, bold
- Expandable content: smooth height animation (300ms)
- Hover: subtle scale (1.02) + border highlight

---

### 2️⃣ TIMELINE VIEW (New)
**Type:** Standalone with ngx-charts  
**Purpose:** Primary analytics - completion % over time with milestones

```typescript
Imports:
  - NgxChartsModule (for line chart)
  
Inputs:
  - timelineData: Array<{date, completionRate, habits, isMilestone}>
  - selectedRange: '7d' | '30d' | '90d' | 'custom'
  
Computed:
  - chartData: formatted for ngx-charts
  - trendIndicator: { direction: ↗↘→, value: % }
  
Methods:
  - onPointHover(day): show tooltip
  - onPointClick(day): expand day detail

Service Call:
  - this.supabase.getTimelineData(start, end)
```

**Chart Configuration:**
- Chart type: LineChart (ngx-charts)
- X-axis: Dates
- Y-axis: 0-100% completion
- Line color: primary (#13ec5b)
- Fill gradient: primary → transparent
- Points: colored by milestone (gold/orange/green)
- Tooltip: date, %, habits list, event type

**Interactive:**
- Hover: Highlight point + tooltip (150ms fade-in)
- Click: Modal with full day breakdown
- Responsive: Desktop 600×300, Mobile 100%×250

---

### 3️⃣ CALENDAR HEATMAP (Refactor Existing)
**Type:** Standalone (update)  
**Purpose:** Heat visualization of daily activity + milestone overlays

```typescript
Updates:
  - Add inputs: perfectDays[], bestWeek, longestStreak
  - Add computed: cellSize (responsive)
  - Add methods: getOverlayBadge(date), showTooltip(day)
  
New Overlays:
  - 🎯 Perfect week badge (top-left)
  - ⭐ Best day badge
  - 🔥 Streak marker
  
Enhanced Tooltip:
  - Date | X/Y completed | % | Habit list
  - Smooth fade-in (150ms)
```

**Mobile Updates:**
- Cell size: 24px (mobile) vs 28px (desktop)
- Show 4-5 weeks instead of full period
- Horizontal scroll for older weeks
- Tap = hover effect + tooltip

---

### 4️⃣ HABIT BREAKDOWN (Refactor Existing)
**Type:** Standalone (major refactor)  
**Purpose:** Per-habit analytics with expand/collapse and sorting

```typescript
Inputs:
  - habitAnalytics: HabitAnalytics[]
  
State (signals):
  - sortBy: 'completion' | 'consistency' | 'name'
  - expandedHabitId: string | null
  - filterActive: boolean
  
Computed:
  - sortedHabits: HabitAnalytics[] (sorted by current criteria)
  
Methods:
  - toggleSort(sortBy)
  - toggleExpand(habitId)
  - toggleFilter()
```

**Card Behavior:**
- Collapsed: Show 3 lines (name + 2 metrics + cta)
- Expanded: Show details (best day, peak time, streak, trend, insight)
- Expand animation: height 200px → 350px (300ms ease-out)
- Hover: border highlight, subtle scale
- Sort: cards reorder with fade (150ms out/in)

**Styling:**
- Card padding: p-4 with rounded-xl
- Icon + name (emoji + text)
- Progress bars: 2 columns (rate + consistency)
- Details: small text, secondary color
- Trend indicator: arrow + color (green/red)

---

### 5️⃣ INSIGHTS PANEL (Refactor Existing)
**Type:** Standalone (reorganize layout)  
**Purpose:** Behavioral patterns & actionable recommendations

```typescript
Inputs:
  - insights: BehavioralInsights
  - weekComparison: WeekComparison
  
Computed:
  - bestPerformer: HabitAnalytics (highest completion)
  - recommendations: string[] (generated from insights)
  - statusEmoji: '🔥' | '📈' | '⚠️'

Layout (Desktop):
  - 2×2 grid of cards:
    1. Best Performer
    2. Quick Stats
    3. Weekly Comparison
    4. Recommendations

Layout (Mobile):
  - 1 column stack
```

**Card Content:**
Each card is a small statistics/text card with:
- Icon + title
- Main value/statistic
- Secondary info (percentage, trend, status)
- Action or context text

**Recommendations Logic:**
```
IF completion < 50% → "Try breaking your habit..."
IF consistency < 70% → "Set a consistent time..."
IF streak > 7 → "X-day streak! 🔥"
IF improvement > 5% → "Great progress! 🚀"
IF best_day found → "Most consistent on [day]"
```

---

### 6️⃣ DATE RANGE SELECTOR (New or Refactor)
**Type:** Standalone (new component)  
**Purpose:** Easy date range selection

```typescript
Outputs:
  - rangeChanged: EventEmitter<{start, end}>
  - presetSelected: EventEmitter<'7d' | '30d' | '90d'>
  
State:
  - selectedPreset: '7d' | '30d' | '90d' | 'custom'
  - customRange: {start, end} | null
  - showCustomPicker: boolean
  
Methods:
  - selectPreset(preset)
  - openCustomPicker()
  - selectCustomDate(start, end)
```

**UI (Desktop):**
- Horizontal button group: [7d] [30d] [90d] [Custom ▼]
- Custom picker: Date inputs or calendar popup
- Active state: highlight current selection

**UI (Mobile):**
- Buttons stack or scroll horizontally
- Larger touch targets (44px height)
- Modal for custom date picker

**Preset Logic:**
```
'7d' → today - 7 days
'30d' → today - 30 days (default)
'90d' → today - 90 days
'custom' → user-selected range
Optional: 'this_week', 'last_week', 'this_month'
```

---

## 🔌 Service Methods (To Add)

### SupabaseService

```typescript
// NEW METHOD: Get timeline data
async getTimelineData(startDate: string, endDate: string): Promise<TimelineDay[]> {
  // RPC: get_timeline_data(start_date, end_date)
  // Returns: [{date, completionRate, completedHabits, totalHabits, habits}]
  // Process milestones (perfect, streak, peak, low)
}

// NEW METHOD: Get behavioral insights
async getBehavioralInsights(startDate: string, endDate: string): Promise<BehavioralInsights> {
  // RPC: get_behavioral_insights(start_date, end_date)
  // Calculates: best day, best time, consistency score, longest streak
  // Generates recommendations based on patterns
}

// UPDATE: Extend getFullReportsData (if using old method)
async getFullReportsData(start: string, end: string): Promise<ReportsPageData> {
  // Returns all data for reports page:
  // - timelineData
  // - heatmapData (existing)
  // - habitAnalytics (existing)
  // - weekComparison (existing)
  // - displayInsights (existing, extended)
  // - topStreaks (existing)
}
```

---

## 📊 Data Models (To Add)

Add to `src/app/models/models.ts`:

```typescript
export interface TimelineDay {
  date: string;                    // "2026-01-08"
  completionRate: number;          // 0-100
  completedHabits: number;         // X
  totalHabits: number;             // Y
  habits: HabitLog[];              // completed habit logs
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

// Update existing BehavioralInsights (add recommendations)
export interface BehavioralInsights {
  bestDayOfWeek: { day: string; rate: number };
  bestTimeOfDay: { period: string; rate: number };
  averageConsistencyScore: number;
  totalActiveHabits: number;
  longestStreak: { habitId: string; habitTitle: string; days: number };
  recommendations: string[];  // NEW
}
```

---

## 🎨 Styling Reference

### Colors (From styles.css)
```css
--color-primary: #13ec5b           (Success green)
--color-background-dark: #102216   (Deep background)
--color-card-dark: #1c2d21         (Card background)
--color-border-dark: #23482f       (Subtle border)
--color-border-dark-strong: #326744 (Emphasis border)
--color-text-dark-primary: #ffffff (White text)
--color-text-dark-secondary: #92c9a4 (Light green-gray)
```

### Tailwind Classes (Common)
```css
/* Cards */
.card-base = bg-card-dark border border-border-dark-strong rounded-2xl p-6 shadow-lg

/* Text */
.heading-lg = text-3xl font-bold text-text-dark-secondary
.heading-md = text-2xl font-semibold text-text-dark-primary
.text-primary = text-text-dark-primary
.text-secondary = text-text-dark-secondary

/* Spacing */
.container-padding = px-4 sm:px-6 lg:px-8 py-8
.section-gap = space-y-6
.element-gap = gap-4

/* Interactive */
.transition-smooth = transition-all duration-200 ease-out
.hover-scale = hover:scale-102
.focus-ring = focus:outline-none focus:ring-2 focus:ring-primary
```

### Animations (Custom)
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up { animation: slideUp 0.3s ease-out; }
.animate-fade-in { animation: fadeIn 0.6s ease-out; }
```

---

## 🧪 Testing Requirements

### Unit Tests (Each Component)

```typescript
Progress Snapshot:
  ✓ Renders all metrics correctly
  ✓ Expands/collapses on click with animation
  ✓ Status badge displays correct emoji/color

Timeline View:
  ✓ Fetches data from service
  ✓ Renders ngx-charts line chart
  ✓ Shows milestones correctly
  ✓ Hover shows tooltip with correct data
  ✓ Trend calculation is correct

Calendar Heatmap:
  ✓ Renders grid with correct opacity
  ✓ Shows milestone overlays (badges)
  ✓ Tooltip shows correct day info
  ✓ Responsive sizing on mobile

Habit Breakdown:
  ✓ Sorts by each criteria (completion, consistency, name)
  ✓ Expands/collapses card with animation
  ✓ Filter shows/hides correct habits
  ✓ Shows correct icons and data

Insights Panel:
  ✓ Shows correct best performer
  ✓ Calculates recommendations correctly
  ✓ Displays week comparison with correct change %

Date Range Selector:
  ✓ Emits rangeChanged on preset click
  ✓ Opens custom picker
  ✓ Calculates correct date range
```

### Integration Tests
```
Reports Page:
  ✓ All sections load on page init
  ✓ Time range change reloads all data
  ✓ Mobile responsive layout works
  ✓ No broken references to service
  ✓ Performance: all loads < 2s
```

---

## 🚀 Implementation Order (Recommended)

### Phase 1: Setup & Models
1. Add data models to `models.ts`
2. Add service methods to `SupabaseService`
3. Update tests for service

### Phase 2: New Components
1. Create `progress-snapshot` component
2. Create `timeline-view` component (with ngx-charts)
3. Create `date-range-selector` component
4. Wire up to main page

### Phase 3: Refactoring Existing
1. Update `calendar-heatmap` with overlays
2. Refactor `habit-breakdown` (sort, expand, filter)
3. Reorganize `insights-panel` (4-card layout)

### Phase 4: Styling & Animations
1. Add animations to all components
2. Test responsive behavior (desktop → tablet → mobile)
3. Accessibility review (keyboard nav, contrast, ARIA)

### Phase 5: Testing & Polish
1. Unit tests for all components
2. Integration tests
3. Performance testing
4. Bug fixes & polish

---

## 📱 Responsive Breakpoints

```css
Mobile (< 768px):
  - Full-width sections (stack vertically)
  - Smaller cards (narrower padding)
  - Simplified charts (smaller height)
  - Buttons: larger touch targets (44px)
  - Font: slightly smaller on mobile

Tablet (768px - 1024px):
  - 2-column layout where applicable
  - Balanced spacing

Desktop (> 1024px):
  - Full 3-column or multi-section layout
  - Maximize information density
```

---

## 🔗 Useful Links & Resources

- **Design Document:** [ux-design-reports-page-redesign.md](ux-design-reports-page-redesign.md)
- **Wireframe:** [wireframe-reports-redesign.excalidraw](wireframe-reports-redesign.excalidraw)
- **ngx-charts Docs:** https://swimlane.gitbook.io/ngx-charts/
- **Angular 21 Docs:** https://angular.io
- **Tailwind CSS:** https://tailwindcss.com

---

## ❓ Questions?

- Check the full design document for details
- Review wireframe for visual reference
- Ask design team (Sally) for clarification

**Status:** ✅ Ready to Code!  
**Date:** January 11, 2026  
**Next:** Kickoff development sprint
