import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { ViewComponent } from './view/view.component';
import { ClientesRoutingModule } from './clientes-routing.module';



@NgModule({
  declarations: [
    MenuComponent,
    ViewComponent
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
  ]
})
export class ClientesModule { }
