import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';

import { ViewComponent } from './visualizacao/view/view.component';
import { MenuComponent } from './visualizacao/menu/menu.component';
import { TabelaComponent } from './visualizacao/tabela/tabela.component';
import { PaginacaoComponent } from './visualizacao/tabela/paginacao/paginacao.component';
import { CabecalhoComponent } from './visualizacao/tabela/cabecalho/cabecalho.component';
import { AcordeaoComponent } from './visualizacao/tabela/acordeao/acordeao.component';
import { NovoComponent } from './criacao/novo/novo.component';
import { DadosPessoaisComponent } from './criacao/novo/dados-pessoais/dados-pessoais.component';
import { DadosProfissionaisComponent } from './criacao/novo/dados-profissionais/dados-profissionais.component';
import { DadosAcessoComponent } from './criacao/novo/dados-acesso/dados-acesso.component';

import { CustomTitleContainerComponent } from './criacao/novo/shared/custom-title-container/custom-title-container.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [MenuComponent, ViewComponent, TabelaComponent, PaginacaoComponent, CabecalhoComponent, AcordeaoComponent, NovoComponent,
    DadosPessoaisComponent, DadosProfissionaisComponent, DadosAcessoComponent, CustomTitleContainerComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatStepperModule,
  ],
  exports: [
    MenuComponent, ViewComponent, TabelaComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ColaboradoresModule { }
