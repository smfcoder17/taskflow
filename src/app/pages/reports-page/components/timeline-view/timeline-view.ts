import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatmapDay } from '../../../../models/models';

@Component({
  selector: 'app-timeline-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-view.html',
  styleUrl: './timeline-view.css',
})
export class TimelineViewComponent {
  protected Math = Math;
  data = input<HeatmapDay[]>([]);
  
  // Prepare data for the chart - ensure chronological order
  chartData = computed(() => {
    return [...this.data()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Calculate average completion rate for the period
  averageRate = computed(() => {
    const list = this.data();
    if (!list.length) return 0;
    const total = list.reduce((sum, d) => sum + d.completionRate, 0);
    return Math.round(total / list.length);
  });
}
