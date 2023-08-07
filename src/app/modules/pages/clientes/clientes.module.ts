import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesRoutingModule } from './clientes-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';

import { ViewComponent } from './view/view.component';
import { MatPaginatorModule } from '@angular/material/paginator';

import ptBr from '@angular/common/locales/pt';

import { DadosPessoaisComponent } from './new/dados-pessoais/dados-pessoais.component';
import { DadosTelefoneComponent } from './new/dados-telefone/dados-telefone.component';
import { DadosEnderecoComponent } from './new/dados-endereco/dados-endereco.component';
import { NewComponent } from './new/new.component';

registerLocaleData(ptBr);

@NgModule({
  declarations: [ViewComponent, DadosPessoaisComponent, DadosTelefoneComponent, DadosEnderecoComponent, NewComponent],
  exports: [ViewComponent],
  imports: [
    CommonModule,
    SharedModule,
    ClientesRoutingModule,
    MatGridListModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    BrowserModule,
    MatRippleModule,
    MatChipsModule,
    MatBadgeModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatStepperModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ClientesModule { }
