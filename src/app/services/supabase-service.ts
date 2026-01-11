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
  BehavioralInsights,
  DailyProgress,
  DEFAULT_SETTINGS,
  Habit,
  HabitAnalytics,
  HabitLog,
  HabitWithStats,
  HeatmapDay,
  Profile,
  StreakInfo,
  UserSettings,
  WeekComparison,
  WeeklyProgress,
} from '../models/models';
import { getDayOfWeek, weekDays } from '../models/utilities';
import { Router } from '@angular/router';
import id from '@angular/common/locales/id';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  isLoading = signal(true);
  session = signal<Session | null>(null);
  userSettings = signal<UserSettings>({ ...DEFAULT_SETTINGS });

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
        // Load user settings immediately after session is confirmed
        await this.getUserSettings();
      } else {
        console.log('ℹ️ No session found');
      }

      // Listen for auth state changes
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth event:', event);
        const previousSession = this.session();
        this.session.set(session);

        if (event === 'SIGNED_IN' && !previousSession && session) {
          // Load settings on sign in
          await this.getUserSettings();
          this.router.navigate(['/dashboard']);
        } else if (event === 'SIGNED_OUT' && previousSession && !session) {
          // Reset to defaults on sign out
          this.userSettings.set({ ...DEFAULT_SETTINGS });
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

  // ==================== User Settings ====================

  /**
   * Get user settings from the database.
   */
  async getUserSettings() {
    const user = this.session()?.user;
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      const mapped = this.mapUserSettingsFromDB(data);
      this.userSettings.set(mapped);
      return { data: mapped, error: null };
    }

    return { data: null, error };
  }

  /**
   * Update or create user settings in the database.
   * @param {Partial<UserSettings>} settings The settings to update.
   */
  async updateUserSettings(settings: Partial<UserSettings>) {
    const user = this.session()?.user;
    if (!user) return { error: 'Not authenticated' };

    const dbSettings = this.mapUserSettingsToDB(settings);
    dbSettings.user_id = user.id;
    dbSettings.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('user_settings')
      .upsert(dbSettings)
      .select()
      .single();

    if (data) {
      const mapped = this.mapUserSettingsFromDB(data);
      this.userSettings.set(mapped);
    }

    return { error };
  }

  /**
   * Helper to map database user settings to our model
   */
  private mapUserSettingsFromDB(dbSettings: any): UserSettings {
    return {
      id: dbSettings.id,
      userId: dbSettings.user_id,
      timezone: dbSettings.timezone,
      theme: dbSettings.theme,
      accentColor: dbSettings.accent_color,
      startOfWeek: dbSettings.start_of_week,
      defaultFrequency: dbSettings.default_frequency,
      defaultStartDateToday: dbSettings.default_start_date_today,
      notificationsEnabled: dbSettings.notifications_enabled,
      notificationMode: dbSettings.notification_mode,
      dailyReminderEnabled: dbSettings.daily_reminder_enabled,
      dailyReminderTime: dbSettings.daily_reminder_time,
      missedHabitReminderEnabled: dbSettings.missed_habit_reminder_enabled,
      missedHabitReminderTime: dbSettings.missed_habit_reminder_time,
      createdAt: dbSettings.created_at,
      updatedAt: dbSettings.updated_at,
    };
  }

  /**
   * Helper to map user settings model to database
   */
  private mapUserSettingsToDB(settings: Partial<UserSettings>): any {
    const dbSettings: any = {};
    if (settings.id) dbSettings.id = settings.id;
    if (settings.timezone) dbSettings.timezone = settings.timezone;
    if (settings.theme) dbSettings.theme = settings.theme;
    if (settings.accentColor) dbSettings.accent_color = settings.accentColor;
    if (settings.startOfWeek) dbSettings.start_of_week = settings.startOfWeek;
    if (settings.defaultFrequency) dbSettings.default_frequency = settings.defaultFrequency;
    if (settings.defaultStartDateToday !== undefined)
      dbSettings.default_start_date_today = settings.defaultStartDateToday;
    if (settings.notificationsEnabled !== undefined)
      dbSettings.notifications_enabled = settings.notificationsEnabled;
    if (settings.notificationMode) dbSettings.notification_mode = settings.notificationMode;
    if (settings.dailyReminderEnabled !== undefined)
      dbSettings.daily_reminder_enabled = settings.dailyReminderEnabled;
    if (settings.dailyReminderTime) dbSettings.daily_reminder_time = settings.dailyReminderTime;
    if (settings.missedHabitReminderEnabled !== undefined)
      dbSettings.missed_habit_reminder_enabled = settings.missedHabitReminderEnabled;
    if (settings.missedHabitReminderTime)
      dbSettings.missed_habit_reminder_time = settings.missedHabitReminderTime;
    return dbSettings;
  }

  /**
   * Export all user-related data (habits, logs, settings, profile).
   * TODO: Implement aggregation logic.
   * @returns {Promise<any>}
   */
  async exportUserData() {
    return {};
  }

  /**
   * Delete user account and associated data.
   * TODO: Implement secure deletion (cascade or RPC).
   * @returns {Promise<{error: any}>}
   */
  async deleteAccount() {
    return { error: null };
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
  async getHabitsForDate(date?: string) {
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
   * Get habit logs for a date range
   */
  async getHabitLogsForDateRange(startDate: string, endDate: string) {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    return this.supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .eq('completed', true);
  }

  // ==================== Advanced Analytics ====================

  /**
   * Get all analytics data in a single request to minimize DB calls.
   */
  async getFullReportsData(startDate: string, endDate: string) {
    const user = this.session()?.user;
    if (!user) throw new Error('User must be authenticated');

    // 1. Fetch Habits
    const { data: habits } = await this.getActiveHabits();
    if (!habits || habits.length === 0) {
      return {
        habitAnalytics: [],
        weekComparison: null,
        displayInsights: null,
        heatmapData: [],
        topStreaks: [],
      };
    }

    // 2. Fetch Logs (Batch fetch for efficiency)
    // Fetch logs for last 365 days to see enough history for comparison & reasonable streaks
    const yearStart = new Date();
    yearStart.setDate(yearStart.getDate() - 365);
    const dateLimit = yearStart.toISOString().split('T')[0];

    // Fetch all logs since limit
    const { data: allLogs } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', dateLimit)
      .order('log_date', { ascending: false });

    const logs = allLogs || [];

    // Filter logs for selected range
    const rangeLogs = logs.filter((l) => l.log_date >= startDate && l.log_date <= endDate);

    // --- Analytics ---
    const habitAnalytics: HabitAnalytics[] = habits.map((h) => {
      const hLogs = rangeLogs.filter((l) => l.habit_id === h.id);
      const consistency = this.calculateConsistencyScore(hLogs, startDate, endDate);

      // Best Day/Time
      const bestDay = this.getBestDay(hLogs);
      const bestTime = this.getBestTime(hLogs);

      const totalDays = Math.max(
        1,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)
        ) + 1
      );
      const rate = Math.round((hLogs.length / totalDays) * 100);

      return {
        habitId: h.id,
        habitTitle: h.title,
        icon: h.icon || '🎯',
        completionRate: rate,
        consistencyScore: consistency,
        totalCompletions: hLogs.length,
        bestDayOfWeek: bestDay,
        bestTimeOfDay: bestTime,
      };
    });

    // --- Week Comparison ---
    const comparison = this.calculateWeekComparison(habits.length, logs);

    // --- Insights ---
    const insights = this.calculateInsights(habitAnalytics);

    // --- Heatmap ---
    const heatmap = this.calculateHeatmap(habits.length, rangeLogs, startDate, endDate);

    // --- Streaks ---
    const topStreaks = this.calculateTopStreaks(habits, logs);

    return {
      habitAnalytics,
      weekComparison: comparison,
      displayInsights: insights,
      heatmapData: heatmap,
      topStreaks,
    };
  }

  /**
   * Get top streaks for habits (used by dashboard)
   */
  async getTopStreaks(limit: number = 3): Promise<StreakInfo[]> {
    const user = this.session()?.user;
    if (!user) return [];

    // Get active habits
    const { data: habits } = await this.getActiveHabits();
    if (!habits || habits.length === 0) return [];

    // Fetch logs for the last year
    const yearStart = new Date();
    yearStart.setDate(yearStart.getDate() - 365);
    const dateLimit = yearStart.toISOString().split('T')[0];

    const { data: allLogs } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', dateLimit)
      .order('log_date', { ascending: false });

    const logs = (allLogs || []).map((log: any) => ({
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

    return this.calculateTopStreaks(habits, logs, limit);
  }

  // --- Helper Methods (Synchronous) ---

  private calculateConsistencyScore(logs: HabitLog[], startDate: string, endDate: string): number {
    if (logs.length === 0) return 0;

    // Sort logs by date ascending
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
    );

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
    );

    const baseScore = (logs.length / totalDays) * 100;

    // Calculate gap penalty
    let penalty = 0;
    const penaltyWeight = 2;

    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = new Date(sortedLogs[i].logDate);
      const next = new Date(sortedLogs[i + 1].logDate);
      const diffTime = Math.abs(next.getTime() - current.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const gapLength = diffDays - 1;

      if (gapLength > 1) {
        penalty += (gapLength - 1) * penaltyWeight;
      }
    }

    return Math.max(0, Math.round(baseScore - penalty));
  }

  private getBestDay(logs: HabitLog[]) {
    if (logs.length === 0) return 'mon';
    const dayCounts = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
    logs.forEach((log) => {
      const day = getDayOfWeek(new Date(log.logDate));
      dayCounts[day]++;
    });
    return (Object.keys(dayCounts) as any[]).reduce((a, b) =>
      dayCounts[a as keyof typeof dayCounts] > dayCounts[b as keyof typeof dayCounts] ? a : b
    );
  }

  private getBestTime(logs: HabitLog[]) {
    if (logs.length === 0) return 'morning';
    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    logs.forEach((log) => {
      if (log.completedAt) {
        const hour = new Date(log.completedAt).getHours();
        if (hour >= 5 && hour < 12) timeCounts.morning++;
        else if (hour >= 12 && hour < 17) timeCounts.afternoon++;
        else if (hour >= 17 && hour < 22) timeCounts.evening++;
        else timeCounts.night++;
      }
    });
    return (Object.keys(timeCounts) as any[]).reduce((a, b) =>
      timeCounts[a as keyof typeof timeCounts] > timeCounts[b as keyof typeof timeCounts] ? a : b
    );
  }

  private calculateWeekComparison(habitCount: number, allLogs: HabitLog[]): WeekComparison {
    const today = new Date();

    // Last Week (Last 7 days)
    const lastWeekEnd = new Date(today);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6);
    const s1 = lastWeekStart.toISOString().split('T')[0];
    const e1 = lastWeekEnd.toISOString().split('T')[0];

    // Previous Week (7 days before that)
    const prevWeekEnd = new Date(today);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
    const prevWeekStart = new Date(today);
    prevWeekStart.setDate(prevWeekStart.getDate() - 13);
    const s2 = prevWeekStart.toISOString().split('T')[0];
    const e2 = prevWeekEnd.toISOString().split('T')[0];

    const currentLogs = allLogs.filter((l) => l.logDate >= s1 && l.logDate <= e1);
    const prevLogs = allLogs.filter((l) => l.logDate >= s2 && l.logDate <= e2);

    const currentCount = currentLogs.length;
    const prevCount = prevLogs.length;

    // Prevent div by zero
    const count = habitCount || 1;

    // Rate = completions / (7 days * habitCount)
    const currentRate = Math.round((currentCount / (7 * count)) * 100);
    const prevRate = Math.round((prevCount / (7 * count)) * 100);

    const change =
      prevCount === 0 ? 100 : Math.round(((currentCount - prevCount) / prevCount) * 100);

    return {
      currentWeek: {
        completions: currentCount,
        rate: currentRate,
        startDate: s1,
        endDate: e1,
      },
      lastWeek: {
        completions: prevCount,
        rate: prevRate,
        startDate: s2,
        endDate: e2,
      },
      change,
    };
  }

  private calculateInsights(analytics: HabitAnalytics[]): BehavioralInsights {
    if (analytics.length === 0) {
      return {
        bestDayOfWeek: { day: 'mon', completionRate: 0 },
        bestTimeOfDay: { period: 'morning', completionRate: 0 },
        averageConsistencyScore: 0,
        totalActiveHabits: 0,
      };
    }

    // Aggregate best day
    const dayCounts: Record<string, number> = {};
    analytics.forEach((a) => {
      dayCounts[a.bestDayOfWeek] = (dayCounts[a.bestDayOfWeek] || 0) + 1;
    });
    const bestDay = (Object.keys(dayCounts) as any[]).reduce((a, b) =>
      dayCounts[a] > dayCounts[b] ? a : b
    );

    // Aggregate best time
    const timeCounts: Record<string, number> = {};
    analytics.forEach((a) => {
      timeCounts[a.bestTimeOfDay] = (timeCounts[a.bestTimeOfDay] || 0) + 1;
    });
    const bestTime = (Object.keys(timeCounts) as any[]).reduce((a, b) =>
      timeCounts[a] > timeCounts[b] ? a : b
    );

    const avgConsistency =
      analytics.reduce((sum, a) => sum + a.consistencyScore, 0) / analytics.length;

    return {
      bestDayOfWeek: { day: bestDay as any, completionRate: 0 },
      bestTimeOfDay: { period: bestTime, completionRate: 0 },
      averageConsistencyScore: Math.round(avgConsistency),
      totalActiveHabits: analytics.length,
    };
  }

  private calculateHeatmap(
    totalHabits: number,
    rangeLogs: HabitLog[],
    startDate: string,
    endDate: string
  ): HeatmapDay[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: HeatmapDay[] = [];

    // Map logs by date
    const logsByDate: Record<string, number> = {};
    rangeLogs.forEach((l) => {
      logsByDate[l.logDate] = (logsByDate[l.logDate] || 0) + 1;
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const completedCount = logsByDate[dateStr] || 0;

      const rate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

      days.push({
        date: dateStr,
        completionRate: rate,
        completedCount: completedCount,
        totalScheduled: totalHabits,
      });
    }
    return days;
  }

  private calculateTopStreaks(habits: any[], allLogs: HabitLog[], limit = 3): StreakInfo[] {
    const streakInfos = habits.map((h) => {
      const hLogs = allLogs.filter((l) => l.habitId === h.id);
      // Note: allLogs is already sorted desc by date
      // But let's ensure it for streak calc

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let safeLogs = [...hLogs].sort(
        (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
      );

      if (safeLogs.length > 0) {
        let expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - 1); // Start checking from yesterday

        // Check today first
        const todayStr = new Date().toISOString().split('T')[0];
        const firstLogDate = safeLogs[0].logDate;

        let startIndex = 0;

        if (firstLogDate === todayStr) {
          currentStreak = 1;
          tempStreak = 1;
          // expected is yesterday
        } else if (firstLogDate === expectedDate.toISOString().split('T')[0]) {
          currentStreak = 1;
          tempStreak = 1;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          // No streak active today or yesterday
          currentStreak = 0;
          // We still calculate longest
          // Reset expected to first log date for longest calc
          expectedDate = new Date(firstLogDate);
          expectedDate.setDate(expectedDate.getDate() - 1);
          tempStreak = 1;
          longestStreak = 1;
        }

        startIndex = firstLogDate === todayStr ? 1 : 0;

        for (let i = startIndex; i < safeLogs.length; i++) {
          const lDate = safeLogs[i].logDate;
          // Skip if it's the one we processed (only if startIndex 0 and we didn't handle header)
          // Logic is tricky. Let's simplify:
          // Just iterate and track gaps.
        }

        // Simplified Streak Logic (Robust)
        // 1. Get unique sorted dates descending
        const dates = Array.from(new Set(safeLogs.map((l) => l.logDate))).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );

        if (dates.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let current = 0;
          const mostRecent = dates[0];

          if (mostRecent === today || mostRecent === yesterdayStr) {
            current = 1;
            let ptr = 0;
            if (dates[ptr] === today) ptr++; // move to next expected

            // Check consecutive days
            let checkDate = new Date(mostRecent === today ? today : yesterdayStr);
            checkDate.setDate(checkDate.getDate() - 1);

            while (ptr < dates.length) {
              if (dates[ptr] === checkDate.toISOString().split('T')[0]) {
                current++;
                checkDate.setDate(checkDate.getDate() - 1);
                ptr++;
              } else if (dates[ptr] > checkDate.toISOString().split('T')[0]) {
                // Duplicate or weirdness, ignore
                ptr++;
              } else {
                // Gap
                break;
              }
            }
          }
          currentStreak = current;

          // Longest (Naive O(N))
          // ...
          longestStreak = Math.max(longestStreak, currentStreak);
          // TODO: Full scan for longest. For now assuming current is what we want mostly.
        }
      }

      return {
        habitId: h.id,
        habitTitle: h.title,
        icon: h.icon || '🎯',
        currentStreak,
        longestStreak, // Placeholder or need full logic
        rank: 0,
      };
    });

    return streakInfos
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit)
      .map((s, i) => ({ ...s, rank: i + 1 }));
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
   * Get all habits for the current user with mapped fields
   */
  async getHabits() {
    const user = this.session()?.user;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    return {
      data: (data || []).map((h) => this.mapHabitFromDB(h)),
      error: null,
    };
  }

  /**
   * Get a single habit by ID with mapped fields
   */
  async getHabitById(id: string) {
    const { data, error } = await this.supabase.from('habits').select('*').eq('id', id).single();

    if (error) return { data: null, error };

    return { data: this.mapHabitFromDB(data), error: null };
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
    if (habit.icon) updateData.icon = habit.icon;
    if (habit.color) updateData.color = habit.color;
    if (habit.category) updateData.category = habit.category;
    if (habit.frequency) updateData.frequency = habit.frequency;
    if (habit.customDays !== undefined)
      updateData.custom_days = habit.customDays ? JSON.stringify(habit.customDays) : null;
    if (habit.timeOfDay !== undefined) updateData.time_of_day = habit.timeOfDay;
    if (habit.startDate) updateData.start_date = habit.startDate;
    if (habit.endDate !== undefined) updateData.end_date = habit.endDate;
    if (habit.streakEnabled !== undefined) updateData.streak_enabled = habit.streakEnabled;
    if (habit.streakResetAfterMissingDays !== undefined)
      updateData.streak_reset_after_missing_days = habit.streakResetAfterMissingDays;
    if (habit.sortOrder !== undefined) updateData.sort_order = habit.sortOrder;
    if (habit.archived !== undefined) updateData.archived = habit.archived;

    return this.supabase.from('habits').update(updateData).eq('id', id).select().single();
  }

  /**
   * Delete a habit
   */
  deleteHabit(id: string) {
    return this.supabase.from('habits').delete().eq('id', id);
  }
}
