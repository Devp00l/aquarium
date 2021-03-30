import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceDashboardWidgetComponent } from './performance-dashboard-widget.component';

describe('PerformanceDashboardWidgetComponent', () => {
  let component: PerformanceDashboardWidgetComponent;
  let fixture: ComponentFixture<PerformanceDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformanceDashboardWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
