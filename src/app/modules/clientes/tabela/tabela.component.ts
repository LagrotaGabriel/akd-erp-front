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
    if (this.pageObject != null && this.pageableInfo == null) this.pageableInfo = this.pageObject.pageable;
    localStorage.setItem('pageable', JSON.stringify(this.pageableInfo));
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

  selecionarPagina(numeroPagina: number) {
    this.pageableInfo.pageNumber = numeroPagina;
    this.clienteService.getClientes(this.filtrosAdicionados, this.pageableInfo).subscribe(
      (res: PageObject) => {
        this.pageObject = res;
      },
      (error: any) => console.log(error)
    );
  }

  voltarPagina() {
    if (this.pageableInfo.pageNumber > 0) {
      this.pageableInfo.pageNumber --;
      this.clienteService.getClientes(this.filtrosAdicionados, this.pageableInfo).subscribe(
        (res: PageObject) => {
          this.pageObject = res;
        },
        (error: any) => console.log(error)
      );      
    }
  }

  avancarPagina() {
    if (this.pageableInfo.pageNumber < this.pageObject.totalPages-1) {
      this.pageableInfo.pageNumber ++;
      this.clienteService.getClientes(this.filtrosAdicionados, this.pageableInfo).subscribe(
        (res: PageObject) => {
          this.pageObject = res;
        },
        (error: any) => console.log(error)
      );      
    }
  }

}
