import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ClientesRoutingModule } from './clientes-routing.module';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MenuComponent } from './menu/menu.component';
import { ViewComponent } from './view/view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InformativosComponent } from './informativos/informativos.component';
import { TabelaComponent } from './tabela/tabela.component';
import { BuscaComponent } from './busca/busca.component';

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
  ],
})
export class ClientesModule {}
