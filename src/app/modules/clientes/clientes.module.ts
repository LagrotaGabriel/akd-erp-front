import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@NgModule({
  declarations: [MenuComponent, ViewComponent],
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
  ],
})
export class ClientesModule {}
