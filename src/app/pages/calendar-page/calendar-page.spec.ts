import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarPage } from './calendar-page';
import { SupabaseService } from '../../services/supabase-service';

describe('CalendarPage', () => {
  let component: CalendarPage;
  let fixture: ComponentFixture<CalendarPage>;

  const mockSupabaseService = {
    getActiveHabits: vi.fn().mockResolvedValue({ data: [], error: null }),
    getHabitLogsForDateRange: vi.fn().mockResolvedValue({ data: [], error: null }),
    toggleHabitCompletion: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [{ provide: SupabaseService, useValue: mockSupabaseService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current month', () => {
    const today = new Date();
    const expectedMonth = today.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    expect(component.monthYearDisplay()).toBe(expectedMonth);
  });

  it('should navigate to previous month', () => {
    const initialMonth = new Date(component.currentMonth());
    component.previousMonth();
    expect(component.currentMonth().getMonth()).toBe(
      initialMonth.getMonth() === 0 ? 11 : initialMonth.getMonth() - 1
    );
  });

  it('should navigate to next month', () => {
    const initialMonth = new Date(component.currentMonth());
    component.nextMonth();
    expect(component.currentMonth().getMonth()).toBe(
      initialMonth.getMonth() === 11 ? 0 : initialMonth.getMonth() + 1
    );
  });

  it('should select a date when clicked', () => {
    const testDate = new Date(2025, 5, 15);
    component.selectDate({
      date: testDate,
      dateStr: '2025-06-15',
      dayOfMonth: 15,
      isCurrentMonth: true,
      isToday: false,
      isSelected: false,
      scheduledHabits: [],
      completedCount: 0,
      totalCount: 0,
    });
    expect(component.selectedDate()).toEqual(testDate);
  });

  it('should return correct day status', () => {
    const emptyDay = { totalCount: 0, completedCount: 0 } as any;
    expect(component.getDayStatus(emptyDay)).toBe('empty');

    const completeDay = { totalCount: 3, completedCount: 3 } as any;
    expect(component.getDayStatus(completeDay)).toBe('complete');

    const partialDay = { totalCount: 3, completedCount: 1 } as any;
    expect(component.getDayStatus(partialDay)).toBe('partial');

    const incompleteDay = { totalCount: 3, completedCount: 0 } as any;
    expect(component.getDayStatus(incompleteDay)).toBe('incomplete');
  });

  it('should go to today when goToToday is called', () => {
    component.currentMonth.set(new Date(2020, 0, 1));
    component.selectedDate.set(new Date(2020, 0, 15));
    component.goToToday();
    const today = new Date();
    expect(component.selectedDate().toDateString()).toBe(today.toDateString());
    expect(component.currentMonth().getMonth()).toBe(today.getMonth());
  });
});
