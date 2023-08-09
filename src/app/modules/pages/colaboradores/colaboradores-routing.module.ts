import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { ViewComponent } from "./view/view.component";
import { DetalhesComponent } from './detalhes/detalhes.component';
import { NewComponent } from './new/new.component';


const routes: Routes = [
    {
        path: '',
        component: ViewComponent
    },
    {
        path: 'update',
        component: NewComponent
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
export class ColaboradoresRoutingModule { }