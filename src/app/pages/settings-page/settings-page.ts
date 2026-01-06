import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
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

  // Settings state (derived from SupabaseService)
  private originalSettings: UserSettings = { ...DEFAULT_SETTINGS };

  // Reactive settings signal shared with App component
  userSettings = this.supabaseService.userSettings;

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

  constructor() {
    // Note: The theme/accent application effect is handled globally in App component (app.ts)
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
      current.streakGracePeriodEnabled !== original.streakGracePeriodEnabled ||
      current.streakGracePeriodDays !== original.streakGracePeriodDays ||
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

      // Placeholder: In the future, load from Supabase here
      // For now, we use the value already in the service signal

      this.originalSettings = { ...this.userSettings() };
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
    this.updateSettings({ missedHabitReminderEnabled: !this.userSettings().missedHabitReminderEnabled });
  }

  setMissedHabitReminderTime(time: string) {
    this.updateSettings({ missedHabitReminderTime: time });
  }

  // Notification Channels
  togglePushEnabled() {
    this.updateSettings({ pushEnabled: !this.userSettings().pushEnabled });
  }

  toggleEmailEnabled() {
    this.updateSettings({ emailEnabled: !this.userSettings().emailEnabled });
  }

  togglePersistentNotifications() {
    this.updateSettings({ persistentNotifications: !this.userSettings().persistentNotifications });
  }

  // Interface Customization


  setHabitOrdering(ordering: 'alphabetical' | 'category' | 'streak' | 'recent') {
    this.updateSettings({ habitOrdering: ordering });
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
      // TODO: Call updateUserSettings(this.userSettings()) when implemented in SupabaseService
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
