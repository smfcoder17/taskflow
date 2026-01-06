# Architecture Decision Document - Phase 1

**Project:** Taskflow
**Architect:** Winston
**Date:** 2026-01-06

## 1. Data Schema: Persistence for User Settings

### Context
User settings are currently managed in-memory with a default fallback. To support adaptive notifications and theme persistence, a dedicated database table is required.

### Decision
Implement a `user_settings` table in Supabase.

### Structure (Database - snake_case)
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Settings record ID |
| `user_id` | uuid | FK auth.users(id), UNIQUE | Links to the user (1-to-1) |
| `notification_mode` | text | NOT NULL, DEFAULT 'Balanced' | 'Zen', 'Balanced', or 'Persistent' |
| `notifications_enabled`| boolean | NOT NULL, DEFAULT true | Global notification toggle |
| `theme` | text | NOT NULL, DEFAULT 'system' | 'light', 'dark', 'system' |
| `created_at` | timestamptz | DEFAULT now() | |
| `updated_at` | timestamptz | DEFAULT now() | |

### RLS Policies
- `Users can view their own settings`: `(auth.uid() = user_id)`
- `Users can update their own settings`: `(auth.uid() = user_id)`
- `Users can insert their own settings`: `(auth.uid() = user_id)`

---

## 2. Supabase Service Integration

### Context
`SupabaseService` is the single source of truth for backend communication. It must handle the mapping between snake_case database fields and camelCase TypeScript models.

### Implementation Details
- **Model Alignment**: `UserSettings` interface in `models.ts` will be used as the source for the service methods.
- **Conversion Strategy**:
    - **From DB**: `(data) => ({ ...data, notificationMode: data.notification_mode, notificationsEnabled: data.notifications_enabled, userId: data.user_id })`
    - **To DB**: `(settings) => ({ notification_mode: settings.notificationMode, notifications_enabled: settings.notificationsEnabled, user_id: settings.userId, theme: settings.theme })`
- **Methods**:
    - `getUserSettings()`: Fetches settings for the current session user.
    - `updateUserSettings(updates: Partial<UserSettings>)`: Upserts settings.

---

## 3. State Management: Angular Signals

### Context
Angular Signals provide a performant and reactive way to manage state across the application.

### Decision
`SupabaseService` will expose a `userSettings` signal.

### Pattern
```typescript
// In SupabaseService
userSettings = signal<UserSettings | null>(null);

async loadUserSettings() {
  const { data, error } = await this.getUserSettings();
  if (data) {
    this.userSettings.set(data);
  }
}
```
- **Lifecycle**: Settings should be loaded automatically upon successful login.
- **Persistence**: Any change to the signal should trigger a debounced update to the database (or be explicitly saved by the user in the Settings page).

---

## 4. Feature Integration: "All Habits" Page

### Context
The "All Habits" page currently exists as an empty component. It needs to provide a full list of user habits, irrespective of today's schedule.

### Implementation
- **Data Source**: Use existing `getHabitsWithTodayStatus()` or a new `getAllHabits()` method if specific stats are needed.
- **UI Components**:
    - Reuse the habit card layout from the Dashboard for consistency.
    - Implement search/filter functionality (category, status, title).
- **Navigation**: Ensure the link in the Sidebar is active and correctly navigates to `/all-habits`.

---

## 5. Directory & File Naming Conventions
- Maintain PascalCase for component classes.
- Maintain kebab-case for file names.
- Everything remains standalone.
