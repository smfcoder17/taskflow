# Dashboard UI Redesign Specification

**Designer:** Sally (UX Designer)  
**Date:** January 12, 2026  
**Reference:** Modern business dashboard aesthetic (Puzzler-style interface)  
**Scope:** Dashboard page visual redesign - HTML/CSS only, no TypeScript changes

---

## Design Philosophy

Transform the current dark-themed dashboard into a clean, professional, modern business interface inspired by the reference image while maintaining all existing functionality.

### Key Visual Principles

1. **Light, Clean Background** - Move from dark theme to light/white backgrounds
2. **Card-based Layout** - Elevated cards with subtle shadows for depth
3. **Refined Typography** - Clear hierarchy with professional font sizing
4. **Status Color System** - Color-coded status badges (similar to reference)
5. **Minimal Borders** - Use shadows and spacing instead of heavy borders
6. **Professional Polish** - Rounded corners, consistent spacing, hover states

---

## Color System Updates

### Background & Surface Colors
```css
--bg-primary: #FFFFFF;           /* Main background */
--bg-secondary: #F7F8FA;         /* Page background */
--bg-card: #FFFFFF;              /* Card backgrounds */
--bg-hover: #F9FAFB;             /* Hover states */
```

### Text Colors
```css
--text-primary: #1F2937;         /* Main text */
--text-secondary: #6B7280;       /* Secondary text */
--text-tertiary: #9CA3AF;        /* Tertiary/hint text */
```

### Status Badge Colors (from reference)
```css
--status-pending: #FFA500;       /* Orange */
--status-active: #10B981;        /* Green */
--status-inactive: #EF4444;      /* Red/Pink */
--status-on-sale: #3B82F6;       /* Blue */
--status-branding: #8B5CF6;      /* Purple */
```

### Border & Shadow
```css
--border-light: #E5E7EB;         /* Light borders */
--border-default: #D1D5DB;       /* Default borders */
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
```

---

## Component Specifications

### 1. Page Container
- Background: `#F7F8FA` (light gray)
- Remove dark theme classes
- Add subtle texture or pattern (optional)

### 2. Header Section
**Title Area:**
- "Today" - Font size: 28px, Weight: 600, Color: #1F2937
- Date subtitle - Font size: 14px, Color: #6B7280

**Action Buttons:**
- Background: #FFFFFF
- Border: 1px solid #E5E7EB
- Shadow: 0 1px 2px rgba(0,0,0,0.05)
- Hover: Background #F9FAFB, Shadow increase
- Primary button (Add Habit): Blue #3B82F6, White text

### 3. Progress Card (Hero)
**Container:**
- Background: White
- Border radius: 12px
- Shadow: 0 4px 6px rgba(0,0,0,0.07)
- Padding: 24px

**Progress Text:**
- Percentage: 48px font, Weight: 700, Color: #1F2937
- Subtitle: 14px, Color: #6B7280

**Progress Bar:**
- Background: #E5E7EB (track)
- Fill: Linear gradient from primary color
- Height: 8px
- Border radius: 9999px

**Status Indicators:**
- Success message: Green #10B981
- Warning (at risk): Orange #F59E0B with icon

### 4. Focus Cards (At Risk Habits)
**Container:**
- Background: #FFF7ED (light orange tint)
- Border: 1px solid #FED7AA
- Border radius: 12px
- Padding: 16px

**CTA Button:**
- Background: #F97316 (orange)
- White text
- Border radius: 8px
- Shadow on hover

### 5. Habits List Table Style
**Inspired by reference table layout:**

**Container:**
- Background: White
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Border: 1px solid #E5E7EB

**Header Row:**
- Background: #F9FAFB
- Text: 12px uppercase, Weight: 600, Color: #6B7280
- Letter spacing: 0.05em
- Padding: 12px 16px

**Data Rows:**
- Padding: 16px
- Border bottom: 1px solid #F3F4F6
- Hover: Background #F9FAFB
- Last row: No border

**Habit Items:**
- Icon: 32px circle with light background
- Title: 14px, Weight: 500, Color: #1F2937
- Description: 13px, Color: #6B7280

