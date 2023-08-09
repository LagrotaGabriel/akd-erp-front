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
import { MatMenuModule } from '@angular/material/menu';

import { ViewComponent } from './view/view.component';

import { SharedModule } from '../../shared/shared.module';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { AlteracoesComponent } from './detalhes/historico/alteracoes/alteracoes.component';
import { ProdutividadeComponent } from './detalhes/historico/produtividade/produtividade.component';
import { AdvertenciasComponent } from './detalhes/historico/advertencias/advertencias.component';
import { AcessosComponent } from './detalhes/historico/acessos/acessos.component';
import { DadosComponent } from './detalhes/dados/dados.component';
import { HistoricoComponent } from './detalhes/historico/historico.component';
import { DetalhesDadosPessoaisComponent } from './detalhes/dados/detalhes-dados-pessoais/detalhes-dados-pessoais.component';
import { DetalhesDadosProfissionaisComponent } from './detalhes/dados/detalhes-dados-profissionais/detalhes-dados-profissionais.component';
import { DetalhesDadosAcessoComponent } from './detalhes/dados/detalhes-dados-acesso/detalhes-dados-acesso.component';
import { NewComponent } from './new/new.component';
import { DadosPessoaisComponent } from './new/dados-pessoais/dados-pessoais.component';
import { DadosProfissionaisComponent } from './new/dados-profissionais/dados-profissionais.component';
import { DadosAcessoComponent } from './new/dados-acesso/dados-acesso.component';
import { CustomTitleContainerComponent } from './new/custom-title-container/custom-title-container.component';

@NgModule({
  declarations: [ViewComponent, DadosPessoaisComponent, DadosProfissionaisComponent, DadosAcessoComponent,
    CustomTitleContainerComponent, DetalhesComponent, AlteracoesComponent, ProdutividadeComponent, AdvertenciasComponent, AcessosComponent,
    DadosComponent, HistoricoComponent, DetalhesDadosPessoaisComponent, DetalhesDadosProfissionaisComponent, DetalhesDadosAcessoComponent, NewComponent],
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
    MatTabsModule,
    MatMenuModule
  ],
  exports: [ViewComponent],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ],
})
export class ColaboradoresModule { }
