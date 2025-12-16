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
import { Habit, Profile } from '../models/models';
import { Router } from '@angular/router';

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
        console.log('✅ Session found:', data.session.user.email);
        this.session.set(data.session);
      } else {
        console.log('ℹ️ No session found');
      }

      // Listen for auth state changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth event:', event, session?.user?.email || 'null');
        this.session.set(session);

        if (event === 'SIGNED_IN' && session) {
          this.router.navigate(['/dashboard']);
        } else if (event === 'SIGNED_OUT') {
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
      description: habit.description,
      frequency: habit.frequency,
      start_date: habit.startDate,
      end_date: habit.endDate,
      streak_enabled: habit.streakEnabled,
    };

    return this.supabase.from('habits').insert(habitData).select().single();
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
