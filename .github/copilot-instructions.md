# Taskflow - AI Coding Instructions

## Project Overview

Taskflow is a habit tracking Angular 21 application using Supabase for backend/auth and Tailwind CSS v4 for styling. Users can create habits with flexible frequencies, track daily completions, and view streaks/analytics.

## Architecture

### Core Structure

- **Single service pattern**: `SupabaseService` ([supabase-service.ts](src/app/services/supabase-service.ts)) handles ALL backend interactions (auth, habits CRUD, analytics). Do not create additional services.
- **Standalone components**: All components use `standalone: true`. Never use NgModule.
- **Angular Signals**: Use `signal()` for reactive state, not RxJS Observables for component state. RxJS is only used in `authGuard` for async waiting.

### Key Files

- [models/models.ts](src/app/models/models.ts) - All TypeScript interfaces (`Habit`, `HabitLog`, `HabitWithStats`, etc.)
- [models/utilities.ts](src/app/models/utilities.ts) - Date helpers and `weekDays` constant
- [app.routes.ts](src/app/app.routes.ts) - All routes protected by `authGuard` except `/login`

### Data Flow Pattern

1. Components inject `SupabaseService` via `inject()`
2. Call async service methods (e.g., `getHabitsWithTodayStatus()`)
3. Update component signals with results
4. Template reacts to signal changes

Example from [dashboard-page.ts](src/app/pages/dashboard-page/dashboard-page.ts):

```typescript
supabaseService = inject(SupabaseService);
habits = signal<HabitWithStats[]>([]);

async loadHabits() {
  const { data, error } = await this.supabaseService.getHabitsWithTodayStatus();
  this.habits.set(data || []);
}
```

## Conventions

### File Naming

- Pages: `src/app/pages/{page-name}/{page-name}.ts|.html|.css|.spec.ts`
- Components: `src/app/components/{component-name}/{component-name}.ts|.html|.css|.spec.ts`
- Component classes use PascalCase without suffix (e.g., `DashboardPage`, `SidebarComponent`)

### Database Field Mapping

Supabase uses snake_case, TypeScript uses camelCase. The service handles conversion:

```typescript
// DB: user_id, habit_id, log_date, custom_days, streak_enabled
// TS: userId, habitId, logDate, customDays, streakEnabled
```

### Styling

- Tailwind CSS v4 with `@theme` custom properties in [styles.css](src/styles.css)
- Theme colors: `--color-primary`, `--color-background-dark`, `--color-card-dark`
- DaisyUI available but currently commented out

## Development Commands

```bash
npm start          # Dev server at http://localhost:4200
npm test           # Run unit tests (Vitest)
npm run build      # Production build
```

## Testing

- **Framework**: Vitest with Angular TestBed
- **Requirement**: Write or update unit tests for every feature added or modified
- **Test files**: Co-located with source as `{component-name}.spec.ts`
- **Pattern**: Use `TestBed.configureTestingModule({ imports: [ComponentName] })` for standalone components

Example test structure:

```typescript
describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Supabase Schema Documentation

- **Schema file**: Store all Supabase entity schemas in [docs/supabase-schema.md](docs/supabase-schema.md)
- Document table structures, relationships, RLS policies, and functions
- Update this file whenever backend schema changes

## Environment Setup

Copy `src/environments/example.environment.ts` to `environment.ts` and add your Supabase credentials:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

## Authentication

- Magic link authentication via `signInWithMagicLink(email)`
- Session managed via `SupabaseService.session` signal
- `authGuard` waits for `isLoading` to complete before checking session

## When Adding Features

1. Add interfaces to [models/models.ts](src/app/models/models.ts)
2. Add service methods to `SupabaseService` with proper snake_case↔camelCase conversion
3. Create standalone component with signals for state
4. Add route to [app.routes.ts](src/app/app.routes.ts) with `canActivate: [authGuard]`
5. **Write unit tests** for new components and service methods
6. If backend schema changes, update [docs/supabase-schema.md](docs/supabase-schema.md)
