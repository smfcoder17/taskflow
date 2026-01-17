import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehavioralInsights, WeekComparison } from '../../../../models/models';

@Component({
  selector: 'app-insights-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights-panel.html',
  styleUrl: './insights-panel.css',
})
export class InsightsPanelComponent {
  protected Math = Math;
  insights = input<BehavioralInsights | null>(null);
  weekComparison = input<WeekComparison | null>(null);

  // Helper for change indicator
  getChangeClass(change: number | undefined) {
    if (change === undefined) return 'text-text-dark-secondary';
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-text-dark-secondary';
  }

  getChangeIcon(change: number | undefined) {
    if (change === undefined || change === 0) return 'remove';
    return change > 0 ? 'trending_up' : 'trending_down';
  }
}
