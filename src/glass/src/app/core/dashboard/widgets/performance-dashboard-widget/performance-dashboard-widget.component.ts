import { Component } from '@angular/core';
import _ from 'lodash';
import { Observable } from 'rxjs';

import { BytesToSizePipe } from '~/app/shared/pipes/bytes-to-size.pipe';
import { ClientIO, StatusService } from '~/app/shared/services/api/status.service';

@Component({
  selector: 'glass-performance-dashboard-widget',
  templateUrl: './performance-dashboard-widget.component.html',
  styleUrls: ['./performance-dashboard-widget.component.scss']
})
export class PerformanceDashboardWidgetComponent {
  chartData: any[] = [];
  chartDataWrite: any[] = [];
  chartDataRead: any[] = [];
  writeSeries: any[] = [];

  constructor(public service: StatusService, private bytesToSizePipe: BytesToSizePipe) {}

  updateChartData($data: ClientIO) {
    const now = Math.round(Math.random() * 10);
    if (this.writeSeries.length === 0) {
      this.writeSeries = $data.services.map((s) => ({
        name: s.service_name,
        series: [{ value: s.io_rate.write, name: now }]
      }));
    } else {
      this.writeSeries.forEach((w) => {
        // @ts-ignore
        w.series.push({
          // @ts-ignore
          value: _.find($data.services, (s) => s.service_name === w.name).io_rate.write,
          name: now
        });
      });
    }
    console.log(this.writeSeries);
    this.chartData = $data.services.map((s) => ({
      name: `${s.service_name} (${s.service_type})`,
      value: s.io_rate.read + s.io_rate.write
    }));
    this.chartDataWrite = $data.services.map((s) => ({
      name: `${s.service_name} (${s.service_type})`,
      value: s.io_rate.write
    }));
    this.chartDataRead = $data.services.map((s) => ({
      name: `${s.service_name} (${s.service_type})`,
      value: s.io_rate.read
    }));
  }

  valueFormatting(c: any) {
    return this.bytesToSizePipe.transform(c) + '/s';
  }

  loadData(): Observable<ClientIO> {
    return this.service.clientIO();
  }
}
