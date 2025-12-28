import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { DayOfWeek, DefaultHabitIcons, Habit, HabitIconPair, MonthDay } from '../../models/models';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { DateUtils } from '../../models/utilities';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './habit-form-page.html',
  styleUrl: './habit-form-page.css',
})
export class HabitFormPage implements OnInit {
  habitForm: FormGroup;
  router = inject(Router);
  supabaseService = inject(SupabaseService);
  isSubmitting: boolean = false;

  // Options pour les selects
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
  }

  ngOnInit(): void {
    console.log('Categories:', this.availableHabitIcons);
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

    this.isSubmitting = true;

    try {
      const formValue = this.habitForm.value;

      const newHabit: Habit = {
        title: formValue.title,
        description: formValue.description,
        icon: formValue.icon || '🎯',
        color: formValue.color || '#10b981',
        category: formValue.category || 'personal',
        frequency: formValue.frequency,
        customDays: formValue.customDays || undefined,
        timeOfDay: formValue.timeOfDay || undefined,
        startDate: formValue.startDate
          ? new Date(formValue.startDate + 'T00:00:00').toISOString().split('T')[0]
          : undefined,
        endDate: formValue.endDate
          ? new Date(formValue.endDate + 'T00:00:00').toISOString().split('T')[0]
          : undefined,
        streakEnabled: formValue.streakEnabled ?? true,
        streakResetAfterMissingDays: formValue.streakResetAfterMissingDays || 1,
      };
      console.log('New Habit:', newHabit);

      const { data, error } = await this.supabaseService.createHabit(newHabit);

      if (error) {
        console.error('Erreur lors de la création:', error);
        alert("Erreur lors de la création de l'habitude");
        return;
      }

      console.log('Habit created successfully:', data);
      this.habitForm.reset({
        icon: '🎯',
        color: '#10b981',
        category: 'personal',
        frequency: 'daily',
        streakEnabled: true,
        streakResetAfterMissingDays: 1,
      });

      this.router.navigate(['/dashboard']);
      // this.router.navigate(['/all-habits']); // ou ta route de liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      this.isSubmitting = false;
    }
  }
}
