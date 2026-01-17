import { AfterViewInit, Component, effect, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  DayOfWeek,
  DefaultHabitIcons,
  Habit,
  HabitIconPair,
  HabitWithStats,
  MonthDay,
} from '../../models/models';
import { SupabaseService } from '../../services/supabase-service';
import { DateUtils } from '../../models/utilities';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './habit-form-page.html',
  styleUrl: './habit-form-page.css',
})
export class HabitFormPage implements OnInit {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private activatedRoute = inject(ActivatedRoute);

  habitForm: FormGroup;
  mode = signal<FormMode>('create');
  editingHabitId = signal<string | null>(null);
  editingHabitTitle = signal<string>('');
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Options
  availableHabitIcons: HabitIconPair[] = DefaultHabitIcons;
  frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
  ];
  weekDays = DateUtils.weekDays;
  monthDays: (number | 'last')[] = [...Array.from({ length: 31 }, (_, i) => i + 1), 'last'];

  constructor() {
    this.habitForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      icon: new FormControl(this.availableHabitIcons[0].icon),
      color: new FormControl('#10b981'),
      category: new FormControl(this.availableHabitIcons[0].category),
      frequency: new FormControl('daily', Validators.required),
      customDays: new FormControl([]),
      timeOfDay: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      streakEnabled: new FormControl(true),
      streakResetAfterMissingDays: new FormControl(1),
    });

    // Sync frequency with user settings (only in create mode)
    effect(() => {
      if (this.mode() === 'create') {
        const defaultFrequency = this.supabaseService.userSettings().defaultFrequency;
        if (defaultFrequency && !this.habitForm.get('title')?.value) {
          this.habitForm.patchValue({ frequency: defaultFrequency }, { emitEvent: false });
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.mode.set('edit');
      this.editingHabitId.set(id);
      await this.loadHabitData(id);
    }
  }

  async loadHabitData(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabaseService.getHabitById(id);
      if (error) throw error;
      if (data) {
        this.editingHabitTitle.set(data.title);

        // Map snake_case from DB to camelCase for form if needed,
        // but getHabitById already returns mapped data if the service does it.
        // Let's check getHabitById in SupabaseService.

        this.habitForm.patchValue({
          title: data.title,
          description: data.description || '',
          icon: data.icon || '🎯',
          color: data.color || '#10b981',
          category: data.category || 'personal',
          frequency: data.frequency,
          customDays: data.customDays || [],
          timeOfDay: data.timeOfDay || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          streakEnabled: data.streakEnabled ?? true,
          streakResetAfterMissingDays: data.streakResetAfterMissingDays || 1,
        });
      }
    } catch (err) {
      console.error('Error loading habit:', err);
      this.router.navigate(['/all-habits']);
    } finally {
      this.isLoading.set(false);
    }
  }

  onWeekDayToggle(day: DayOfWeek): void {
    const selectedDays = [...(this.habitForm.value.customDays as DayOfWeek[])];
    const index = selectedDays.indexOf(day);

    if (index > -1) {
      selectedDays.splice(index, 1);
    } else {
      selectedDays.push(day);
    }
    this.habitForm.get('customDays')?.setValue(selectedDays);
  }

  onMonthDayToggle(day: number | 'last'): void {
    const selectedDays = [...(this.habitForm.value.customDays as MonthDay[])];
    const index = selectedDays.indexOf(day as MonthDay);

    if (index > -1) {
      selectedDays.splice(index, 1);
    } else {
      selectedDays.push(day as MonthDay);
    }
    this.habitForm.get('customDays')?.setValue(selectedDays);
  }

  isWeekDaySelected(day: DayOfWeek): boolean {
    return (this.habitForm.value.customDays || []).includes(day);
  }

  isMonthDaySelected(day: number | 'last'): boolean {
    return (this.habitForm.value.customDays || []).includes(day);
  }

  onFrequencyChange(frequency: string): void {
    this.habitForm.get('frequency')?.setValue(frequency);
    // Reset customDays when frequency changes
    this.habitForm.get('customDays')?.setValue([]);
  }

  selectCategory(category: string, icon: string): void {
    this.habitForm.patchValue({
      category: category,
      icon: icon,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.habitForm.invalid) return;

    this.isSubmitting.set(true);

    try {
      const formValue = this.habitForm.value;

      const habitData: Partial<Habit> = {
        title: formValue.title,
        description: formValue.description,
        icon: formValue.icon || '🎯',
        color: formValue.color || '#10b981',
        category: formValue.category || 'personal',
        frequency: formValue.frequency,
        customDays: formValue.customDays || [],
        timeOfDay: formValue.timeOfDay || undefined,
        startDate: formValue.startDate || undefined,
        endDate: formValue.endDate || undefined,
        streakEnabled: formValue.streakEnabled ?? true,
        streakResetAfterMissingDays: formValue.streakResetAfterMissingDays || 1,
      };

      let result;
      if (this.mode() === 'edit' && this.editingHabitId()) {
        result = await this.supabaseService.updateHabit(this.editingHabitId()!, habitData);
      } else {
        result = await this.supabaseService.createHabit(habitData as Habit);
      }

      const { data, error } = result;

      if (error) {
        console.error('Error saving habit:', error);
      } else {
        this.goBack();
      }
    } catch (err) {
      console.error('Error during submission:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack(): void {
    // Navigate to all-habits as requested
    this.router.navigate(['/all-habits']);
  }
}
