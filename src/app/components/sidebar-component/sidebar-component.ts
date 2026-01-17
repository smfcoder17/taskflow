import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavLink {
  path: string;
  icon: string;
  name: string;
}

@Component({
  selector: 'app-sidebar-component',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
})
export class SidebarComponent {
  navLinks = signal<NavLink[]>([
    { path: '/dashboard', icon: 'grid_view', name: 'Dashboard' },
    { path: '/all-habits', icon: 'checklist', name: 'Habits' },
    { path: '/calendar', icon: 'calendar_today', name: 'Calendar' },
    { path: '/reports', icon: 'bar_chart', name: 'Reports' },
  ]);

  isOpen = signal(false);
  isCollapsed = signal(false);

  toggleSidebar(): void {
    this.isOpen.update((v) => !v);
  }

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

  closeSidebar(): void {
    this.isOpen.set(false);
  }

  // Close sidebar on route change for mobile
  onNavClick(): void {
    if (window.innerWidth < 640) {
      this.closeSidebar();
    }
  }
}
