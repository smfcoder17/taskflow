import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {}

  isLoginPage(): boolean {
    return this.supabase.session() === null;
  }
}
