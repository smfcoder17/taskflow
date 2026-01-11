import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitBreakdownComponent } from './habit-breakdown';

describe('HabitBreakdownComponent', () => {
  let component: HabitBreakdownComponent;
  let fixture: ComponentFixture<HabitBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitBreakdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
