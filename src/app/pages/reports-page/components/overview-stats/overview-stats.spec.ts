import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewStatsComponent } from './overview-stats';

describe('OverviewStatsComponent', () => {
  let component: OverviewStatsComponent;
  let fixture: ComponentFixture<OverviewStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
