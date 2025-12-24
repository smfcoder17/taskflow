import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { DayOfWeek, Habit } from '../../models/models';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import { DateUtils, getDayOfWeek, weekDays } from '../../models/utilities';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './habit-form-page.html',
  styleUrl: './habit-form-page.css',
})
export class HabitFormPage {
  habitForm: FormGroup;
  router = inject(Router);
  supabaseService = inject(SupabaseService);
  isSubmitting: boolean = false;

  // Options pour les selects
  categories = [
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'personal', label: 'Personal', icon: '🎯' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'fitness', label: 'Fitness', icon: '🏃' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'other', label: 'Other', icon: '✨' },
  ];

  frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
  ];

  weekDays = weekDays;

  constructor() {
    this.habitForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      icon: new FormControl('🎯'),
      color: new FormControl('#10b981'),
      category: new FormControl('personal'),
      frequency: new FormControl('daily', Validators.required),
      customDays: new FormControl([]),
      timeOfDay: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      streakEnabled: new FormControl(true),
      streakResetAfterMissingDays: new FormControl(1),
    });
  }

  onCustomDayChange(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const selectedDays = this.habitForm.value.customDays as DayOfWeek[];
    const day = target.value as DayOfWeek;

    target.checked ? selectedDays.push(day) : selectedDays.splice(selectedDays.indexOf(day), 1);
    this.habitForm.get('customDays')?.setValue(selectedDays);
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
