export interface Profile {
  id?: string;
  username: string;
  website: string;
  avatar_url: string;
}

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'nutrition'
  | 'mindfulness'
  | 'learning'
  | 'productivity'
  | 'creative'
  | 'social'
  | 'finance'
  | 'sleep'
  | 'hydration'
  | 'personal';

/**
 * Represents a habit icon pair containing category, icon, and label information.
 * @typedef {Object} HabitIconPair
 * @property {HabitCategory} category - The category of the habit
 * @property {string} icon - The icon representation of the habit
 * @property {string} label - The display label for the habit
 */
export type HabitIconPair = { category: HabitCategory; icon: string; label: string };
export const DefaultHabitIcons: HabitIconPair[] = [
  { category: 'personal', label: 'Personal', icon: '🎯' },
  { category: 'health', label: 'Health', icon: '💪' },
  { category: 'fitness', label: 'Fitness', icon: '🏃' },
  { category: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { category: 'mindfulness', label: 'Mindful', icon: '🧘' },
  { category: 'learning', label: 'Learning', icon: '📚' },
  { category: 'productivity', label: 'Work', icon: '💼' },
  { category: 'creative', label: 'Creative', icon: '🎨' },
  { category: 'social', label: 'Social', icon: '👥' },
  { category: 'finance', label: 'Finance', icon: '💰' },
  { category: 'sleep', label: 'Sleep', icon: '💤' },
  { category: 'hydration', label: 'Hydration', icon: '💧' },
];
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Habit {
  id?: string;
  userId?: string;

  // Informations de base
  title: string;
  description?: string;
  icon?: string;
  color?: string;

  // Catégorisation
  category?: HabitCategory;

  // Fréquence
  frequency: HabitFrequency;
  customDays?: DayOfWeek[]; // ["mon", "tue", "wed"]
  timeOfDay?: string; // format "HH:mm:ss"

  // Dates
  startDate?: string; // ISO string
  endDate?: string;

  // Streak
  streakEnabled: boolean;
  streakResetAfterMissingDays?: number;

  // UI
  sortOrder?: number;
  archived?: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitLog {
  id?: string;
  habitId: string;
  userId?: string;
  logDate: string; // format YYYY-MM-DD
  completed: boolean;
  notes?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitWithStats extends Habit {
  currentStreak?: number;
  longestStreak?: number;
  completedToday?: boolean;
  totalCompletions?: number;
  completionsLast7Days?: number;
  completionsLast30Days?: number;
  lastCompletedDate?: string;
}

export interface DailyProgress {
  date: string;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
}

export interface WeeklyProgress {
  days: {
    date: string;
    dayName: string;
    completed: number;
    total: number;
  }[];
}

export interface StreakInfo {
  habitId: string;
  habitTitle: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  rank: number;
}

export interface AnalyticsSnapshot {
  id?: string;
  userId: string;
  dateRange: { start: Date; end: Date };
  completionRate: number;
  streak: number;
  totalCompleted: number;
}
