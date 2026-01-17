import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakInfo, WeekComparison } from '../../../../models/models';

@Component({
  selector: 'app-overview-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview-stats.html',
  styleUrl: './overview-stats.css',
})
export class OverviewStatsComponent {
  protected Math = Math;
  totalHabits = input<number>(0);
  completionRate = input<number>(0);
  topStreaks = input<StreakInfo[]>([]);
  weekComparison = input<WeekComparison | null>(null);
  dateLabel = input<string>('');
}
