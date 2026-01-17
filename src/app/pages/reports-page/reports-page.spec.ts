import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsPage } from './reports-page';
import { SupabaseService } from '../../services/supabase-service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('ReportsPage', () => {
  let component: ReportsPage;
  let fixture: ComponentFixture<ReportsPage>;
  let supabaseMock: any;

  beforeEach(async () => {
    supabaseMock = {
      getFullReportsData: vi.fn().mockResolvedValue({
        habitAnalytics: [],
        weekComparison: {
          currentWeek: { rate: 50 },
          lastWeek: { rate: 40 },
          change: 10,
        },
        displayInsights: { totalActiveHabits: 5 },
        heatmapData: [],
        topStreaks: [],
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [{ provide: SupabaseService, useValue: supabaseMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(supabaseMock.getFullReportsData).toHaveBeenCalled();
  });

  it('should update range', () => {
    component.setRange('7d');
    fixture.detectChanges();
    expect(component.selectedRange()).toBe('7d');
  });
});
