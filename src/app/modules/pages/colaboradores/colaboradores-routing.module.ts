import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { ViewComponent } from "./view/view.component";
import { NovoComponent } from './criacao/novo/novo.component';
import { AtualizacaoComponent } from './atualizacao/atualizacao.component';
import { DetalhesComponent } from './detalhes/detalhes.component';


const routes: Routes = [
    {
        path: '',
        component: ViewComponent
    },
    {
        path: 'novo',
        component: NovoComponent
    },
    {
        path: 'alterar/:id',
        component: AtualizacaoComponent
    },
    {
        path: ':id',
        component: DetalhesComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
export class ColaboradoresRoutingModule {}