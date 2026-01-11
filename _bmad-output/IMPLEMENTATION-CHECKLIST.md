# ✅ Reports Page Redesign - Implementation Checklist

**Sprint:** Reports Page Redesign - Phase 1 (Timeline & Narrative)  
**Start Date:** January 11, 2026  
**Duration:** 2 weeks (weeks 1-2)  
**Status:** Planning Complete ✓ → Ready for Dev Kickoff  

---

## 📋 Pre-Development Checklist

- [ ] **Read all documentation**
  - [ ] Full UX Design: [ux-design-reports-page-redesign.md](ux-design-reports-page-redesign.md)
  - [ ] Technical Specs: [TECHNICAL-SPECS-REPORTS-REDESIGN.md](TECHNICAL-SPECS-REPORTS-REDESIGN.md)
  - [ ] View Wireframe: [wireframe-reports-redesign.excalidraw](wireframe-reports-redesign.excalidraw) (open in Excalidraw)

- [ ] **Understand new architecture**
  - [ ] Review component structure (6 components total: 3 new, 3 refactored)
  - [ ] Understand data flow (models → service → components → template)
  - [ ] Review updated models.ts additions

- [ ] **Prepare development environment**
  - [ ] Install ngx-charts: `npm install ngx-charts @angular/common`
  - [ ] Verify Angular 21 & standalone components working
  - [ ] Create feature branch: `git checkout -b feature/reports-redesign`

- [ ] **Review existing code**
  - [ ] Read current reports-page.ts implementation
  - [ ] Review existing components (heatmap, breakdown, insights)
  - [ ] Check current SupabaseService methods

---

## 🔧 Phase 1: Setup & Infrastructure (Est. 2-3 hours)

### Data Models & Types

- [ ] **Add new interfaces to `src/app/models/models.ts`**
  - [ ] `TimelineDay` interface
  - [ ] `ReportsPageData` interface
  - [ ] Update `BehavioralInsights` (add recommendations)
  - [ ] Unit tests for models (if applicable)

### Service Layer Extensions

- [ ] **Update `src/app/services/supabase-service.ts`**
  - [ ] Add `getTimelineData(start, end)` method
  - [ ] Add `getBehavioralInsights(start, end)` method
  - [ ] Update `getFullReportsData(start, end)` if using consolidated method
  - [ ] Implement snake_case ↔ camelCase conversion for new fields
  - [ ] Add error handling & loading states
  - [ ] Write unit tests for new methods

- [ ] **Verify data availability**
  - [ ] Confirm Supabase RPC functions exist or create them
  - [ ] Test service methods with sample data
  - [ ] Check response formats match interfaces

---

## 🎨 Phase 2: New Components (Est. 4-5 hours)

### Component 1: Progress Snapshot

**File:** `src/app/pages/reports-page/components/progress-snapshot/`

- [ ] Create component files:
  - [ ] `progress-snapshot.ts` (component class)
  - [ ] `progress-snapshot.html` (template)
  - [ ] `progress-snapshot.css` (styling)
  - [ ] `progress-snapshot.spec.ts` (unit tests)

- [ ] Implement component logic:
  - [ ] Define @input signals (totalHabits, completionRate, weekComparison, longestStreak)
  - [ ] Create computed signal for status badge
  - [ ] Add expand/collapse state signal
  - [ ] Implement toggle method
  - [ ] Calculate recommendation text (at least 2-3 variants)

- [ ] Template & styling:
  - [ ] Create hero section layout (icon + title + metrics)
  - [ ] Add expandable details section
  - [ ] Style metric cards with proper hierarchy
  - [ ] Implement hover effects (scale 1.02, border highlight)
  - [ ] Animate expand/collapse (height: 300ms ease-out)

- [ ] Testing:
  - [ ] Test input binding
  - [ ] Test expand/collapse animation
  - [ ] Test status badge calculation
  - [ ] Test responsive sizing (desktop, tablet, mobile)

### Component 2: Timeline View

**File:** `src/app/pages/reports-page/components/timeline-view/`

- [ ] Setup ngx-charts:
  - [ ] Import NgxChartsModule
  - [ ] Verify installation: `npm list ngx-charts`

- [ ] Create component files:
  - [ ] `timeline-view.ts`
  - [ ] `timeline-view.html`
  - [ ] `timeline-view.css`
  - [ ] `timeline-view.spec.ts`

