import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitFormPage } from './habit-form-page';

describe('HabitFormPage', () => {
  let component: HabitFormPage;
  let fixture: ComponentFixture<HabitFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitFormPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
