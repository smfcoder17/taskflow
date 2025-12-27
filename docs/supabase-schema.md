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
