export interface Profile {
  id?: string;
  username: string;
  website: string;
  avatar_url: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  streakEnabled: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
}

export interface AnalyticsSnapshot {
  id: string;
  userId: string;
  dateRange: { start: Date; end: Date };
  completionRate: number;
  streak: number;
  totalCompleted: number;
}
