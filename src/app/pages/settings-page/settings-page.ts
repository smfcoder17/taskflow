import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import {
  AccentColor,
  AccentColorOption,
  AccentColorOptions,
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

/** Default settings for new users */
const DEFAULT_SETTINGS: UserSettings = {
  userId: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  theme: 'system',
  accentColor: 'green',
  startOfWeek: 'monday',
  streakGracePeriodEnabled: false,
  streakGracePeriodDays: 1,
  defaultFrequency: 'daily',
  defaultStartDateToday: true,
  notificationsEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderTime: '09:00',
  missedHabitReminderEnabled: false,
  missedHabitReminderTime: '20:00',
};

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage implements OnInit {
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

  // Single settings signal
  userSettings = signal<UserSettings>({ ...DEFAULT_SETTINGS });

  // Original settings for change detection
  private originalSettings: UserSettings = { ...DEFAULT_SETTINGS };

  // Computed properties for template bindings
  selectedTimezone = computed(() => this.userSettings().timezone);
  selectedTheme = computed(() => this.userSettings().theme);
  selectedAccentColor = computed(() => this.userSettings().accentColor);
  selectedStartOfWeek = computed(() => this.userSettings().startOfWeek);
  gracePeriodEnabled = computed(() => this.userSettings().streakGracePeriodEnabled);
  gracePeriodDays = computed(() => this.userSettings().streakGracePeriodDays);
  defaultFrequency = computed(() => this.userSettings().defaultFrequency);
  defaultStartDateToday = computed(() => this.userSettings().defaultStartDateToday);
  notificationsEnabled = computed(() => this.userSettings().notificationsEnabled);
  dailyReminderEnabled = computed(() => this.userSettings().dailyReminderEnabled);
  dailyReminderTime = computed(() => this.userSettings().dailyReminderTime);
  missedHabitReminderEnabled = computed(() => this.userSettings().missedHabitReminderEnabled);
  missedHabitReminderTime = computed(() => this.userSettings().missedHabitReminderTime);

  // Change detection
  hasUnsavedChanges = computed(() => {
    const current = this.userSettings();
    return (
      current.timezone !== this.originalSettings.timezone ||
      current.theme !== this.originalSettings.theme ||
      current.accentColor !== this.originalSettings.accentColor ||
      current.startOfWeek !== this.originalSettings.startOfWeek ||
      current.streakGracePeriodEnabled !== this.originalSettings.streakGracePeriodEnabled ||
      current.streakGracePeriodDays !== this.originalSettings.streakGracePeriodDays ||
      current.defaultFrequency !== this.originalSettings.defaultFrequency ||
      current.defaultStartDateToday !== this.originalSettings.defaultStartDateToday ||
      current.notificationsEnabled !== this.originalSettings.notificationsEnabled ||
      current.dailyReminderEnabled !== this.originalSettings.dailyReminderEnabled ||
      current.dailyReminderTime !== this.originalSettings.dailyReminderTime ||
      current.missedHabitReminderEnabled !== this.originalSettings.missedHabitReminderEnabled ||
      current.missedHabitReminderTime !== this.originalSettings.missedHabitReminderTime
    );
  });

  // UI state
  showDeleteModal = signal<boolean>(false);
  toastMessage = signal<ToastMessage | null>(null);
  deleteConfirmInput = '';

  // Options
  timezones: string[] = Intl.supportedValuesOf('timeZone');

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

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.isLoading.set(true);
    try {
      // Get user email from session
      const session = this.supabaseService.session();
      if (session?.user) {
        this.userEmail.set(session.user.email || '');
        this.userName.set(
          session.user.user_metadata?.['full_name'] || session.user.email?.split('@')[0] || ''
        );

        // Set userId in settings
        this.updateSettings({ userId: session.user.id });
      }

      // TODO: Load user settings from Supabase when backend is implemented
      // For now, use defaults and store as original
      this.originalSettings = { ...this.userSettings() };
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showToast('error', 'Failed to load settings');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Helper to update specific fields in userSettings */
  private updateSettings(updates: Partial<UserSettings>) {
    this.userSettings.update((current) => ({ ...current, ...updates }));
  }

  // Preference setters
  setTimezone(tz: string) {
    this.updateSettings({ timezone: tz });
  }

  setTheme(theme: ThemeMode) {
    this.updateSettings({ theme });
    // TODO: Apply theme preview
  }

  setAccentColor(color: AccentColor) {
    this.updateSettings({ accentColor: color });
    // TODO: Apply accent color preview
  }

  setStartOfWeek(day: StartOfWeek) {
    this.updateSettings({ startOfWeek: day });
  }

  // Streak behavior
  toggleGracePeriod() {
    this.updateSettings({ streakGracePeriodEnabled: !this.gracePeriodEnabled() });
  }

  setGracePeriodDays(days: string) {
    this.updateSettings({ streakGracePeriodDays: parseInt(days, 10) });
  }

  // Default habit settings
  setDefaultFrequency(freq: HabitFrequency) {
    this.updateSettings({ defaultFrequency: freq });
  }

  toggleDefaultStartDateToday() {
    this.updateSettings({ defaultStartDateToday: !this.defaultStartDateToday() });
  }

  // Notifications
  toggleNotifications() {
    this.updateSettings({ notificationsEnabled: !this.notificationsEnabled() });
  }

  toggleDailyReminder() {
    this.updateSettings({ dailyReminderEnabled: !this.dailyReminderEnabled() });
  }

  setDailyReminderTime(time: string) {
    this.updateSettings({ dailyReminderTime: time });
  }

  toggleMissedHabitReminder() {
    this.updateSettings({ missedHabitReminderEnabled: !this.missedHabitReminderEnabled() });
  }

  setMissedHabitReminderTime(time: string) {
    this.updateSettings({ missedHabitReminderTime: time });
  }

  // Actions
  openEditProfile() {
    this.router.navigate(['/profile']);
  }

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
      // TODO: Save settings to Supabase when backend is implemented
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

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
    this.userSettings.set({ ...this.originalSettings });
  }

  async exportData(format: 'json' | 'csv') {
    try {
      // TODO: Implement export via SupabaseService
      this.showToast('success', `Exporting data as ${format.toUpperCase()}...`);
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
      // TODO: Implement account deletion via SupabaseService
      this.showToast('success', 'Account deleted');
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
