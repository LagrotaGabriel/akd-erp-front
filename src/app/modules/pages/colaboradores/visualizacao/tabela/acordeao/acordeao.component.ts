import { Component, Input } from '@angular/core';
import { Colaborador } from '../../models/Colaborador';
import { Endereco } from 'src/app/shared/models/Endereco';
import { Expediente } from '../../models/Expediente';

@Component({
  selector: 'app-acordeao',
  templateUrl: './acordeao.component.html',
  styleUrls: ['./acordeao.component.scss']
})
export class AcordeaoComponent {

  @Input() colaborador: Colaborador;

  trataEnderecoTabela(endereco: Endereco): string {
    let enderecoCompleto = ""
    if (endereco != null) {
      enderecoCompleto += (endereco.logradouro + ', ' + endereco.numero);
      if (endereco.bairro != null && endereco.cidade != null && endereco.estado != null)
        enderecoCompleto += (' - ' + endereco.bairro + ', ' + endereco.cidade + ' - ' + endereco.estado);
      if (endereco.codigoPostal != null)
        enderecoCompleto += (' - ' + endereco.codigoPostal);
      if (endereco.complemento != null)
        enderecoCompleto += (' - ' + endereco.complemento);
      return enderecoCompleto;
    }
    else return '-';
  }

  criaExibicaoExpediente(expediente: Expediente): string {
    let stringExpediente: string = 'Das ' + expediente.horaEntrada + ' às ' + expediente.horaSaida;
    if (expediente.horaEntradaAlmoco != null) stringExpediente += ' com pausa das ' + expediente.horaSaidaAlmoco + ' às ' + expediente.horaEntradaAlmoco;
    else stringExpediente += ' sem horário de pausa';
    return stringExpediente;
  }

}
