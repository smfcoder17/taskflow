import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  // Store multiple toasts
  toasts = signal<ToastMessage[]>([]);

  // Icon mapping for each toast type
  iconMap: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  // Color mapping for each toast type
  colorMap: Record<ToastType, string> = {
    success: 'text-green-400 bg-green-500/10 border-green-500/30',
    error: 'text-red-400 bg-red-500/10 border-red-500/30',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  };

  /**
   * Show a toast notification
   * @param type - Type of toast (success, error, warning, info)
   * @param text - Message to display
   * @param duration - Duration in ms before auto-dismiss (default: 3000)
   */
  show(type: ToastType, text: string, duration = 3000): void {
    const id = crypto.randomUUID();
    const toast: ToastMessage = { id, type, text, duration };

    this.toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  /**
   * Dismiss a specific toast by ID
   */
  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  /**
   * Get icon for toast type
   */
  getIcon(type: ToastType): string {
    return this.iconMap[type];
  }

  /**
   * Get color classes for toast type
   */
  getColorClass(type: ToastType): string {
    return this.colorMap[type];
  }
}
