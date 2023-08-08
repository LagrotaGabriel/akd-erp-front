import { Component, Input } from '@angular/core';
import { slideUpDownAnimation } from 'src/app/shared/animations';
import { ColaboradorResponse } from '../../../models/response/colaborador/ColaboradorResponse';

@Component({
  selector: 'app-detalhes-dados-profissionais',
  templateUrl: './detalhes-dados-profissionais.component.html',
  styleUrls: ['../dados.component.scss'],
  animations: [slideUpDownAnimation]
})
export class DetalhesDadosProfissionaisComponent {
  dadosProfissionais: boolean = false;
  @Input() colaborador: ColaboradorResponse;

  realizaTratamentoTipoOcupacao(tipoOcupacao: string): string {
    switch (tipoOcupacao) {
      case 'TECNICO_INTERNO': {
        return 'Técnico interno';
      }
      case 'TECNICO_EXTERNO': {
        return 'Técnico externo';
      }
      case 'ATENDENTE': {
        return 'Atendendimento';
      }
      case 'GERENTE': {
        return 'Gerência';
      }
      case 'DIRETOR': {
        return 'Diretoria';
      }
      case 'FINANCEIRO': {
        return 'Financeiro';
      }
      case 'CONTABIL': {
        return 'Contabil';
      }
      case 'TECNICO': {
        return 'Técnico';
      }
      case 'ADMINISTRATIVO': {
        return 'Administrativo';
      }
      case 'MARKETING': {
        return 'Marketing';
      }
      case 'TECNICO_TI': {
        return 'Tecnologia';
      }
      case 'ADMINISTRADOR': {
        return 'Administrativo';
      }
      default: {
        return null;
      }
    }
  }

  realizaTratamentoModeloContratacao(modeloContratacao: string): string {
    switch (modeloContratacao) {
      case 'CLT': {
        return 'CLT';
      }
      case 'PJ': {
        return 'PJ';
      }
      case 'FREELANCER': {
        return 'Freelancer';
      }
      default: {
        return null;
      }
    }
  }

  realizaTratamentoModeloTrabalho(modeloTrabalho: string): string {
    switch (modeloTrabalho) {
      case 'PRESENCIAL': {
        return 'Presencial';
      }
      case 'HIBRIDO': {
        return 'Híbrido';
      }
      case 'HOME_OFFICE': {
        return 'Remoto';
      }
      default: {
        return null;
      }
    }
  }
}
