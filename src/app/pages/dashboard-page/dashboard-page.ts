import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HabitWithStats, DailyProgress, WeeklyProgress, StreakInfo } from '../../models/models';
import { SupabaseService } from '../../services/supabase-service';
import { isSameDay } from '../../models/utilities';

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
  dailyProgress = signal<DailyProgress>({
    date: '',
    totalHabits: 0,
    completedHabits: 0,
    percentage: 0,
  });
  weeklyProgress = signal<WeeklyProgress>({ days: [] });
  topStreaks = signal<StreakInfo[]>([]);

  currentDate = signal<Date>(new Date());
  isLoading = signal<boolean>(true);

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.loadHabits(),
        this.loadDailyProgress(),
        this.loadWeeklyProgress(),
        this.loadTopStreaks(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadHabits() {
    const { data, error } = await this.supabaseService.getHabitsWithTodayStatus();
    if (error) {
      console.error('Error loading habits:', error);
      return;
    }
    this.habits.set(data || []);
  }

  async loadDailyProgress() {
    const progress = await this.supabaseService.getDailyProgress();
    this.dailyProgress.set(progress);
  }

  async loadWeeklyProgress() {
    const progress = await this.supabaseService.getWeeklyProgress();
    this.weeklyProgress.set(progress);
  }

  async loadTopStreaks() {
    const streaks = await this.supabaseService.getTopStreaks(3);
    this.topStreaks.set(streaks);
  }

  async toggleHabit(habitId: string) {
    try {
      await this.supabaseService.toggleHabitCompletion(habitId);
      await this.loadHabits();
      await this.loadDailyProgress();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  }

  changeDate(direction: number) {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + direction);
    this.currentDate.set(newDate);
    // TODO: Load data for new date
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
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
}
