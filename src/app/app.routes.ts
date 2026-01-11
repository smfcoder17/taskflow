import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { AllHabitsPage } from './pages/all-habits-page/all-habits-page';
import { HabitFormPage } from './pages/habit-form-page/habit-form-page';
import { CalendarPage } from './pages/calendar-page/calendar-page';
import { ReportsPage } from './pages/reports-page/reports-page';
import { SettingsPage } from './pages/settings-page/settings-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './guards/auth.guard';
import { canDeactivateGuard } from './guards/can-deactivate.guard';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: 'all-habits', component: AllHabitsPage, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarPage, canActivate: [authGuard] },
  { path: 'reports', component: ReportsPage, canActivate: [authGuard] },
  {
    path: 'settings',
    component: SettingsPage,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard],
  },
  { path: 'habit/new', component: HabitFormPage, canActivate: [authGuard] },
  { path: 'habit/edit/:id', component: HabitFormPage, canActivate: [authGuard] },

  { path: 'login', component: LoginPage },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
