import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatmapDay } from '../../../../models/models';

@Component({
  selector: 'app-calendar-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-heatmap.html',
  styleUrl: './calendar-heatmap.css',
})
export class CalendarHeatmapComponent {
  heatmapData = input<HeatmapDay[]>([]);
}
