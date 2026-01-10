import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase-service';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  })),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let supabaseMock: any;
  let routerMock: any;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [SupabaseService, { provide: Router, useValue: routerMock }],
    });

    service = TestBed.inject(SupabaseService);
    // Get the mock instance created by the first call to createClient
    supabaseMock = vi.mocked(createClient).mock.results[0].value;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Settings', () => {
    const mockUser = { id: 'user-123' };
    const mockDbSettings = {
      id: 'settings-123',
      user_id: 'user-123',
      timezone: 'UTC',
      theme: 'dark',
      accent_color: 'green',
      start_of_week: 'monday',
      default_frequency: 'daily',
      default_start_date_today: true,
      notifications_enabled: true,
      notification_mode: 'Balanced',
      daily_reminder_enabled: false,
      daily_reminder_time: '09:00',
      missed_habit_reminder_enabled: false,
      missed_habit_reminder_time: '20:00',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    };

    it('should get user settings successfully', async () => {
      // Set session manually via signal
      service.session.set({ user: mockUser } as any);

      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbSettings, error: null }),
      };
      supabaseMock.from.mockReturnValue(fromMock);

      const result = await service.getUserSettings();

      expect(supabaseMock.from).toHaveBeenCalledWith('user_settings');
      expect(result.data?.userId).toBe('user-123');
      expect(result.data?.theme).toBe('dark');
      expect(service.userSettings().theme).toBe('dark');
    });

    it('should return error if not authenticated for getUserSettings', async () => {
      service.session.set(null);
      const result = await service.getUserSettings();
      expect(result.error).toBe('Not authenticated');
    });

    it('should update user settings successfully', async () => {
      service.session.set({ user: mockUser } as any);

      const updateSettings = { theme: 'light' as const };
      const fromMock = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockDbSettings, theme: 'light' },
          error: null,
        }),
      };
      supabaseMock.from.mockReturnValue(fromMock);

      const result = await service.updateUserSettings(updateSettings);

      expect(supabaseMock.from).toHaveBeenCalledWith('user_settings');
      expect(result.error).toBeNull();
      expect(service.userSettings().theme).toBe('light');
    });

    it('should map user settings correctly when updating', async () => {
      service.session.set({ user: mockUser } as any);

      const updateSettings = {
        theme: 'light' as const,
        accentColor: 'blue',
        notificationsEnabled: false,
      };
      const fromMock = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            ...mockDbSettings,
            ...updateSettings,
            accent_color: 'blue',
            notifications_enabled: false,
          },
          error: null,
        }),
      };
      supabaseMock.from.mockReturnValue(fromMock);

      await service.updateUserSettings(updateSettings);

      const upsertCall = fromMock.upsert.mock.calls[0][0];
      expect(upsertCall.theme).toBe('light');
      expect(upsertCall.accent_color).toBe('blue');
      expect(upsertCall.notifications_enabled).toBe(false);
      expect(upsertCall.user_id).toBe(mockUser.id);
    });

    it('should return error if not authenticated for updateUserSettings', async () => {
      service.session.set(null);
      const result = await service.updateUserSettings({ theme: 'dark' });
      expect(result.error).toBe('Not authenticated');
    });

    it('should handle error from database when getting settings', async () => {
      service.session.set({ user: mockUser } as any);

      const dbError = { message: 'Database error' };
      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      };
      supabaseMock.from.mockReturnValue(fromMock);

      const result = await service.getUserSettings();

      expect(result.error).toBe(dbError);
      expect(result.data).toBeNull();
    });
  });
});
