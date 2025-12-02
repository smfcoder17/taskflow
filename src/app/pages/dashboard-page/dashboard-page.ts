import { Component, signal } from '@angular/core';

interface Habit {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  habits = signal<Habit[]>([
    { id: 1, title: 'Morning Run', completed: false, progress: 40 },
    { id: 2, title: 'Read 30 min', completed: true, progress: 100 },
    { id: 3, title: 'Meditation', completed: false, progress: 20 },
  ]);

  toggleHabit(id: number) {
    this.habits.update((list) =>
      list.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  }
}
