import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllHabits } from './all-habits';

describe('AllHabits', () => {
  let component: AllHabits;
  let fixture: ComponentFixture<AllHabits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllHabits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllHabits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
