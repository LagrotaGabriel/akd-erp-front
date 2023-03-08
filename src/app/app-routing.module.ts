import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      /*{
        path: 'inicio', component: HomeComponent
      },
      {
        path: 'clientes', component: ClientesComponent
      },*/
    ]
  },
  {
    path: '**',
    redirectTo: '/inicio'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
