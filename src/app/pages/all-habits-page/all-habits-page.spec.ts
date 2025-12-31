import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllHabitsPage } from './all-habits-page';

describe('AllHabitsPage', () => {
  let component: AllHabitsPage;
  let fixture: ComponentFixture<AllHabitsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllHabitsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllHabitsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
