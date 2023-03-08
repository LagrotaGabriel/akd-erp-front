import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesRoutingModule } from './clientes-routing.module';

import {MatGridListModule} from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MenuComponent } from './menu/menu.component';
import { ViewComponent } from './view/view.component';

@NgModule({
  declarations: [
    MenuComponent,
    ViewComponent
  ],
  exports: [
    MenuComponent,
    ViewComponent,
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    MatGridListModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class ClientesModule { }
