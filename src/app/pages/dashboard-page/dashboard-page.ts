import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  HabitWithStats,
  DailyProgress,
  WeeklyProgress,
  StreakInfo,
  HabitCategory,
  DefaultHabitIcons,
  DayOfWeek,
  HabitLog,
} from '../../models/models';
import { SupabaseService } from '../../services/supabase-service';
import { isSameDay, getDayOfWeek } from '../../models/utilities';

interface TodayHabit {
  id: number;
  title: string;
  description: string;
  streak: number;
  category: string;
  completed: boolean;
}

interface TopStreak {
  title: string;
  days: number;
  rank: number;
}

// Filter & Sort Types
type FilterStatus = 'all' | 'completed' | 'pending';
type FilterCategory = 'all' | HabitCategory;
type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'streak-desc'
  | 'streak-asc'
  | 'category'
  | 'created-newest'
  | 'created-oldest';

interface FilterOption {
  value: FilterStatus;
  label: string;
  icon: string;
}

interface CategoryFilterOption {
  value: FilterCategory;
  label: string;
  icon: string;
}

interface SortOptionItem {
  value: SortOption;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  supabaseService = inject(SupabaseService);
  router = inject(Router);

  // Signals for reactive data
  habits = signal<HabitWithStats[]>([]);
  weeklyLogs = signal<HabitLog[]>([]);
  topStreaks = signal<StreakInfo[]>([]);

  currentDate = signal<Date>(new Date());
  isLoading = signal<boolean>(true);

  // Filter & Sort state
  showFilterMenu = signal(false);
  showSortMenu = signal(false);

  activeStatusFilter = signal<FilterStatus>('all');
  activeCategoryFilter = signal<FilterCategory>('all');
  activeSort = signal<SortOption>('name-asc');

  constructor() {
    // Note: Sort state managed locally in dashboard
  }

  // Filter options
  statusFilters: FilterOption[] = [
    { value: 'all', label: 'All Habits', icon: 'list' },
    { value: 'completed', label: 'Completed', icon: 'check_circle' },
    { value: 'pending', label: 'Pending', icon: 'pending' },
  ];

  categoryFilters: CategoryFilterOption[] = [
    { value: 'all', label: 'All Categories', icon: 'category' },
    ...DefaultHabitIcons.map((cat) => ({
      value: cat.category as FilterCategory,
      label: cat.label,
      icon: cat.icon,
    })),
  ];

  sortOptions: SortOptionItem[] = [
    { value: 'name-asc', label: 'Name (A-Z)', icon: 'sort_by_alpha' },
    { value: 'name-desc', label: 'Name (Z-A)', icon: 'sort_by_alpha' },
    { value: 'streak-desc', label: 'Highest Streak', icon: 'local_fire_department' },
    { value: 'streak-asc', label: 'Lowest Streak', icon: 'local_fire_department' },
    { value: 'category', label: 'Category', icon: 'category' },
    { value: 'created-newest', label: 'Newest First', icon: 'schedule' },
    { value: 'created-oldest', label: 'Oldest First', icon: 'history' },
  ];

  // UI State
  showHabitActionsMenu = signal<string | null>(null);
  showDoneSection = signal<boolean>(false);
  showConfetti = signal<boolean>(false); // Celebration animation state
  showVictoryMoment = signal<boolean>(false); // Final habit completion screen takeover

  // Computed: The ONE habit to focus on (behavior-driving)
  nextHabit = computed(() => {
    const pending = this.habitsForCurrentDate().filter(h => !h.completedToday);
    if (pending.length === 0) return null;
    
    // Prioritize: 1) At-risk (streak-enabled), 2) Highest streak, 3) First alphabetically
    const atRisk = pending.filter(h => h.streakEnabled).sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
    if (atRisk.length > 0) return atRisk[0];
    
    return pending.sort((a, b) => a.title.localeCompare(b.title))[0];
  });

  // Computed: Hero card context (urgency, consequence, time)
  heroContext = computed(() => {
    const habit = this.nextHabit();
    if (!habit) return null;

    const context: { urgency?: string; consequence?: string; actionLabel: string } = {
      actionLabel: 'Mark as Done'
    };

    // Add streak consequence if applicable
    if (habit.streakEnabled && (habit.currentStreak || 0) > 0) {
      context.consequence = `Keeps your ${habit.currentStreak}-day streak alive`;
    } else if (habit.streakEnabled) {
      context.consequence = 'Start building your streak today';
    }

    // Urgency based on time of day
    const hour = new Date().getHours();
    if (hour >= 20) {
      context.urgency = '⏰ Evening — finish before bed';
    } else if (hour >= 17) {
      context.urgency = '🌆 Winding down — a few hours left';
    }

    return context;
  });

