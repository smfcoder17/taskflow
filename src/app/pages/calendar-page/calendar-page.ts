import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase-service';
import { HabitWithStats, HabitLog, DayOfWeek } from '../../models/models';
import { getDayOfWeek } from '../../models/utilities';

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  scheduledHabits: HabitWithStats[];
  completedCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-page.html',
})
export class CalendarPage implements OnInit {
  supabaseService = inject(SupabaseService);

  // Signals
  currentMonth = signal<Date>(new Date());
  selectedDate = signal<Date>(new Date());
  habits = signal<HabitWithStats[]>([]);
  monthLogs = signal<HabitLog[]>([]);
  isLoading = signal(true);

  weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Computed: calendar days for current month view
  calendarDays = computed<CalendarDay[]>(() => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const allHabits = this.habits();
    const logs = this.monthLogs();
    const today = new Date();
    const selected = this.selectedDate();

    // First day of the month
    const firstDay = new Date(year, monthIndex, 1);
    // Last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const date = new Date(currentDate);
      const dateStr = this.formatDateForAPI(date);
      const dayOfWeek = getDayOfWeek(date);
      const dayOfMonth = date.getDate();
      const isLastDayOfMonth =
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() === dayOfMonth;

      // Filter habits scheduled for this day
      const scheduledHabits = allHabits.filter((habit) => {
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

      // Count completed
      const completedCount = scheduledHabits.filter((habit) =>
        logs.some((log) => log.habitId === habit.id && log.logDate === dateStr)
      ).length;

      days.push({
        date,
        dateStr,
        dayOfMonth,
        isCurrentMonth: date.getMonth() === monthIndex,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected),
        scheduledHabits,
        completedCount,
        totalCount: scheduledHabits.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  });

  // Computed: habits for selected date
  habitsForSelectedDate = computed(() => {
    const selected = this.selectedDate();
    const dateStr = this.formatDateForAPI(selected);
    const allHabits = this.habits();
    const logs = this.monthLogs();
    const dayOfWeek = getDayOfWeek(selected);
    const dayOfMonth = selected.getDate();
    const isLastDayOfMonth =
      new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate() === dayOfMonth;

    return allHabits
      .filter((habit) => {
        if (habit.startDate && selected < new Date(habit.startDate)) return false;
        if (habit.endDate && selected > new Date(habit.endDate)) return false;

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
      })
      .map((habit) => ({
        ...habit,
        completedToday: logs.some((log) => log.habitId === habit.id && log.logDate === dateStr),
      }));
  });

  // Computed: month/year display
  monthYearDisplay = computed(() => {
    return this.currentMonth().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  // Computed: completed count for selected date
  completedCountForSelectedDate = computed(() => {
    return this.habitsForSelectedDate().filter((h) => h.completedToday).length;
  });

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      await Promise.all([this.loadHabits(), this.loadMonthLogs()]);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadHabits() {
    const { data, error } = await this.supabaseService.getActiveHabits();
    if (error) {
      console.error('Error loading habits:', error);
      return;
    }
    // Map from DB format
    const mappedHabits: HabitWithStats[] = (data || []).map((h: any) => ({
      id: h.id,
      userId: h.user_id,
      title: h.title,
      description: h.description,
      icon: h.icon,
      color: h.color,
      category: h.category,
      frequency: h.frequency,
      customDays: h.custom_days ? JSON.parse(h.custom_days) : undefined,
      timeOfDay: h.time_of_day,
      startDate: h.start_date,
      endDate: h.end_date,
      streakEnabled: h.streak_enabled,
      streakResetAfterMissingDays: h.streak_reset_after_missing_days,
      sortOrder: h.sort_order,
      archived: h.archived,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
    }));
    this.habits.set(mappedHabits);
  }

  async loadMonthLogs() {
    const month = this.currentMonth();
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Extend range to include visible days from prev/next months
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const { data, error } = await this.supabaseService.getHabitLogsForDateRange(
      this.formatDateForAPI(startDate),
      this.formatDateForAPI(endDate)
    );

    if (error) {
      console.error('Error loading month logs:', error);
      return;
    }

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

    this.monthLogs.set(mappedLogs);
  }

  async toggleHabit(habitId: string | undefined) {
    if (!habitId) return;
    const dateStr = this.formatDateForAPI(this.selectedDate());
    try {
      await this.supabaseService.toggleHabitCompletion(habitId, dateStr);
      await this.loadMonthLogs();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  }

  selectDate(day: CalendarDay) {
    this.selectedDate.set(day.date);
  }

  previousMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    this.loadMonthLogs();
  }

  nextMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.loadMonthLogs();
  }

  goToToday() {
    const today = new Date();
    this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selectedDate.set(today);
    this.loadMonthLogs();
  }

  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatSelectedDate(): string {
    return this.selectedDate().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
  }

  getDayStatus(day: CalendarDay): 'complete' | 'partial' | 'incomplete' | 'empty' {
    if (day.totalCount === 0) return 'empty';
    if (day.completedCount === day.totalCount) return 'complete';
    if (day.completedCount > 0) return 'partial';
    return 'incomplete';
  }
}
