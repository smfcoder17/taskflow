import { Component, computed, effect, inject, model, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { CanComponentDeactivate } from '../../guards/can-deactivate.guard';
import {
  AccentColor,
  AccentColorOption,
  AccentColorOptions,
  DEFAULT_SETTINGS,
  HabitFrequency,
  StartOfWeek,
  ThemeMode,
  UserSettings,
} from '../../models/models';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: string;
}

interface StartOfWeekOption {
  value: StartOfWeek;
  label: string;
}

interface ToastMessage {
  type: 'success' | 'error';
  text: string;
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage implements OnInit, CanComponentDeactivate {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  // App info
  appVersion = '1.0.0';

  // Loading states
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // User info
  userName = signal<string>('');
  userEmail = signal<string>('');

  // Settings state (derived from SupabaseService)
  private originalSettings: UserSettings = { ...DEFAULT_SETTINGS };

  // Reactive settings signal shared with App component
  userSettings = this.supabaseService.userSettings;

  // Two-way binding model for timezone select
  timezoneModel = model(this.userSettings().timezone);

  // UI state
  showDeleteModal = signal<boolean>(false);
  toastMessage = signal<ToastMessage | null>(null);
  deleteConfirmInput = '';

  // Options - Simplified UTC offset timezones
  timezones: string[] = [
    'UTC-12:00',
    'UTC-11:00',
    'UTC-10:00',
    'UTC-09:00',
    'UTC-08:00',
    'UTC-07:00',
    'UTC-06:00',
    'UTC-05:00',
    'UTC-04:00',
    'UTC-03:00',
    'UTC-02:00',
    'UTC-01:00',
    'UTC+00:00',
    'UTC+01:00',
    'UTC+02:00',
    'UTC+03:00',
    'UTC+04:00',
    'UTC+05:00',
    'UTC+05:30',
    'UTC+06:00',
    'UTC+07:00',
    'UTC+08:00',
    'UTC+09:00',
    'UTC+09:30',
    'UTC+10:00',
    'UTC+11:00',
    'UTC+12:00',
    'UTC+13:00',
    'UTC+14:00',
  ];

  themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
    { value: 'system', label: 'System', icon: 'desktop_windows' },
  ];

  accentColors: AccentColorOption[] = AccentColorOptions;

  startOfWeekOptions: StartOfWeekOption[] = [
    { value: 'monday', label: 'Monday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  constructor() {
    // Note: The theme/accent application effect is handled globally in App component (app.ts)
  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm(
        'You have unsaved changes. Do you want to leave this page?\n\nClick OK to discard changes or Cancel to stay.'
      );
    }
    return true;
  }

  async ngOnInit() {
    await this.loadSettings();
  }

  // Change detection
  hasUnsavedChanges = computed(() => {
    const current = this.userSettings();
    const original = this.originalSettings;

    // Direct comparison of relevant fields
    return (
      current.timezone !== original.timezone ||
      current.theme !== original.theme ||
      current.accentColor !== original.accentColor ||
      current.startOfWeek !== original.startOfWeek ||
      current.defaultFrequency !== original.defaultFrequency ||
      current.defaultStartDateToday !== original.defaultStartDateToday ||
      current.notificationsEnabled !== original.notificationsEnabled ||
      current.dailyReminderEnabled !== original.dailyReminderEnabled ||
      current.dailyReminderTime !== original.dailyReminderTime ||
      current.missedHabitReminderEnabled !== original.missedHabitReminderEnabled ||
      current.missedHabitReminderTime !== original.missedHabitReminderTime
    );
  });

  async loadSettings() {
    this.isLoading.set(true);
    try {
      // Get user info from session
      const session = this.supabaseService.session();
      if (session?.user) {
        this.userEmail.set(session.user.email || '');
        this.userName.set(
          session.user.user_metadata?.['full_name'] || session.user.email?.split('@')[0] || ''
        );
      }

      // Load settings from Supabase
      await this.supabaseService.getUserSettings();

      this.originalSettings = { ...this.userSettings() };

      // Sync timezone model with loaded settings
      this.timezoneModel.set(this.userSettings().timezone);
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showToast('error', 'Failed to load settings');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Helper to update specific fields in the shared userSettings signal */
  private updateSettings(updates: Partial<UserSettings>) {
    this.userSettings.update((current) => ({ ...current, ...updates }));
  }

  // Preference setters
  setTimezone(tz: string) {
    this.updateSettings({ timezone: tz });
    this.timezoneModel.set(tz);
  }

  setTheme(theme: ThemeMode) {
    this.updateSettings({ theme });
  }

  setAccentColor(color: AccentColor) {
    this.updateSettings({ accentColor: color });
  }

  setStartOfWeek(day: StartOfWeek) {
    this.updateSettings({ startOfWeek: day });
  }

  // Default habit settings
  setDefaultFrequency(freq: HabitFrequency) {
    this.updateSettings({ defaultFrequency: freq });
  }

  toggleDefaultStartDateToday() {
    this.updateSettings({ defaultStartDateToday: !this.userSettings().defaultStartDateToday });
  }

  // Notifications
  toggleNotifications() {
    this.updateSettings({ notificationsEnabled: !this.userSettings().notificationsEnabled });
  }

  toggleDailyReminder() {
    this.updateSettings({ dailyReminderEnabled: !this.userSettings().dailyReminderEnabled });
  }

  setDailyReminderTime(time: string) {
    this.updateSettings({ dailyReminderTime: time });
  }

  toggleMissedHabitReminder() {
    this.updateSettings({
      missedHabitReminderEnabled: !this.userSettings().missedHabitReminderEnabled,
    });
  }

  setMissedHabitReminderTime(time: string) {
    this.updateSettings({ missedHabitReminderTime: time });
  }

  // Actions
  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      this.showToast('error', 'Failed to sign out');
    }
  }

  async saveChanges() {
    this.isSaving.set(true);
    try {
      const { error } = await this.supabaseService.updateUserSettings(this.userSettings());

      if (error) {
        throw error;
      }

      this.originalSettings = { ...this.userSettings() };
      this.showToast('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showToast('error', 'Failed to save settings');
    } finally {
      this.isSaving.set(false);
    }
  }

  discardChanges() {
    // Reset to original settings loaded from DB
    this.userSettings.update(() => ({ ...this.originalSettings }));
    this.showToast('success', 'Changes discarded');
  }

  async exportData(format: 'json' | 'csv') {
    try {
      // TODO: Call this.supabaseService.exportUserData() when implemented
      this.showToast('success', `Exporting data as ${format.toUpperCase()} (Simulated)...`);
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('error', 'Failed to export data');
    }
  }

  clearLocalCache() {
    try {
      localStorage.clear();
      this.showToast('success', 'Local cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.showToast('error', 'Failed to clear cache');
    }
  }

  // Delete account modal
  openDeleteAccountModal() {
    this.deleteConfirmInput = '';
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteConfirmInput = '';
  }

  async confirmDeleteAccount() {
    if (this.deleteConfirmInput !== 'DELETE') return;

    try {
      // TODO: Call this.supabaseService.deleteAccount() when implemented
      this.showToast('success', 'Account deleted (Simulated)');
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error deleting account:', error);
      this.showToast('error', 'Failed to delete account');
    }
  }

  // Toast helper
  private showToast(type: 'success' | 'error', text: string) {
    this.toastMessage.set({ type, text });
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
