import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase-service';
import {
  BehavioralInsights,
  HabitAnalytics,
  HeatmapDay,
  StreakInfo,
  WeekComparison,
} from '../../models/models';
import { TimelineViewComponent } from './components/timeline-view/timeline-view';
import { CalendarHeatmapComponent } from './components/calendar-heatmap/calendar-heatmap';
import { HabitBreakdownComponent } from './components/habit-breakdown/habit-breakdown';
import { InsightsPanelComponent } from './components/insights-panel/insights-panel';
import { OverviewStatsComponent } from './components/overview-stats/overview-stats';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    TimelineViewComponent,
    CalendarHeatmapComponent,
    HabitBreakdownComponent,
    InsightsPanelComponent,
    OverviewStatsComponent,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage {
  private supabase = inject(SupabaseService);

  // State
  isLoading = signal(true);
  selectedRange = signal<'7d' | '30d' | '90d'>('30d');

  // Data State
  habitAnalytics = signal<HabitAnalytics[]>([]);
  weekComparison = signal<WeekComparison | null>(null);
  displayInsights = signal<BehavioralInsights | null>(null);
  heatmapData = signal<HeatmapDay[]>([]);
  topStreaks = signal<StreakInfo[]>([]); // Adding streaks

  // Computed Date Range
  dateRange = computed(() => {
    const end = new Date();
    const start = new Date();
    const range = this.selectedRange();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

    // Use setDate to go back in time
    start.setDate(start.getDate() - days);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

  dateRangeLabel = computed(() => {
    const { start, end } = this.dateRange();
    const s = new Date(start);
    const e = new Date(end);
    // Format: "Jan 1 - Jan 30, 2026"
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  });

  constructor() {
    // Reload when date range changes
    effect(() => {
      const { start, end } = this.dateRange();
      this.loadData(start, end);
    });
  }

  async loadData(start: string, end: string) {
    this.isLoading.set(true);
    try {
      const data = await this.supabase.getFullReportsData(start, end);

      this.habitAnalytics.set(data.habitAnalytics);
      this.weekComparison.set(data.weekComparison);
      this.displayInsights.set(data.displayInsights);
      this.heatmapData.set(data.heatmapData);
      this.topStreaks.set(data.topStreaks);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setRange(range: '7d' | '30d' | '90d') {
    this.selectedRange.set(range);
  }
}
