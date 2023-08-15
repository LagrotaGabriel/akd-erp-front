import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe, registerLocaleData } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { CustomInputComponent } from 'src/app/modules/shared/inputs/custom-input/custom-input.component';
import { CustomErrorComponent } from 'src/app/modules/shared/inputs/custom-error/custom-error.component';
import { CustomSelectComponent } from 'src/app/modules/shared/inputs/custom-select/custom-select.component';
import { CustomDateInputComponent } from 'src/app/modules/shared/inputs/custom-date-input/custom-date-input.component';
import { CustomTimeInputComponent } from 'src/app/modules/shared/inputs/custom-time-input/custom-time-input.component';
import { TabelaComponent } from './tabela/tabela.component';
import { PaginacaoComponent } from './paginacao/paginacao.component';
import { CabecalhoComponent } from './cabecalho/cabecalho.component';

import localePt from '@angular/common/locales/pt';
import { TituloModuloComponent } from './titulo-modulo/titulo-modulo.component';
import { TitleContainerComponent } from './inputs/title-container/title-container.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    CustomInputComponent,
    CustomErrorComponent,
    CustomSelectComponent,
    CustomDateInputComponent,
    CustomTimeInputComponent,
    TabelaComponent,
    PaginacaoComponent,
    CabecalhoComponent,
    TituloModuloComponent,
    TitleContainerComponent,
  ],
  exports: [
    CustomInputComponent,
    CustomErrorComponent,
    CustomSelectComponent,
    CustomDateInputComponent,
    CustomTimeInputComponent,
    TabelaComponent,
    CabecalhoComponent,
    PaginacaoComponent,
    TituloModuloComponent,
    TitleContainerComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    CurrencyPipe,
    DatePipe,
    TitleCasePipe
  ]
})
export class SharedModule { }
