import { Component, AfterViewInit, Input, DoCheck, OnChanges, AfterContentChecked } from '@angular/core';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { ClienteService } from '../services/cliente.service';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements OnChanges {

  clientes: any;
  @Input() public filtrosAdicionados;

  constructor(private clienteService: ClienteService) { }

  ngOnChanges(changes) {
    this.clienteService.getClientes(this.filtrosAdicionados).subscribe(
      (res: any[]) => {
        this.clientes = res;
      },
      (error: any) => console.log(error)
    );
  }


}
