import { Component, AfterViewInit } from '@angular/core';
import { ClienteService } from '../services/cliente.service';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements AfterViewInit {

  clientes: any;

  constructor(private clienteService: ClienteService) {}

  ngAfterViewInit(): void {
    this.clienteService.getClientes().subscribe(
      (res: any[]) => {
        this.clientes = res;
      },
      (error: any) => console.log(error)
    );
  }

}
