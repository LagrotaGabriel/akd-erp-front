import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidenavComponent } from './shared/sidenav/sidenav.component';

const routes: Routes = [
  {
    path: '',
    component: SidenavComponent,
    children: [
      {
        path: 'clientes', 
        loadChildren: () => import('./modules/pages/clientes/clientes-routing.module').then( m => m.ClientesRoutingModule)
      },
      {
        path: 'colaboradores',
        loadChildren: () => import('./modules/colaboradores/colaboradores-routing.module').then( m => m.ColaboradoresRoutingModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
