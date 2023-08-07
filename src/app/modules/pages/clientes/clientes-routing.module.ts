import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewComponent } from './view/view.component';
import { NewComponent } from './new/new.component';

const routes: Routes = [
  {
    path: '',
    component: ViewComponent,
  },
  {
    path: 'update',
    component: NewComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientesRoutingModule {}
