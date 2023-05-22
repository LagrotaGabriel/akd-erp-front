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
import { MatTabsModule } from '@angular/material/tabs';

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
import { AtualizacaoComponent } from './atualizacao/atualizacao.component';
import { AtualizaDadosPessoaisComponent } from './atualizacao/atualiza-dados-pessoais/atualiza-dados-pessoais.component';
import { AtualizaDadosProfissionaisComponent } from './atualizacao/atualiza-dados-profissionais/atualiza-dados-profissionais.component';
import { AtualizaDadosAcessoComponent } from './atualizacao/atualiza-dados-acesso/atualiza-dados-acesso.component';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { AlteracoesComponent } from './detalhes/alteracoes/alteracoes.component';
import { ProdutividadeComponent } from './detalhes/produtividade/produtividade.component';
import { AdvertenciasComponent } from './detalhes/advertencias/advertencias.component';
import { AcessosComponent } from './detalhes/acessos/acessos.component';

@NgModule({
  declarations: [MenuComponent, ViewComponent, TabelaComponent, PaginacaoComponent, CabecalhoComponent, AcordeaoComponent, NovoComponent,
    DadosPessoaisComponent, DadosProfissionaisComponent, DadosAcessoComponent, CustomTitleContainerComponent, AtualizacaoComponent, AtualizaDadosPessoaisComponent, AtualizaDadosProfissionaisComponent, AtualizaDadosAcessoComponent, DetalhesComponent, AlteracoesComponent, ProdutividadeComponent, AdvertenciasComponent, AcessosComponent],
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
    MatTabsModule
  ],
  exports: [
    MenuComponent, ViewComponent, TabelaComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ColaboradoresModule { }
