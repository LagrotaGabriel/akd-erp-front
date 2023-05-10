import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';
import { CustomErrorComponent } from 'src/app/modules/shared/inputs/custom-error/custom-error.component';
import { CustomSelectComponent } from 'src/app/modules/shared/inputs/custom-select/custom-select.component';
import { CustomDateInputComponent } from 'src/app/modules/shared/inputs/custom-date-input/custom-date-input.component';
import { CustomTimeInputComponent } from 'src/app/modules/shared/inputs/custom-time-input/custom-time-input.component';

@NgModule({
  declarations: [
    CustomInputComponent,
    CustomErrorComponent,
    CustomSelectComponent,
    CustomDateInputComponent,
    CustomTimeInputComponent
  ],
  exports: [
    CustomInputComponent,
    CustomErrorComponent,
    CustomSelectComponent,
    CustomDateInputComponent,
    CustomTimeInputComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule
  ]
})
export class SharedModule { }
