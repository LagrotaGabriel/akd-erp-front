import { Component, Input } from '@angular/core';
import { Cliente } from '../../models/Cliente';
import { Endereco } from 'src/app/shared/models/Endereco';

@Component({
  selector: 'app-acordeao',
  templateUrl: './acordeao.component.html',
  styleUrls: ['./acordeao.component.scss']
})
export class AcordeaoComponent {

  @Input() cliente: Cliente;

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

}