  // Computed: Emotional progress with stages
  progressNarrative = computed(() => {
    const progress = this.dailyProgress();
    const percentage = progress.percentage;
    const completed = progress.completedHabits;
    const remaining = progress.remaining;
    const total = progress.totalHabits;

    // Stage-based emotional messaging
    if (total === 0) {
      return { stage: 'rest', emoji: '☀️', main: 'Rest day', sub: 'No habits scheduled. Enjoy!' };
    }
    if (percentage === 100) {
      return { stage: 'complete', emoji: '🏆', main: 'Perfect day!', sub: `All ${total} habits crushed. You're building something.` };
    }
    if (percentage >= 75) {
      return { stage: 'late', emoji: '🔥', main: 'Almost there!', sub: `Just ${remaining} more. Don't stop now.` };
    }
    if (percentage >= 50) {
      return { stage: 'mid', emoji: '💪', main: 'Halfway warrior', sub: `${completed} done, ${remaining} to go. You've got this.` };
    }
    if (percentage > 0) {
      return { stage: 'early', emoji: '🌱', main: 'Off to a start', sub: `${completed} down. Every habit counts.` };
    }
    return { stage: 'zero', emoji: '🎯', main: 'Fresh start', sub: `${total} habits ready. Begin with one.` };
  });

  // Computed: Habits grouped by time of day (for later UI enhancement)
  morningHabits = computed(() => this.habitsForCurrentDate().filter(h => h.category === 'health' || h.category === 'fitness'));
  eveningHabits = computed(() => this.habitsForCurrentDate().filter(h => h.category === 'mindfulness' || h.category === 'personal'));

  // Computed: Identity message for long-term users
  identityMessage = computed(() => {
    const streaks = this.topStreaks();
    const longestStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    
    if (longestStreak >= 30) return `You're becoming someone who never misses.`;
    if (longestStreak >= 14) return `Two weeks strong. This is who you are now.`;
    if (longestStreak >= 7) return `One week in. The habit is taking root.`;
    return null;
  });

  // Computed: habits scheduled for current date
  habitsForCurrentDate = computed(() => {
    const date = this.currentDate();
    const dayOfWeek = getDayOfWeek(date);
    const dayOfMonth = date.getDate();
    const isLastDayOfMonth =
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() === dayOfMonth;

    return this.habits().filter((habit) => {
      // Check if habit is within its date range
      if (habit.startDate) {
        const startDate = new Date(habit.startDate);
        if (date < startDate) return false;
      }
      if (habit.endDate) {
        const endDate = new Date(habit.endDate);
        if (date > endDate) return false;
      }

      // Filter based on frequency
      switch (habit.frequency) {
        case 'daily':
          // Daily habits appear every day
          return true;

        case 'weekly':
          // Weekly habits appear on specific days of the week
          if (!habit.customDays || habit.customDays.length === 0) {
            // If no days specified, show every day (fallback)
            return true;
          }
          return habit.customDays.includes(dayOfWeek);

        case 'monthly':
          // Monthly habits appear on specific days of the month
          if (!habit.customDays || habit.customDays.length === 0) {
            // If no days specified, show every day (fallback)
            return true;
          }
          // Check if current day matches or if it's 'last' day of month
          return (
            habit.customDays.includes(dayOfMonth as any) ||
            (isLastDayOfMonth && habit.customDays.includes('last' as any))
          );

        case 'custom':
          // Custom frequency - show every day (user-defined logic)
          return true;

        default:
          return true;
      }
    });
  });

  // Computed daily progress based on habits scheduled for current date
  dailyProgress = computed(() => {
    const scheduledHabits = this.habitsForCurrentDate();
    const totalHabits = scheduledHabits.length;
    const completedHabits = scheduledHabits.filter((h) => h.completedToday).length;
    const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const remaining = totalHabits - completedHabits;

    return {
      date: this.formatDateForAPI(this.currentDate()),
      totalHabits,
      completedHabits,
      remaining,
      percentage,
    };
  });

