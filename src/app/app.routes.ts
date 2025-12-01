import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { AllHabits } from './pages/all-habits/all-habits';
import { HabitForm } from './pages/habit-form/habit-form';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'all-habits', component: AllHabits },
  //   { path: 'calendar', component: CalendarComponent },
  //   { path: 'reports', component: ReportsComponent },
  //   { path: 'settings', component: SettingsComponent },
  { path: 'add-habit', component: HabitForm },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
