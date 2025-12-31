import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../../models/models';

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  // Settings state
  settings = signal<UserSettings>({ ...DEFAULT_USER_SETTINGS });

  // UI state
  isLoading = signal(true);
  isSaving = signal(false);
  showDeleteModal = signal(false);
  showToast = signal(false);
  toastMessage = signal('');

  // User info
  userEmail = signal<string>('');

  // Accent color options
  accentColors = [
    { name: 'Green', value: '#13ec5b' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  async ngOnInit() {
    await this.loadUserData();
    this.loadSettings();
  }

  private async loadUserData() {
    const session = this.supabaseService.session();
    if (session?.user?.email) {
      this.userEmail.set(session.user.email);
    }
  }

  private loadSettings() {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings.set({ ...DEFAULT_USER_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('userSettings', JSON.stringify(this.settings()));
      this.showSuccessToast('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showSuccessToast('Failed to save settings');
    }
  }

  private showSuccessToast(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  // Update methods
  updateTheme(theme: 'dark' | 'light' | 'system') {
    this.settings.update((s) => ({ ...s, theme }));
    this.saveSettings();
  }

  updateAccentColor(color: string) {
    this.settings.update((s) => ({ ...s, accentColor: color }));
    this.saveSettings();
  }

  toggleNotifications() {
    this.settings.update((s) => ({
      ...s,
      notificationsEnabled: !s.notificationsEnabled,
    }));
    this.saveSettings();
  }

  updateReminderTime(event: Event) {
    const time = (event.target as HTMLInputElement).value;
    this.settings.update((s) => ({ ...s, reminderTime: time }));
    this.saveSettings();
  }

  toggleEmailNotifications() {
    this.settings.update((s) => ({
      ...s,
      emailNotifications: !s.emailNotifications,
    }));
    this.saveSettings();
  }

  toggleShowStreak() {
    this.settings.update((s) => ({ ...s, showStreak: !s.showStreak }));
    this.saveSettings();
  }

  updateProfileVisibility(visibility: 'public' | 'private') {
    this.settings.update((s) => ({ ...s, profileVisibility: visibility }));
    this.saveSettings();
  }

  updateWeekStartsOn(day: 'sunday' | 'monday') {
    this.settings.update((s) => ({ ...s, weekStartsOn: day }));
    this.saveSettings();
  }

  updateDateFormat(format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') {
    this.settings.update((s) => ({ ...s, dateFormat: format }));
    this.saveSettings();
  }

  // Actions
  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }

  exportData() {
    // Export user data as JSON
    const data = {
      settings: this.settings(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showSuccessToast('Data exported successfully');
  }

  openDeleteModal() {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
  }

  async confirmDeleteAccount() {
    // For now, just sign out and show message
    // Full account deletion would require backend support
    this.showSuccessToast('Account deletion requested. Contact support.');
    this.closeDeleteModal();
    await this.signOut();
  }
}
