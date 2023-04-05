import { Subscription } from 'rxjs';
import { MetaDadosCliente } from '../models/MetaDadosCliente';
import { Component, Input, OnChanges, DoCheck, SimpleChanges, OnDestroy } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-informativos',
  templateUrl: './informativos.component.html',
  styleUrls: ['./informativos.component.scss']
})
export class InformativosComponent implements OnChanges, DoCheck, OnDestroy {

  obtemDadosMeta$: Subscription;

  constructor(private clienteService: ClienteService, private _snackBar: MatSnackBar) { }

  @Input() public filtrosAdicionados;
  metaDados: MetaDadosCliente = JSON.parse(localStorage.getItem("metaDados") || null);

  ngDoCheck(): void {
    localStorage.setItem('metaDados', JSON.stringify(this.metaDados));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['filtrosAdicionados'].isFirstChange()) {
      this.obtemMetaDados();
    }
  }

  ngOnDestroy(): void {
    if (this.obtemDadosMeta$ != undefined) this.obtemDadosMeta$.unsubscribe();
  }

  obtemMetaDados() {
    this.obtemDadosMeta$ = this.clienteService.getMetaDados(this.filtrosAdicionados).subscribe(
      {
        next: (resposta: MetaDadosCliente) => {
          this.metaDados = resposta;
          this.metaDados.totalClientesCadastrados = this.transformaQuantidadeDeClientesEmString(resposta.totalClientesCadastrados);
        },
        error: () => {
          this.metaDados = null;
        }
      }
    )
  }

  transformaQuantidadeDeClientesEmString(qtdeClientes: any): string {
    var qtdeClientesString = "";
    if (qtdeClientes <= 999) qtdeClientesString = qtdeClientes.toString();
    else if (qtdeClientes > 1000 && qtdeClientes <= 9999) qtdeClientesString = ((qtdeClientes.toString()).slice(0)) + "K";
    else if (qtdeClientes > 10000 && qtdeClientes <= 99999) qtdeClientesString = ((qtdeClientes.toString()).slice(0, 1)) + "K";
    else if (qtdeClientes > 100000 && qtdeClientes <= 999999) qtdeClientesString = ((qtdeClientes.toString()).slice(0, 2)) + "K";
    else if (qtdeClientes > 1000000 && qtdeClientes <= 9999999) qtdeClientesString = ((qtdeClientes.toString()).slice(0)) + "KK";
    return qtdeClientesString;
  }

}
