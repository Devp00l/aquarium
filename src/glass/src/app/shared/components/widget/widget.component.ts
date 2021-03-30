import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { EMPTY, interval, Observable, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export type WidgetAction = {
  icon: string;
  name: string;
  action: () => void;
};

@Component({
  selector: 'glass-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit, OnDestroy {
  @Output()
  readonly loadDataEvent = new EventEmitter<any>();

  @Input()
  title = '';
  @Input()
  loadData?: () => Observable<any>;
  @Input()
  actionMenu?: WidgetAction[];
  @Input()
  reloadTime = 15000;

  error = false;
  loading = false;
  firstLoadComplete = false;
  data?: any;

  private loadingWithoutError = true;
  private refreshDataSubscription?: Subscription;
  private intervalSubscription?: Subscription;

  ngOnInit(): void {
    this.reload();
    const intervalObservable = interval(this.reloadTime);
    this.intervalSubscription = intervalObservable.subscribe(() => this.reload());
  }

  ngOnDestroy(): void {
    this.refreshDataSubscription?.unsubscribe();
    this.intervalSubscription?.unsubscribe();
  }

  reload(): void {
    console.log('in', this.reloadTime);
    if (!this.loadData) {
      throw new Error('loadData attribute not set');
    }
    this.loading = true;
    this.loadingWithoutError = true;
    this.refreshDataSubscription = this.loadData()
      .pipe(
        // @ts-ignore
        catchError((err) => {
          if (_.isFunction(err.preventDefault)) {
            err.preventDefault();
          }
          this.loadingWithoutError = false;
          return EMPTY;
        }),
        finalize(() => {
          this.error = !this.loadingWithoutError;
          this.firstLoadComplete = this.loadingWithoutError;
          this.refreshDataSubscription?.unsubscribe();
          this.loading = false;
        })
      )
      .subscribe((data) => {
        console.log('out', this.reloadTime);
        this.data = data;
        this.loadDataEvent.emit(data);
      });
  }
}
