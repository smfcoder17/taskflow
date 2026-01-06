export interface Profile {
  id?: string;
  username: string;
  email?: string;
  website: string;
  avatar_url: string;
}

// ==================== Settings Types ====================

/** Theme mode options for the app appearance */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Preset accent colors available for customization */
export type AccentColor = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'cyan';

/** Start of week preference for calendar/streak calculations */
export type StartOfWeek = 'monday' | 'sunday';

/** Notification mode settings */
export type NotificationMode = 'Zen' | 'Balanced' | 'Persistent';

/** User settings for preferences, notifications, and defaults */
export interface UserSettings {
  id?: string;
  userId: string;
  timezone: string;
  theme: ThemeMode;
  accentColor: string; // Adjusted to string to match any color name
  startOfWeek: StartOfWeek;
  defaultFrequency: HabitFrequency;
  defaultStartDateToday: boolean;
  notificationsEnabled: boolean;
  notificationMode: NotificationMode;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  missedHabitReminderEnabled: boolean;
  missedHabitReminderTime: string; // HH:mm format
  createdAt?: string;
  updatedAt?: string;
}

/** Default settings for new users */
export const DEFAULT_SETTINGS: UserSettings = {
  userId: '',
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  theme: 'system',
  accentColor: 'green',
  startOfWeek: 'monday',
  defaultFrequency: 'daily',
  defaultStartDateToday: true,
  notificationsEnabled: true,
  notificationMode: 'Balanced',
  dailyReminderEnabled: false,
  dailyReminderTime: '09:00',
  missedHabitReminderEnabled: false,
  missedHabitReminderTime: '20:00',
};

/** Accent color configuration with display properties */
export interface AccentColorOption {
  value: AccentColor;
  label: string;
  colorClass: string;
}

/** Available accent color presets */
export const AccentColorOptions: AccentColorOption[] = [
  { value: 'green', label: 'Green', colorClass: 'bg-primary' },
  { value: 'blue', label: 'Blue', colorClass: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', colorClass: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', colorClass: 'bg-pink-500' },
  { value: 'orange', label: 'Orange', colorClass: 'bg-orange-500' },
  { value: 'cyan', label: 'Cyan', colorClass: 'bg-cyan-500' },
];

// ==================== Habit Types ====================

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
export type MonthDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 'last';

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
  customDays?: (DayOfWeek | MonthDay)[]; // ["mon", "tue"] for weekly, [1, 15, "last"] for monthly
  timeOfDay?: string; // format "HH:mm:ss"

  // Dates
  startDate?: string; // ISO string
  endDate?: string;

  // Streak
  streakEnabled: boolean;
  streakResetAfterMissingDays?: number;

  // Reminders
  // reminderEnabled: boolean;

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
