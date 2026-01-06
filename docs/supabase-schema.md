# Supabase Schema Documentation

## Tables

### habits

| Column   | Type | Constraints      | Description                                                                                                                    |
| -------- | ---- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| category | text | CHECK constraint | One of: health, fitness, nutrition, mindfulness, learning, productivity, creative, social, finance, sleep, hydration, personal |

**Check Constraints:**

```sql
CHECK (category = ANY (ARRAY[
  'health'::text, 'fitness'::text, 'nutrition'::text, 'mindfulness'::text,
  'learning'::text, 'productivity'::text, 'creative'::text, 'social'::text,
  'finance'::text, 'sleep'::text, 'hydration'::text, 'personal'::text
]))
```

### user_settings

| Column                | Type        | Constraints                   | Description                                      |
| --------------------- | ----------- | ----------------------------- | ------------------------------------------------ |
| id                    | uuid        | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the settings record         |
| user_id               | uuid        | UNIQUE, REFERENCES auth.users | Link to the user in auth.users                   |
| notification_mode     | text        | DEFAULT 'Balanced'            | User's preferred notification density/mode       |
| notifications_enabled | boolean      | DEFAULT true                  | Global toggle for notifications                  |
| theme                 | text        | DEFAULT 'system'              | UI theme preference (light, dark, system)       |
| created_at            | timestamptz | DEFAULT now()                 | When the settings were created                   |
| updated_at            | timestamptz | DEFAULT now()                 | When the settings were last updated             |

## RLS Policies

### user_settings

- **Enable RLS:** Yes
- **Policy 1:** `Users can view their own settings`
  - **Action:** SELECT
  - **Target:** Authenticated users
  - **Definition:** `auth.uid() = user_id`
- **Policy 2:** `Users can update their own settings`
  - **Action:** UPDATE
  - **Target:** Authenticated users
  - **Definition:** `auth.uid() = user_id`
- **Policy 3:** `Users can insert their own settings`
  - **Action:** INSERT
  - **Target:** Authenticated users
  - **Definition:** `auth.uid() = user_id`