  // Computed: habits at risk (streak-enabled habits not completed today)
  atRiskHabits = computed(() => {
    return this.habitsForCurrentDate()
      .filter((h) => h.streakEnabled && !h.completedToday)
      .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
      .slice(0, 2);
  });

  // Computed: pending habits (not completed)
  pendingHabits = computed(() => {
    return this.filteredHabits().filter((h) => !h.completedToday);
  });

  // Computed: completed habits (done)
  completedHabits = computed(() => {
    return this.filteredHabits().filter((h) => h.completedToday);
  });

  // Computed: motivational message
  motivationalMessage = computed(() => {
    const progress = this.dailyProgress();
    if (progress.totalHabits === 0) return '';
    if (progress.percentage === 100) return '🎉 Perfect day!';
    if (progress.percentage >= 80) return `Just ${progress.remaining} more to hit 100%!`;
    if (progress.percentage >= 50) return `${progress.remaining} habits left to hit 80% today`;
    return `${progress.remaining} habits to go today`;
  });

  // Computed weekly progress based on habits and logs
  weeklyProgress = computed(() => {
    const allHabits = this.habits();
    const logs = this.weeklyLogs();
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDateForAPI(date);
      const dayOfWeek = getDayOfWeek(date);
      const dayOfMonth = date.getDate();
      const isLastDayOfMonth =
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() === dayOfMonth;

      // Filter habits scheduled for this specific day
      const scheduledHabits = allHabits.filter((habit) => {
        // Check date range
        if (habit.startDate && date < new Date(habit.startDate)) return false;
        if (habit.endDate && date > new Date(habit.endDate)) return false;

        switch (habit.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            if (!habit.customDays || habit.customDays.length === 0) return true;
            return habit.customDays.includes(dayOfWeek);
          case 'monthly':
            if (!habit.customDays || habit.customDays.length === 0) return true;
            return (
              habit.customDays.includes(dayOfMonth as any) ||
              (isLastDayOfMonth && habit.customDays.includes('last' as any))
            );
          case 'custom':
            return true;
          default:
            return true;
        }
      });

      // Count completed habits for this day
      const completedCount = scheduledHabits.filter((habit) =>
        logs.some((log) => log.habitId === habit.id && log.logDate === dateStr)
      ).length;

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedCount,
        total: scheduledHabits.length,
      });
    }

    return { days };
  });

  // Computed filtered & sorted habits (now uses habitsForCurrentDate)
  filteredHabits = computed(() => {
    let result = [...this.habitsForCurrentDate()];

    // Apply status filter
    const statusFilter = this.activeStatusFilter();
    if (statusFilter === 'completed') {
      result = result.filter((h) => h.completedToday);
    } else if (statusFilter === 'pending') {
      result = result.filter((h) => !h.completedToday);
    }

    // Apply category filter
    const categoryFilter = this.activeCategoryFilter();
    if (categoryFilter !== 'all') {
      result = result.filter((h) => h.category === categoryFilter);
    }

    // Apply sorting - Default: pending first, then by at-risk status
    const sortOption = this.activeSort();
    if (sortOption === 'name-asc') {
      // Smart default: pending first, then sort by name
      result.sort((a, b) => {
        if (a.completedToday !== b.completedToday) {
          return a.completedToday ? 1 : -1;
        }
        // Among pending, prioritize at-risk (streak-enabled)
        if (!a.completedToday && !b.completedToday) {
          if (a.streakEnabled !== b.streakEnabled) {
            return a.streakEnabled ? -1 : 1;
          }
        }
        return a.title.localeCompare(b.title);
      });
    } else {
      // Apply other sorting options
      switch (sortOption) {
        case 'name-desc':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'streak-desc':
          result.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
          break;
        case 'streak-asc':
          result.sort((a, b) => (a.currentStreak || 0) - (b.currentStreak || 0));
          break;
        case 'category':
          result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
          break;
        case 'created-newest':
          result.sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          break;
        case 'created-oldest':
          result.sort(
            (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );
          break;
      }
    }

    return result;
  });

  // Computed to check if any filter is active
  hasActiveFilters = computed(() => {
    return this.activeStatusFilter() !== 'all' || this.activeCategoryFilter() !== 'all';
  });

  // Get active filter count for badge
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.activeStatusFilter() !== 'all') count++;
    if (this.activeCategoryFilter() !== 'all') count++;
    return count;
  });

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading.set(true);
    try {
      await Promise.all([this.loadHabits(), this.loadWeeklyLogs(), this.loadTopStreaks()]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadHabits() {
    const dateString = this.formatDateForAPI(this.currentDate());
    const { data, error } = await this.supabaseService.getHabitsForDate(dateString);
    if (error) {
      console.error('Error loading habits:', error);
      return;
    }
    this.habits.set(data || []);
  }

  async loadWeeklyLogs() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const startDate = this.formatDateForAPI(weekAgo);
    const endDate = this.formatDateForAPI(today);

    const { data, error } = await this.supabaseService.getHabitLogsForDateRange(startDate, endDate);
    if (error) {
      console.error('Error loading weekly logs:', error);
      return;
    }

    // Map the logs from DB format to our model format
    const mappedLogs: HabitLog[] = (data || []).map((log: any) => ({
      id: log.id,
      habitId: log.habit_id,
      userId: log.user_id,
      logDate: log.log_date,
      completed: log.completed,
      notes: log.notes,
      completedAt: log.completed_at,
      createdAt: log.created_at,
      updatedAt: log.updated_at,
    }));

    this.weeklyLogs.set(mappedLogs);
  }

  async loadTopStreaks() {
    const streaks = await this.supabaseService.getTopStreaks(3);
    this.topStreaks.set(streaks);
  }

  async toggleHabit(habitId: string) {
    try {
      // Check if we're completing (not uncompleting)
      const currentHabits = this.habits();
      const habit = currentHabits.find((h) => h.id === habitId);
      const isCompleting = habit && !habit.completedToday;

      // Optimistic update
      const habitIndex = currentHabits.findIndex((h) => h.id === habitId);
      if (habitIndex !== -1) {
        const updatedHabits = [...currentHabits];
        updatedHabits[habitIndex] = {
          ...updatedHabits[habitIndex],
          completedToday: !updatedHabits[habitIndex].completedToday,
        };
        this.habits.set(updatedHabits);
      }

      // Trigger confetti celebration on completion
      if (isCompleting) {
        this.showConfetti.set(true);
        setTimeout(() => this.showConfetti.set(false), 2500);
      }

      const dateString = this.formatDateForAPI(this.currentDate());
      await this.supabaseService.toggleHabitCompletion(habitId, dateString);
      await Promise.all([this.loadHabits(), this.loadWeeklyLogs()]);
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Revert optimistic update on error
      await this.loadHabits();
    }
  }

  toggleHabitActionsMenu(habitId: string): void {
    this.showHabitActionsMenu.update((current) => (current === habitId ? null : habitId));
  }

  toggleDoneSection(): void {
    this.showDoneSection.update((v) => !v);
  }

  changeDate(direction: number) {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + direction);
    this.currentDate.set(newDate);
    // Reload habits for the new date
    this.loadHabits();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  }

  // Format date for API calls (YYYY-MM-DD)
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isToday = computed(() => {
    const today = new Date();
    return isSameDay(this.currentDate(), today);
  });

  isYesterday = computed(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(this.currentDate(), yesterday);
  });

  isTomorrow = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(this.currentDate(), tomorrow);
  });

  getWeekDayStatus(day: any): string {
    if (day.total === 0) return 'empty';
    if (day.completed === day.total) return 'complete';
    if (day.completed > 0) return 'partial';
    return 'incomplete';
  }

  // Filter & Sort methods
  toggleFilterMenu(): void {
    this.showFilterMenu.update((v) => !v);
    this.showSortMenu.set(false);
  }

  toggleSortMenu(): void {
    this.showSortMenu.update((v) => !v);
    this.showFilterMenu.set(false);
  }

  closeMenus(): void {
    this.showFilterMenu.set(false);
    this.showSortMenu.set(false);
    this.showHabitActionsMenu.set(null);
  }

  setStatusFilter(status: FilterStatus): void {
    this.activeStatusFilter.set(status);
  }

  setCategoryFilter(category: FilterCategory): void {
    this.activeCategoryFilter.set(category);
  }

  setSort(sort: SortOption): void {
    this.activeSort.set(sort);
    this.showSortMenu.set(false);
  }

  clearFilters(): void {
    this.activeStatusFilter.set('all');
    this.activeCategoryFilter.set('all');
  }

  getActiveSortLabel(): string {
    return this.sortOptions.find((s) => s.value === this.activeSort())?.label || 'Sort';
  }
  // Force Rebuild V5
}
