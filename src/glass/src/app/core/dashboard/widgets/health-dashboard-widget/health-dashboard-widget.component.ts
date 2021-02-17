import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AbstractDashboardWidget } from '~/app/core/dashboard/widgets/abstract-dashboard-widget';

@Component({
  selector: 'glass-health-dashboard-widget',
  templateUrl: './health-dashboard-widget.component.html',
  styleUrls: ['./health-dashboard-widget.component.scss']
})
export class HealthDashboardWidgetComponent extends AbstractDashboardWidget<boolean> {
  data = true;

  loadData(): Observable<boolean> {
    return of(this.data);
  }
}
