import { MetaDadosCliente } from '../models/MetaDadosCliente';
import { Component, Input, OnChanges, DoCheck, SimpleChanges } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-informativos',
  templateUrl: './informativos.component.html',
  styleUrls: ['./informativos.component.scss']
})
export class InformativosComponent implements OnChanges, DoCheck {

  constructor(private clienteService: ClienteService, private _snackBar: MatSnackBar) { }

  @Input() public filtrosAdicionados;
  metaDados: MetaDadosCliente = JSON.parse(localStorage.getItem("metaDados") || null);

  ngDoCheck(): void {
    localStorage.setItem('metaDados', JSON.stringify(this.metaDados));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes['filtrosAdicionados'].isFirstChange()) {
      this.obtemMetaDados();
    }
  }

  obtemMetaDados() {
    this.clienteService.getMetaDados(this.filtrosAdicionados).subscribe(
      (res: MetaDadosCliente) => {
        this.metaDados = res;
        this.metaDados.totalClientesCadastrados = this.transformaQuantidadeDeClientesEmString(res.totalClientesCadastrados);
      },
      (error: HttpErrorResponse) => {
        if (error.status == 403) {
          //TODO Encerrar sessão e redirecionar usuário para página de login. Aplicar NG GUARD (Se necessário)
        }
        else if (error.status == 0)
          this.metaDados = null;
          this._snackBar.open("Houve uma falha de comunicação com o servidor", "x");
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
