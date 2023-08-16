import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { ViewComponent } from "./view/view.component";
import { NewComponent } from './new/new.component';
import { DetailsComponent } from './details/details.component';

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
        component: DetailsComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DespesasRoutingModule { }