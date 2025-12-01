import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  path: string;
  icon: string;
  name: string;
}

@Component({
  selector: 'app-sidebar-component',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
})
export class SidebarComponent {
  navLinks = signal<NavLink[]>([
    { path: '/dashboard', icon: 'grid_view', name: 'Dashboard' },
    { path: '/all-habits', icon: 'checklist', name: 'All Habits' },
    { path: '/calendar', icon: 'calendar_today', name: 'Calendar' },
    { path: '/reports', icon: 'bar_chart', name: 'Reports' },
    { path: '/settings', icon: 'settings', name: 'Settings' },
  ]);
}
