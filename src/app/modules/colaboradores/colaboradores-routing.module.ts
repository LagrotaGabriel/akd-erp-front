import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { ViewComponent } from "./visualizacao/view/view.component";
import { NovoComponent } from './criacao/novo/novo.component';


const routes: Routes = [
    {
        path: '',
        component: ViewComponent
    },
    {
        path: 'novo',
        component: NovoComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
export class ColaboradoresRoutingModule {}