**Status Badges:**
- Padding: 4px 12px
- Border radius: 9999px (pill shape)
- Font: 12px, Weight: 500
- Colors:
  - Pending: #FEF3C7 bg, #F59E0B text
  - Active: #D1FAE5 bg, #10B981 text
  - Inactive: #FEE2E2 bg, #EF4444 text
  - Completed: #DBEAFE bg, #3B82F6 text
  - Branding: #EDE9FE bg, #8B5CF6 text

**Action Menu (...):**
- Three vertical dots
- Color: #9CA3AF
- Hover: #6B7280
- Visible always on mobile, on hover for desktop

### 6. Checkbox Design
**Unchecked:**
- Border: 2px solid #D1D5DB
- Border radius: 6px
- Size: 20px x 20px
- Background: White

**Checked:**
- Background: Primary color (#3B82F6)
- Border: None
- Checkmark: White icon

**Hover:**
- Border color: Primary color

### 7. Week Widget
**Container:**
- Background: White
- Border radius: 12px
- Padding: 20px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

**Day Circles:**
- Size: 40px
- Complete: #10B981 background, white text
- Partial: #F59E0B background, white text
- Incomplete: #E5E7EB background, #9CA3AF text
- Current day: Blue border ring

### 8. Sidebar Cards
**Container:**
- Background: White
- Border radius: 12px
- Padding: 20px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Spacing between cards: 16px

**Section Titles:**
- Font: 16px, Weight: 600
- Color: #1F2937

### 9. Filter & Sort Dropdowns
**Button:**
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Padding: 8px 16px
- Shadow: 0 1px 2px rgba(0,0,0,0.05)

**Dropdown Menu:**
- Background: White
- Border radius: 8px
- Shadow: 0 10px 15px rgba(0,0,0,0.1)
- Border: 1px solid #E5E7EB

**Menu Items:**
- Padding: 10px 16px
- Hover: Background #F9FAFB
- Active: Background #EFF6FF, Color #3B82F6

### 10. Empty States
**Container:**
- Background: #F9FAFB
- Border: 2px dashed #D1D5DB
- Border radius: 12px
- Padding: 40px
- Text align: center

**Icon:**
- Size: 64px
- Color: #D1D5DB

**Text:**
- Title: 18px, Weight: 600, Color: #1F2937
- Description: 14px, Color: #6B7280

---

## Implementation Notes

### CSS Changes Required
1. Create new utility classes in `dashboard-page.css`:
   ```css
   .card-modern {
     background: white;
     border-radius: 12px;
     box-shadow: 0 1px 3px rgba(0,0,0,0.1);
     border: 1px solid #E5E7EB;
   }
   
   .badge-status {
     padding: 4px 12px;
     border-radius: 9999px;
     font-size: 12px;
     font-weight: 500;
   }
   
   .table-row {
     padding: 16px;
     border-bottom: 1px solid #F3F4F6;
     transition: background 0.2s;
   }
   
   .table-row:hover {
     background: #F9FAFB;
   }
   ```

### HTML Changes
1. Replace dark theme classes with light equivalents:
   - `bg-background-dark` → `bg-gray-50`
   - `bg-card-dark` → `bg-white shadow-sm border border-gray-200`
   - `text-text-dark-primary` → `text-gray-900`
   - `text-text-dark-secondary` → `text-gray-600`

2. Update habit list to table-style layout
3. Modernize button styles
4. Update badge styling
5. Refine spacing and shadows

### Responsive Considerations
- Maintain all existing breakpoints
- Stack sidebar below on mobile
- Reduce padding on small screens
- Show action menus always on mobile

---

## Accessibility Checklist
- ✓ Maintain all ARIA labels
- ✓ Ensure 4.5:1 contrast ratio for text
- ✓ Visible focus states on all interactive elements
- ✓ Touch targets minimum 44x44px on mobile
- ✓ Screen reader compatible

---

## Next Steps
1. Implement HTML changes for dashboard
2. Create custom CSS utility classes
3. Test responsive layouts
4. Verify accessibility
5. Apply same design system to other pages (Reports, Calendar, Habits)

