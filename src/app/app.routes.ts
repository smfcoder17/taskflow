import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { AllHabitsPage } from './pages/all-habits-page/all-habits-page';
import { HabitFormPage } from './pages/habit-form-page/habit-form-page';
import { CalendarPage } from './pages/calendar-page/calendar-page';
import { ReportsPage } from './pages/reports-page/reports-page';
import { SettingsPage } from './pages/settings-page/settings-page';
import { LoginPage } from './pages/login-page/login-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard] },
  { path: 'all-habits', component: AllHabitsPage, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarPage, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsPage, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsPage, canActivate: [AuthGuard] },
  { path: 'add-habit', component: HabitFormPage, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },

  { path: 'login', component: LoginPage },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
