import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { AllHabitsPage } from './pages/all-habits-page/all-habits-page';
import { HabitFormPage } from './pages/habit-form-page/habit-form-page';
import { CalendarPage } from './pages/calendar-page/calendar-page';
import { ReportsPage } from './pages/reports-page/reports-page';
import { SettingsPage } from './pages/settings-page/settings-page';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardPage },
  { path: 'all-habits', component: AllHabitsPage },
  { path: 'calendar', component: CalendarPage },
  { path: 'reports', component: ReportsPage },
  { path: 'settings', component: SettingsPage },
  { path: 'add-habit', component: HabitFormPage },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
