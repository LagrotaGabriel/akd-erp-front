import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientesRoutingModule } from './clientes-routing.module';

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

import { MenuComponent } from './visualizacao/menu/menu.component';
import { ViewComponent } from './visualizacao/view/view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TabelaComponent } from './visualizacao/tabela/tabela.component';

import ptBr from '@angular/common/locales/pt';
import { NovoComponent } from './criacao/novo/novo.component';
import { AtualizacaoComponent } from './atualizacao/atualizacao/atualizacao.component';
import { PaginacaoComponent } from './visualizacao/tabela/paginacao/paginacao.component';

registerLocaleData(ptBr);

@NgModule({
  declarations: [ MenuComponent, ViewComponent, TabelaComponent, NovoComponent, AtualizacaoComponent, PaginacaoComponent ],
  exports: [ MenuComponent, ViewComponent, TabelaComponent, NovoComponent, AtualizacaoComponent ],
  imports: [
    CommonModule,
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
    ReactiveFormsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ClientesModule { }
