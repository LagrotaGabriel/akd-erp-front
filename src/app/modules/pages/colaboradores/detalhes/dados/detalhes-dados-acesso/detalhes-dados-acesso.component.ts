import { Component, Input } from '@angular/core';
import { Colaborador } from '../../../models/Colaborador';
import { slideUpDownAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-detalhes-dados-acesso',
  templateUrl: './detalhes-dados-acesso.component.html',
  styleUrls: ['./detalhes-dados-acesso.component.scss'],
  animations: [slideUpDownAnimation]
})
export class DetalhesDadosAcessoComponent {
  @Input() colaborador: Colaborador;
  dadosAcesso: boolean = false;

  realizaTratamentoCampoPermissao(permissao: string): string {
    switch (permissao) {
      case 'LEITURA_BASICA': {
        return 'Leitura básica';
      }
      case 'LEITURA_AVANCADA': {
        return 'Leitura avançada';
      }
      case 'LEITURA_BASICA_ALTERACAO': {
        return 'Leitura básica + alteração';
      }
      case 'LEITURA_AVANCADA_ALTERACAO': {
        return 'Leitura avançada + alteração';
      }
      default: {
        return null;
      }
    }
  }

}
