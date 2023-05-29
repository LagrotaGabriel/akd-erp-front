import { Component, Input } from '@angular/core';
import { Colaborador } from '../../../models/Colaborador';
import { slideUpDownAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-detalhes-dados-pessoais',
  templateUrl: './detalhes-dados-pessoais.component.html',
  styleUrls: ['./detalhes-dados-pessoais.component.scss'],
  animations: [slideUpDownAnimation]
})
export class DetalhesDadosPessoaisComponent {
  dadosPessoais: boolean = false;
  @Input() colaborador: Colaborador;
}
