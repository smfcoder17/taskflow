import { Injectable, signal, effect } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import {
  DailyProgress,
  Habit,
  HabitWithStats,
  Profile,
  StreakInfo,
  WeeklyProgress,
} from '../models/models';
import { Router } from '@angular/router';
import id from '@angular/common/locales/id';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  isLoading = signal(true);
  session = signal<Session | null>(null);

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // This is critical for magic links
      },
    });

    this.initializeSession();
  }

  private async initializeSession() {
    try {
      console.log('🔄 Initializing session...');

      // Get current session (including from URL after magic link)
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('❌ Session error:', error);
        this.isLoading.set(false);
        return;
      }

      if (data?.session) {
        console.log('✅ Session found:');
        this.session.set(data.session);
      } else {
        console.log('ℹ️ No session found');
      }

      // Listen for auth state changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth event:', event);
        const previousSession = this.session();
        this.session.set(session);

        if (event === 'SIGNED_IN' && !previousSession && session) {
          this.router.navigate(['/dashboard']);
        } else if (event === 'SIGNED_OUT' && previousSession && !session) {
          this.router.navigate(['/login']);
        }
      });

      // IMPORTANT: Set loading to false AFTER everything is initialized
      this.isLoading.set(false);
      console.log('✅ Session initialization complete');
    } catch (error) {
      console.error('❌ Initialize session error:', error);
      this.isLoading.set(false);
    }
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single();
  }

  signInWithMagicLink(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        shouldCreateUser: true,
      },
    });
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };
    return this.supabase.from('profiles').upsert(update);
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path);
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file);
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Create a new habit
   */
  createHabit(habit: Habit) {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated to create a habit');
    }

    const habitData = {
      user_id: user.id,
      title: habit.title,
      description: habit.description || null,
      icon: habit.icon || '🎯',
      color: habit.color || '#10b981',
      category: habit.category || 'personal',
      frequency: habit.frequency,
      custom_days: habit.customDays ? JSON.stringify(habit.customDays) : null,
      time_of_day: habit.timeOfDay || null,
      start_date: habit.startDate || new Date().toISOString().split('T')[0],
      end_date: habit.endDate || null,
      streak_enabled: habit.streakEnabled ?? true,
      streak_reset_after_missing_days: habit.streakResetAfterMissingDays || 1,
      sort_order: habit.sortOrder || 0,
      archived: habit.archived || false,
    };

    return this.supabase.from('habits').insert(habitData).select().single();
  }

  /**
   * Get all active habits for the current user
   */
  async getActiveHabits() {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    return this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
  }

  /**
   * Get habits with their stats for today
   */
  async getHabitsWithTodayStatus(date?: string) {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const today = date || new Date().toISOString().split('T')[0];

    // Get all habits
    const { data: habits, error: habitsError } = await this.getActiveHabits();

    if (habitsError) throw habitsError;

    // Get today's logs
    const { data: logs, error: logsError } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today);

    if (logsError) throw logsError;

    // Combine habits with their completion status
    const habitsWithStatus: HabitWithStats[] = (habits || []).map((habit) => ({
      ...this.mapHabitFromDB(habit),
      completedToday: logs?.some((log) => log.habit_id === habit.id && log.completed) || false,
    }));

    return { data: habitsWithStatus, error: null };
  }

  /**
   * Toggle habit completion for a specific date
   */
  async toggleHabitCompletion(habitId: string, date?: string) {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    // Check if log exists
    const { data: existingLog, error: fetchError } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', logDate)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingLog) {
      // Toggle completion
      return this.supabase
        .from('habit_logs')
        .update({
          completed: !existingLog.completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLog.id)
        .select()
        .single();
    } else {
      // Create new log
      return this.supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          log_date: logDate,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
    }
  }

  /**
   * Get daily progress for a specific date
   */
  async getDailyProgress(date?: string): Promise<DailyProgress> {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data: habits } = await this.getActiveHabits();
    const totalHabits = habits?.length || 0;

    const { data: logs } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', targetDate)
      .eq('completed', true);

    const completedHabits = logs?.length || 0;
    const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return {
      date: targetDate,
      totalHabits,
      completedHabits,
      percentage,
    };
  }

  /**
   * Get weekly progress (last 7 days)
   */
  async getWeeklyProgress(): Promise<WeeklyProgress> {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const progress = await this.getDailyProgress(dateStr);

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: progress.completedHabits,
        total: progress.totalHabits,
      });
    }

    return { days };
  }

  /**
   * Get top streaks
   */
  async getTopStreaks(limit: number = 3): Promise<StreakInfo[]> {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Get all habits
    const { data: habits } = await this.getActiveHabits();

    if (!habits || habits.length === 0) return [];

    // Calculate streaks for each habit
    const streaksPromises = habits.map(async (habit) => {
      const streak = await this.calculateCurrentStreak(habit.id);
      return {
        habitId: habit.id,
        habitTitle: habit.title,
        icon: habit.icon || '🎯',
        currentStreak: streak.current,
        longestStreak: streak.longest,
        rank: 0,
      };
    });

    const streaks = await Promise.all(streaksPromises);

    // Sort by current streak and add rank
    const sortedStreaks = streaks
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit)
      .map((streak, index) => ({ ...streak, rank: index + 1 }));

    return sortedStreaks;
  }

  /**
   * Calculate current and longest streak for a habit
   */
  async calculateCurrentStreak(habitId: string): Promise<{ current: number; longest: number }> {
    const { data: logs } = await this.supabase
      .from('habit_logs')
      .select('log_date, completed')
      .eq('habit_id', habitId)
      .eq('completed', true)
      .order('log_date', { ascending: false });

    if (!logs || logs.length === 0) {
      return { current: 0, longest: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 1); // Start from yesterday

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].log_date);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      const logDateStr = logDate.toISOString().split('T')[0];

      if (i === 0) {
        // Check if completed today
        const today = new Date().toISOString().split('T')[0];
        if (logDateStr === today || logDateStr === expectedDateStr) {
          currentStreak = 1;
          tempStreak = 1;
        }
      }

      if (logDateStr === expectedDateStr) {
        if (currentStreak > 0 || i === 0) {
          currentStreak++;
        }
        tempStreak++;

        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Streak broken
        if (currentStreak === 0 && tempStreak > 0) {
          // This was a past streak
          longestStreak = Math.max(longestStreak, tempStreak);
        }
        tempStreak = 1;
        expectedDate = new Date(logDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  /**
   * Helper to map database habit to our model
   */
  private mapHabitFromDB(dbHabit: any): Habit {
    return {
      id: dbHabit.id,
      userId: dbHabit.user_id,
      title: dbHabit.title,
      description: dbHabit.description,
      icon: dbHabit.icon,
      color: dbHabit.color,
      category: dbHabit.category,
      frequency: dbHabit.frequency,
      customDays: dbHabit.custom_days ? JSON.parse(dbHabit.custom_days) : undefined,
      timeOfDay: dbHabit.time_of_day,
      startDate: dbHabit.start_date,
      endDate: dbHabit.end_date,
      streakEnabled: dbHabit.streak_enabled,
      streakResetAfterMissingDays: dbHabit.streak_reset_after_missing_days,
      sortOrder: dbHabit.sort_order,
      archived: dbHabit.archived,
      createdAt: dbHabit.created_at,
      updatedAt: dbHabit.updated_at,
    };
  }

  /**
   * Get all habits for the current user
   */
  getHabits() {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    return this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
  }

  /**
   * Get a single habit by ID
   */
  getHabit(id: string) {
    return this.supabase.from('habits').select('*').eq('id', id).single();
  }

  /**
   * Update an existing habit
   */
  updateHabit(id: string, habit: Partial<Habit>) {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (habit.title) updateData.title = habit.title;
    if (habit.description !== undefined) updateData.description = habit.description;
    if (habit.frequency) updateData.frequency = habit.frequency;
    if (habit.startDate) updateData.start_date = habit.startDate;
    if (habit.endDate !== undefined) updateData.end_date = habit.endDate;
    if (habit.streakEnabled !== undefined) updateData.streak_enabled = habit.streakEnabled;

    return this.supabase.from('habits').update(updateData).eq('id', id).select().single();
  }

  /**
   * Delete a habit
   */
  deleteHabit(id: string) {
    return this.supabase.from('habits').delete().eq('id', id);
  }
}
