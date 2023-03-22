import { Pageable, PageObject } from './../models/PageObject';
import { Component, Input, OnChanges } from '@angular/core';
import { ClienteService } from '../services/cliente.service';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements OnChanges {

  pageObject: PageObject;
  pageableInfo: Pageable = JSON.parse(localStorage.getItem("pageable") || 'null')

  @Input() public filtrosAdicionados;

  constructor(private clienteService: ClienteService) { }

  ngDoCheck(): void {
    if(this.pageObject != null) localStorage.setItem('pageable', JSON.stringify(this.pageObject.pageable));
  }

  ngOnChanges() {
    this.clienteService.getClientes(this.filtrosAdicionados, this.pageableInfo).subscribe(
      (res: PageObject) => {
        this.pageObject = res;
      },
      (error: any) => console.log(error)
    );
  }

    GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
      return Array(n);
    }

}
