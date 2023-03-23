import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ClientesRoutingModule } from './clientes-routing.module';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MenuComponent } from './menu/menu.component';
import { ViewComponent } from './view/view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InformativosComponent } from './informativos/informativos.component';
import { TabelaComponent } from './tabela/tabela.component';
import { BuscaComponent } from './busca/busca.component';

import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(ptBr);

@NgModule({
  declarations: [MenuComponent, ViewComponent, InformativosComponent, TabelaComponent, BuscaComponent],
  exports: [MenuComponent, ViewComponent],
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
    FormsModule
  ],
  providers:    [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ClientesModule { }
