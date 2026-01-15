import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { HabitWithStats, HabitCategory, getIconByCategory, getLabelByCategory } from '../../models/models';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';

type ViewMode = 'list' | 'grid';

interface GroupedHabits {
  category: string;
  habits: HabitWithStats[];
  collapsed: boolean;
}

@Component({
  selector: 'app-all-habits',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  templateUrl: './all-habits-page.html',
  styleUrl: './all-habits-page.css',
})
export class AllHabitsPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  habits = signal<HabitWithStats[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  viewMode = signal<ViewMode>('list'); // Default to list view

  // Confirmation modal
  showDeleteModal = signal<boolean>(false);
  habitToDelete = signal<HabitWithStats | null>(null);

  // Action menu state
  openMenuId = signal<string | null>(null);

  // Filtered habits based on search
  filteredHabits = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.habits();

    return this.habits().filter(
      (habit) =>
        habit.title.toLowerCase().includes(query) ||
        (habit.category?.toLowerCase().includes(query) ?? false)
    );
  });

  // Stats
  activeHabits = computed(() => this.habits().filter((h) => !h.archived).length);

  // Habit Breakdown for sidebar widget
  habitBreakdown = computed(() => {
    const all = this.habits();
    return {
      daily: all.filter(h => h.frequency === 'daily').length,
      weekly: all.filter(h => h.frequency === 'weekly').length,
      monthly: all.filter(h => h.frequency === 'monthly').length,
      custom: all.filter(h => h.frequency === 'custom').length,
    };
  });

  // Group habits by category
  groupedHabits = computed(() => {
    const filtered = this.filteredHabits();
    const groups = new Map<string, HabitWithStats[]>();

    filtered.forEach((habit) => {
      const category = habit.category || 'Uncategorized';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(habit);
    });

    // Convert to array and sort: named categories first, then Uncategorized
    const result: GroupedHabits[] = [];
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });

    sortedKeys.forEach((category) => {
      result.push({
        category,
        habits: groups.get(category)!,
        collapsed: false,
      });
    });

    return result;
  });

  async ngOnInit() {
    await this.loadHabits();
  }

  async loadHabits() {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabaseService.getHabits();
      if (error) {
        console.error('Error loading habits:', error);
      } else {
        this.habits.set(data || []);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  // Close any open menus (for layout click handler)
  closeMenus() {
    this.openMenuId.set(null);
  }

  // Toggle action menu for a specific habit
  toggleMenu(habitId: string, event: Event) {
    event.stopPropagation();
    if (this.openMenuId() === habitId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(habitId);
    }
  }

  // Format time: 07:00:00 → 07:00
  formatTime(time: string | undefined): string {
    if (!time) return '';
    return time.slice(0, 5); // Truncate seconds
  }

  toggleView(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  toggleGroupCollapse(groupIndex: number) {
    const groups = this.groupedHabits();
    if (groups[groupIndex]) {
      groups[groupIndex].collapsed = !groups[groupIndex].collapsed;
      // Force recomputation by creating new array
      this.habits.update((h) => [...h]);
    }
  }

  getStreakIcon(currentStreak: number): string {
    if (currentStreak >= 100) return '💎';
    if (currentStreak >= 30) return '⭐';
    return '🔥';
  }

  getStreakClass(currentStreak: number): string {
    if (currentStreak >= 100) return 'text-yellow-400 font-bold';
    if (currentStreak >= 30) return 'text-primary font-semibold';
    if (currentStreak >= 8) return 'text-orange-400';
    return 'text-text-dark-secondary';
  }

  getCategoryEmoji(category: string): string {
    return getIconByCategory(category);
  }

  getHabitIcon(category: string | null | undefined): string {
    return getIconByCategory(category);
  }

  editHabit(habit: HabitWithStats) {
    this.router.navigate(['/habit/edit', habit.id]);
  }

  openDeleteModal(habit: HabitWithStats) {
    this.habitToDelete.set(habit);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.habitToDelete.set(null);
  }

  async confirmDelete() {
    const habit = this.habitToDelete();
    if (!habit || !habit.id) return;

    try {
      const { error } = await this.supabaseService.deleteHabit(habit.id);
      if (error) {
        console.error('Error deleting habit:', error);
      } else {
        await this.loadHabits();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      this.closeDeleteModal();
    }
  }

  createNewHabit() {
    this.router.navigate(['/habit/new']);
  }

  getCategoryIcon(category: HabitCategory | undefined): string {
    return getIconByCategory(category);
  }

  getFrequencyLabel(habit: HabitWithStats): string {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly') return 'Weekly';
    if (habit.frequency === 'monthly') return 'Monthly';
    if (habit.frequency === 'custom') return 'Custom';
    return habit.frequency || 'Daily';
  }
}
