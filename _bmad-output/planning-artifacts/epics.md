# Epics and User Stories - Phase 1

**Project:** Taskflow
**Role:** Scrum Master (Bob)
**Date:** 2026-01-06

## Epic: Structural Foundation (Table and Service)
**Description:** Establish the core infrastructure for data persistence and retrieval of user-specific configurations, ensuring a solid base for the adaptive notification system and personalized UI.

### Story 1.1: Database Schema & RLS Implementation
*   **As a** system architect,
    *   **I want to** create a `user_settings` table with appropriate Row Level Security (RLS) policies,
    *   **So that** user preferences are securely stored and accessible only by their owners.
*   **Acceptance Criteria:**
    *   Table `user_settings` created in Supabase with columns: `id`, `user_id` (unique), `notification_mode`, `notifications_enabled`, `theme`, `created_at`, `updated_at`.
    *   RLS policies allow `SELECT`, `INSERT`, and `UPDATE` only for the authenticated user matching `user_id`.
    *   Foreign key constraint on `user_id` links to `auth.users(id)`.
    *   Documentation updated in [docs/supabase-schema.md](docs/supabase-schema.md).

### Story 1.2: Model Alignment & TypeScript Interfaces
*   **As a** developer,
    *   **I want to** define the `UserSettings` interface and mapping utilities,
    *   **So that** the application handles snake_case (DB) and camelCase (TS) conversions consistently.
*   **Acceptance Criteria:**
    *   `UserSettings` interface added to [src/app/models/models.ts](src/app/models/models.ts).
    *   Mapping logic implemented to convert `notification_mode` to `notificationMode`, etc.

### Story 1.3: Supabase Service: User Settings Methods
*   **As a** developer,
    *   **I want to** add persistence methods to `SupabaseService`,
    *   **So that** I can fetch and update user settings from any component.
*   **Acceptance Criteria:**
    *   `getUserSettings()` method retrieves the single record for the current user.
    *   `updateUserSettings(updates: Partial<UserSettings>)` method upserts the settings.
    *   Unit tests for `SupabaseService` updated to cover these new methods.

---

## Epic: Settings Revamp (Fusion Profile/Settings + UI)
**Description:** Consolidate user-facing configuration into a single, intuitive interface and wire it up to the persistent storage layer.

### Story 2.1: Unified Settings/Profile View
*   **As a** user,
    *   **I want to** see my profile information and application settings in one place,
    *   **So that** I don't have to navigate between two separate pages for personal configuration.
*   **Acceptance Criteria:**
    *   `ProfilePage` and `SettingsPage` consolidated into a single route (e.g., `/settings`).
    *   UI includes identity info (email/avatar) and configuration toggles (theme, notifications).
    *   Redundant routes and files removed.

### Story 2.2: Reactive Settings State with Signals
*   **As a** developer,
    *   **I want to** use an Angular Signal in `SupabaseService` to manage `userSettings`,
    *   **So that** the UI reacts instantly to settings changes across the entire app.
*   **Acceptance Criteria:**
    *   `userSettings` signal exposed in `SupabaseService`.
    *   Signal is initialized upon login and updated whenever settings are fetched or modified.
    *   Components (like Sidebar or Theme Switcher) use the signal for reactive UI updates.

### Story 2.3: Theme and Notification Mode Persistence
*   **As a** user,
    *   **I want my** theme and notification mode choices to persist across sessions and devices,
    *   **So that** I don't have to re-configure the app every time I log in.
*   **Acceptance Criteria:**
    *   Theme selection (Light/Dark/System) saved to `user_settings` table.
    *   Notification Mode selection (Zen/Balanced/Persistent) saved to `user_settings` table.
    *   App applies the persisted theme immediately after user data is loaded.

---

## Epic: All Habits Page Implementation
**Description:** Complete the functionality of the "All Habits" view to allow users to manage their entire habit portfolio.

### Story 3.1: All Habits List View
*   **As a** user,
    *   **I want to** see a list of all my habits regardless of their daily frequency,
    *   **So that** I can get an overview of everything I'm tracking.
*   **Acceptance Criteria:**
    *   `AllHabitsPage` fetches all habits from the user's account.
    *   Habit cards display basic info and current stats (streaks).
    *   Reuse existing habit card components where possible.

### Story 3.2: Search and Filter Capabilities
*   **As a** user,
    *   **I want to** search and filter my habits by name or status,
    *   **So that** I can quickly find specific habits when I have a long list.
*   **Acceptance Criteria:**
    *   Search bar filters habits by title in real-time.
    *   Filter dropdown allows filtering by active/archived status or category.

### Story 3.3: Habit Management from All Habits View
*   **As a** user,
    *   **I want to** edit or delete habits directly from the "All Habits" page,
    *   **So that** I can efficiently manage my habit list.
*   **Acceptance Criteria:**
    *   Each habit card includes "Edit" and "Delete" actions.
    *   "Delete" triggers a confirmation modal.
    *   "Edit" navigates to the pre-filled `HabitFormPage`.
