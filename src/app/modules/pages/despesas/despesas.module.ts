import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { ViewComponent } from './view/view.component';
import { SharedModule } from '../../shared/shared.module';
import { NewComponent } from './new/new.component';
import { DetailsComponent } from './details/details.component';



@NgModule({
  declarations: [
    ViewComponent,
    NewComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
  ],
  exports: [
    ViewComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class DespesasModule { }
