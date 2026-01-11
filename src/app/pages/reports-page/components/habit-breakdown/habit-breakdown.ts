import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitAnalytics } from '../../../../models/models';

@Component({
  selector: 'app-habit-breakdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-breakdown.html',
  styleUrl: './habit-breakdown.css',
})
export class HabitBreakdownComponent {
  habitAnalytics = input<HabitAnalytics[]>([]);
}
