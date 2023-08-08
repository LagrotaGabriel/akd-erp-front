import { Component, Input } from '@angular/core';
import { slideUpDownAnimation } from 'src/app/shared/animations';
import { ColaboradorResponse } from '../../../models/response/colaborador/ColaboradorResponse';

@Component({
  selector: 'app-detalhes-dados-pessoais',
  templateUrl: './detalhes-dados-pessoais.component.html',
  styleUrls: ['../dados.component.scss'],
  animations: [slideUpDownAnimation]
})
export class DetalhesDadosPessoaisComponent {
  dadosPessoais: boolean = false;
  @Input() colaborador: ColaboradorResponse;
}
