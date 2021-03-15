import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '~/app/material.modules';
import { DatatableComponent } from '~/app/shared/components/datatable/datatable.component';
import { DialogComponent } from '~/app/shared/components/dialog/dialog.component';
import { SubmitButtonComponent } from '~/app/shared/components/submit-button/submit-button.component';
import { WidgetComponent } from '~/app/shared/components/widget/widget.component';

@NgModule({
  declarations: [SubmitButtonComponent, DialogComponent, DatatableComponent, WidgetComponent],
  exports: [SubmitButtonComponent, DialogComponent, DatatableComponent, WidgetComponent],
  imports: [CommonModule, FlexLayoutModule, MaterialModule, TranslateModule.forChild()]
})
export class ComponentsModule {}
