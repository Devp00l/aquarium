import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, NgModule, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { WidgetAction, WidgetComponent } from '~/app/shared/components/widget/widget.component';
import { SharedModule } from '~/app/shared/shared.module';

@NgModule({})
export class MockModule {}
@Component({
  template: `
    <glass-widget
      [loadData]="loadData.bind(this)"
      title="Widget title"
      [actionMenu]="actions"
      (loadDataEvent)="updateData($event)"
    >
      Add your widget content here.
      <span class="show-last-number">{{ data[data.length - 1] }}</span>
    </glass-widget>
  `
})
class MockComponent {
  @ViewChild(WidgetComponent, { static: false })
  widget?: WidgetComponent;

  actionCalled = 0;
  data: number[] = [0];
  actions: WidgetAction[] = [
    {
      icon: 'plus-circle-outline',
      name: 'Increases actionCalled by 1',
      action: () => {
        this.actionCalled++;
        this.widget?.reload();
      }
    }
  ];

  constructor() {}

  updateData($data: number[]) {
    this.data = $data;
  }

  loadData(): Observable<number[]> {
    return of(this.data.concat(this.data[this.data.length - 1] + 1));
  }
}

describe('WidgetComponent', () => {
  let component: WidgetComponent;
  let mockComponent: MockComponent;
  let mockFixture: ComponentFixture<MockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockComponent],
      imports: [
        SharedModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    mockFixture = TestBed.createComponent(MockComponent);
    mockComponent = mockFixture.componentInstance;
    mockFixture.detectChanges();
    if (mockComponent.widget) {
      component = mockComponent.widget;
    }
  });

  it('should create', () => {
    expect(mockComponent).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should show disconnect sign and not content on error', () => {});
  it('should show loading sign and not content on first load', () => {});
  it('should show loading sign and not disconnect sign on error but with error class active', () => {});
  it('should show content after first load', () => {});
  it('should not show loading sign and content on seconds load', () => {});
  it('should reload content every 15 seconds', () => {});
  it('should show actions in toolbar menu', () => {});
  it('should trigger reloading manually in parent component (mock component)', () => {});
});