- [ ] Implement chart:
  - [ ] Define @input: timelineData, selectedRange
  - [ ] Create computed signal: chartData (formatted for ngx-charts)
  - [ ] Create computed signal: trendIndicator (trend direction & percentage)
  - [ ] Configure ngx-charts LineChart with:
    - [ ] X-axis: dates
    - [ ] Y-axis: 0-100%
    - [ ] Line color: primary (#13ec5b)
    - [ ] Gradient fill
    - [ ] Interactive tooltips
    - [ ] Point styling (color by milestone)

- [ ] Implement interactions:
  - [ ] onPointHover: show tooltip (150ms fade-in)
  - [ ] onPointClick: emit event or open modal
  - [ ] Keyboard accessibility

- [ ] Styling & responsive:
  - [ ] Desktop: 600×300px
  - [ ] Mobile: 100%×250px
  - [ ] Legend and labels
  - [ ] Color contrast (AA compliant)

- [ ] Testing:
  - [ ] Test data transformation
  - [ ] Test chart renders correctly
  - [ ] Test hover/click interactions
  - [ ] Test responsive sizing
  - [ ] Test trend calculation

### Component 3: Date Range Selector

**File:** `src/app/pages/reports-page/components/date-range-selector/`

- [ ] Create component files:
  - [ ] `date-range-selector.ts`
  - [ ] `date-range-selector.html`
  - [ ] `date-range-selector.css`
  - [ ] `date-range-selector.spec.ts`

- [ ] Implement logic:
  - [ ] Define @output: rangeChanged, presetSelected
  - [ ] Create signal: selectedPreset ('7d' | '30d' | '90d' | 'custom')
  - [ ] Implement selectPreset(preset) method
  - [ ] Implement date calculation logic for each preset
  - [ ] Handle custom date picker (optional: use native input or modal)

- [ ] Template:
  - [ ] Button group: [7d] [30d] [90d]
  - [ ] Custom dropdown button
  - [ ] Custom date pickers (if included)
  - [ ] Active state styling

- [ ] Mobile responsive:
  - [ ] Buttons stack/scroll on mobile
  - [ ] Larger touch targets (44px height)
  - [ ] Modal for custom picker (optional)

- [ ] Testing:
  - [ ] Test preset selection
  - [ ] Test date range calculation
  - [ ] Test event emission
  - [ ] Test custom date picker

---

## 🔄 Phase 3: Refactor Existing Components (Est. 5-6 hours)

### Component 4: Calendar Heatmap (Refactor)

**File:** `src/app/pages/reports-page/components/calendar-heatmap/`

- [ ] Update component class:
  - [ ] Add new @input: perfectDays[], bestWeek, longestStreak
  - [ ] Add computed signal: cellSize (responsive: 24px mobile, 28px desktop)
  - [ ] Add methods: getOverlayBadge(date), isBestDay(date), isStreakDay(date)

- [ ] Update template:
  - [ ] Add overlay badges:
    - [ ] 🎯 Perfect week badge
    - [ ] ⭐ Best day badge
    - [ ] 🔥 Streak marker
  - [ ] Enhanced tooltip with date, %, habits, etc.
  - [ ] Mobile optimizations (smaller grid, horizontal scroll)

- [ ] Styling:
  - [ ] Badge positioning (absolute, top-left, top-right)
  - [ ] Badge animations (pulse, glow)
  - [ ] Hover scale effect (1.15)
  - [ ] Mobile cell sizing

- [ ] Testing:
  - [ ] Test badge display logic
  - [ ] Test tooltip data
  - [ ] Test mobile responsiveness
  - [ ] Test milestone highlighting

### Component 5: Habit Breakdown (Refactor)

**File:** `src/app/pages/reports-page/components/habit-breakdown/`

- [ ] Update component class:
  - [ ] Add signal: sortBy ('completion' | 'consistency' | 'name')
  - [ ] Add signal: expandedHabitId (string | null)
  - [ ] Add signal: filterActive (boolean)
  - [ ] Create computed: sortedHabits (sorted array)
  - [ ] Implement toggleSort(by), toggleExpand(id), toggleFilter()

- [ ] Update template:
  - [ ] Add sort button group (header)
  - [ ] Add filter button (optional, for future)
  - [ ] Card structure with expand/collapse
  - [ ] Expanded details section:
    - [ ] Best day of week
    - [ ] Peak time
    - [ ] Current streak
    - [ ] Weekly trend with arrow
    - [ ] Insight text
  - [ ] Collapsed view: icon + name + 2 progress bars + expand button

- [ ] Styling & animations:
  - [ ] Card hover: border highlight, scale 1.02
  - [ ] Expand/collapse: height animation (200px → 350px, 300ms ease-out)
  - [ ] Sort buttons: active state highlight
  - [ ] Progress bars: two columns
  - [ ] Icons: emoji at left
  - [ ] Trend arrows: color-coded (green for ↗, red for ↘)

- [ ] Testing:
  - [ ] Test sort functionality
  - [ ] Test expand/collapse animation
  - [ ] Test filter toggling
  - [ ] Test data display accuracy

### Component 6: Insights Panel (Refactor)

**File:** `src/app/pages/reports-page/components/insights-panel/`

- [ ] Update component layout:
  - [ ] Change from side panel to full-width 4-card section
  - [ ] Desktop: 2×2 grid
  - [ ] Mobile: 1 column stack

- [ ] Create 4 card sections:
  - [ ] **Best Performer**
    - [ ] Show habit with highest completion
    - [ ] Display %, streak, status emoji
  - [ ] **Quick Stats**
    - [ ] Best day of week
    - [ ] Peak time of day
    - [ ] Avg consistency score
  - [ ] **This vs Last Week**
    - [ ] Current week %
    - [ ] Last week %
    - [ ] Change with arrow
  - [ ] **Recommendations**
    - [ ] Generate 2-3 personalized recommendations
    - [ ] Use recommendation logic from design doc

- [ ] Implement recommendation engine:
  - [ ] IF completion < 50%: suggest breaking into smaller parts
  - [ ] IF consistency < 70%: suggest consistent time
  - [ ] IF week-over-week improvement > 5%: celebrate progress
  - [ ] IF streak > 7: celebrate with fire emoji
  - [ ] IF best day found: mention it
  - [ ] IF worst day found: suggest planning

- [ ] Styling:
  - [ ] Card styling consistent with others
  - [ ] Icon + label + value layout
  - [ ] Secondary text (smaller, dimmer)
  - [ ] Color accents for status/trends

- [ ] Testing:
  - [ ] Test best performer calculation
  - [ ] Test recommendation generation
  - [ ] Test data display accuracy
  - [ ] Test responsive layout

---

## 🎯 Phase 4: Integration & Wiring (Est. 3-4 hours)

### Main Reports Page Component

**File:** `src/app/pages/reports-page/reports-page.ts`

- [ ] Update imports:
  - [ ] Import all 6 components
  - [ ] Import CommonModule, if not already

- [ ] Update component class:
  - [ ] Keep existing signals (isLoading, selectedRange, dateRange computed)
  - [ ] Update signals to fetch new data:
    - [ ] timelineData
    - [ ] habitAnalytics (existing)
    - [ ] heatmapData (existing)
    - [ ] weekComparison (existing)
    - [ ] displayInsights (existing)
    - [ ] topStreaks (existing)
  - [ ] Update loadData() method to call new service methods
  - [ ] Add setRange() method (existing)

- [ ] Update template (reports-page.html):
  - [ ] Reorganize layout according to wireframe:
    - [ ] Header section (title + date picker)
    - [ ] Progress Snapshot (new)
    - [ ] Timeline + Heatmap (2-col grid)
    - [ ] Habit Breakdown (full-width)
    - [ ] Insights Panel (full-width)
  - [ ] Remove old layout (if any conflicts)
  - [ ] Wire component @inputs and @outputs
  - [ ] Add loading state (skeleton or spinner)
  - [ ] Add error state (if data load fails)

- [ ] Update styles (reports-page.css):
  - [ ] Add grid layout definitions
  - [ ] Add responsive breakpoints
  - [ ] Add animation classes (if shared)
  - [ ] Remove old unused styles

### Main Page Layout

- [ ] **Header & Navigation**
  - [ ] Title: "Reports & Analytics"
  - [ ] Subtitle: "🎯 Your Habit Story"
  - [ ] Date range selector (top-right)

- [ ] **Grid Layout**
  - [ ] Desktop (1200px+):
    - [ ] Hero: full width
    - [ ] Timeline + Heatmap: 2-col grid (60/40)
    - [ ] Habit Breakdown: full width
    - [ ] Insights: full width (4 cards in 2×2)
  - [ ] Tablet (768-1024px):
    - [ ] Timeline + Heatmap: stack to 1 col
    - [ ] Insights: 2-col grid
  - [ ] Mobile (< 768px):
    - [ ] All sections full width
    - [ ] Stack vertically
    - [ ] Charts responsive (smaller height)

---

## 🔗 Phase 5: Styling & Animations (Est. 3-4 hours)

### Global Animations

- [ ] **Add to reports-page.css or global styles:**
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

### Component-Specific Animations

- [ ] **Progress Snapshot**
  - [ ] Metrics slide-up on load (stagger 50ms)
  - [ ] Status badge pulse once on load

- [ ] **Timeline View**
  - [ ] Chart fades in (600ms)
  - [ ] Line draws left-to-right
  - [ ] Points appear in sequence

- [ ] **Habit Breakdown**
  - [ ] Cards fade in on sort
  - [ ] Expand/collapse height animation (300ms)
  - [ ] Hover: scale 1.02, border highlight (200ms)

- [ ] **Insights Panel**
  - [ ] Cards fade in on load (100-200ms stagger)
  - [ ] Values scale up slightly

### Responsive Adjustments

- [ ] **Mobile optimizations:**
  - [ ] Smaller padding/spacing
  - [ ] Font size reductions (14px body vs 16px desktop)
  - [ ] Larger button targets (44px+ min)
  - [ ] Simplified charts (smaller height)
  - [ ] Stack all sections vertically

- [ ] **Tablet adjustments:**
  - [ ] 2-column layouts where applicable
  - [ ] Balanced spacing

---

## 🧪 Phase 6: Testing (Est. 3-4 hours)

### Unit Tests (Each Component)

- [ ] **Progress Snapshot Tests**
  - [ ] Test component creation
  - [ ] Test @input bindings
  - [ ] Test expand/collapse toggle
  - [ ] Test status badge calculation
  - [ ] Test recommendation text generation

- [ ] **Timeline View Tests**
  - [ ] Test component creation
  - [ ] Test data transformation to chart format
  - [ ] Test trend calculation
  - [ ] Test chart renders (ngx-charts)
  - [ ] Test hover/click handlers

- [ ] **Calendar Heatmap Tests**
  - [ ] Test cell opacity calculation
  - [ ] Test overlay badge display
  - [ ] Test tooltip data
  - [ ] Test responsive sizing

- [ ] **Habit Breakdown Tests**
  - [ ] Test sort functionality (each option)
  - [ ] Test expand/collapse state
  - [ ] Test filter toggling
  - [ ] Test data display accuracy

- [ ] **Insights Panel Tests**
  - [ ] Test best performer identification
  - [ ] Test recommendation generation (all cases)
  - [ ] Test week comparison calculation
  - [ ] Test layout rendering

- [ ] **Date Range Selector Tests**
  - [ ] Test preset selection
  - [ ] Test date range calculation
  - [ ] Test event emission
  - [ ] Test custom date handling

### Service Tests

- [ ] **SupabaseService Tests**
  - [ ] Test getTimelineData() returns correct format
  - [ ] Test getBehavioralInsights() returns correct format
  - [ ] Test snake_case ↔ camelCase conversion
  - [ ] Test error handling
  - [ ] Test with sample/mock data

### Integration Tests

- [ ] **Reports Page Integration**
  - [ ] Test page loads all components
  - [ ] Test date range change reloads data
  - [ ] Test no console errors
  - [ ] Test responsive layout at breakpoints

### Manual Testing

- [ ] **Desktop Testing**
  - [ ] Open page at 1200px+
  - [ ] Test all interactions (hover, click, expand)
  - [ ] Test animations smooth
  - [ ] Check colors & spacing match design
  - [ ] Test all data displays correctly

- [ ] **Mobile Testing**
  - [ ] Open page at 375px (iPhone)
  - [ ] Test all sections stack vertically
  - [ ] Test buttons have adequate touch targets
  - [ ] Test horizontal scroll on charts
  - [ ] Test readability (font sizes)

- [ ] **Accessibility Testing**
  - [ ] Tab through all interactive elements
  - [ ] Test with screen reader (NVDA, JAWS, or built-in)
  - [ ] Check color contrast (WebAIM tool)
  - [ ] Test keyboard-only navigation
  - [ ] Check ARIA labels on icons

---

## 📊 Phase 7: Performance & Optimization (Est. 2 hours)

- [ ] **Performance Audit**
  - [ ] Run Lighthouse (target: >85 score)
  - [ ] Check page load time (target: <2s)
  - [ ] Check memory usage (no leaks)
  - [ ] Test with slow network (3G throttling)

- [ ] **Code Optimization**
  - [ ] Remove unused imports
  - [ ] Optimize change detection (OnPush strategy if applicable)
  - [ ] Lazy load components if applicable
  - [ ] Optimize images/SVGs

- [ ] **Bundle Size**
  - [ ] Check ngx-charts bundle impact
  - [ ] Tree-shaking is working
  - [ ] No duplicate dependencies

---

## ✅ Pre-Merge Checklist

Before merging to main:

- [ ] **Code Quality**
  - [ ] All linting passes (ESLint)
  - [ ] No console warnings/errors
  - [ ] Code follows project conventions
  - [ ] Comments for complex logic
  - [ ] No dead code/commented code

- [ ] **Testing**
  - [ ] All unit tests passing (npm test)
  - [ ] All integration tests passing
  - [ ] Manual testing complete
  - [ ] Accessibility audit passed
  - [ ] Performance audit passed

- [ ] **Documentation**
  - [ ] Code comments added where needed
  - [ ] Component README updated (if applicable)
  - [ ] Service methods documented
  - [ ] Any breaking changes noted

- [ ] **Git & Version Control**
  - [ ] Feature branch up-to-date with main
  - [ ] No merge conflicts
  - [ ] Commits are clean and well-message
  - [ ] PR description complete

---

## 📅 Timeline Estimate

| Phase | Task | Hours | Days |
|-------|------|-------|------|
| 1 | Setup & Infrastructure | 2-3 | 0.5 |
| 2 | New Components | 4-5 | 1 |
| 3 | Refactor Existing | 5-6 | 1.5 |
| 4 | Integration & Wiring | 3-4 | 1 |
| 5 | Styling & Animations | 3-4 | 1 |
| 6 | Testing | 3-4 | 1 |
| 7 | Performance & Optimization | 2 | 0.5 |
| **TOTAL** | | **22-30** | **5-6 days** |

**Recommended:** 1-2 week sprint with 2-3 developers

---

## 🚀 Launch Checklist

Before going live:

- [ ] Code merged to main
- [ ] Staging deployment successful
- [ ] Product team sign-off
- [ ] Documentation updated in wiki
- [ ] Analytics events wired up (if applicable)
- [ ] Monitor deployment for errors
- [ ] Gather user feedback
- [ ] Plan for next sprint (Comparison mode, Achievements, etc.)

---

## 📞 Communication Plan

- **Kickoff Meeting:** Review all docs, Q&A with design & product
- **Daily Standups:** 15 min sync on blockers
- **Mid-Sprint Check:** Verify timeline & quality
- **Pre-Merge Review:** Code review + design sign-off
- **Post-Launch:** Collect feedback & plan improvements

---

## 🎓 Knowledge Transfer

Ensure team understands:

1. **New Architecture**
   - Why timeline-first approach
   - Why signals over RxJS
   - Why ngx-charts for visualization

2. **User Story**
   - What problem does this solve
   - How does it improve UX
   - What metrics measure success

3. **Technical Decisions**
   - Component composition
   - Data flow patterns
   - Responsive design approach

---

**Status:** ✅ Ready for Development  
**Date Created:** January 11, 2026  
**Last Updated:** January 11, 2026  
**Prepared By:** Sally (UX Designer)  

---

## 📚 Linked Resources

- **Design Document:** [ux-design-reports-page-redesign.md](ux-design-reports-page-redesign.md) (Complete design spec)
- **Technical Specs:** [TECHNICAL-SPECS-REPORTS-REDESIGN.md](TECHNICAL-SPECS-REPORTS-REDESIGN.md) (Dev reference)
- **Wireframe:** [wireframe-reports-redesign.excalidraw](wireframe-reports-redesign.excalidraw) (Visual reference)
- **Copilot Instructions:** [copilot-instructions.md](../../../.github/copilot-instructions.md) (Project conventions)

**Next Step:** Schedule developer kickoff meeting! 🚀
