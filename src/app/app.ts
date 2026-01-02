import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar-component/sidebar-component';
import { SupabaseService } from './services/supabase-service';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('taskflow');

  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {
    effect(() => {
      const settings = this.supabase.userSettings();
      const theme = settings.theme;
      const accentColor = settings.accentColor;

      // Apply theme classes
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-system', 'dark');
      document.body.classList.add(`theme-${theme}`);

      if (
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.body.classList.add('dark');
      }

      // Apply accent color classes
      document.body.classList.forEach((className) => {
        if (className.startsWith('accent-')) {
          document.body.classList.remove(className);
        }
      });
      document.body.classList.add(`accent-${accentColor}`);
    });
  }

  ngOnInit() {}

  isLoginPage(): boolean {
    return this.router.url?.includes('/login');
  }
}
