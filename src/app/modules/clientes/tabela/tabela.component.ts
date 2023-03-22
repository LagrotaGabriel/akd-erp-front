import { Pageable, PageObject } from '../../../shared/models/PageObject';
import { Component, Input, ViewChild, OnChanges } from '@angular/core';
import { ClienteService } from '../services/cliente.service';
import { Event } from '@angular/router';
import { Cliente } from '../models/Cliente';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements OnChanges {

  pageObject: PageObject;
  clientesEncontrados: Cliente[] = [];
  clientesSelecionadosNaTabela: Cliente[] = [];
  pageableInfo: Pageable = JSON.parse(localStorage.getItem("pageable") || 'null');

  botaoCheckAllHabilitado: boolean = false;

  @Input() public filtrosAdicionados;

  constructor(private clienteService: ClienteService) { }

  ngDoCheck(): void {
    if (this.pageObject != null && this.pageableInfo == null) {
      this.pageableInfo = this.pageObject.pageable;
      this.pageableInfo.sortDirection = "desc"
    }
    localStorage.setItem('pageable', JSON.stringify(this.pageableInfo));
  }

  ngOnChanges() {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  invocaRequisicaoHttpGetParaAtualizarObjetos() {
    this.clienteService.getClientes(this.filtrosAdicionados, this.pageableInfo).subscribe(
      (res: PageObject) => {
        this.pageObject = res;
        this.clientesEncontrados = this.pageObject.content;
        this.clientesEncontrados.forEach(cliente => {
          if (cliente.checked == null) cliente.checked = false;
          if (cliente.expanded == null) cliente.expanded = false;
        })
      },
      (error: any) => console.log(error)
    );
  }

  alteraOrdenacao() {
    if (this.pageableInfo.sortDirection == "desc") this.pageableInfo.sortDirection = "asc";
    else this.pageableInfo.sortDirection = "desc";
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  alteraEstadoExpansaoTabela(indice: number) {
    this.clientesEncontrados[indice].expanded = !this.clientesEncontrados[indice].expanded;
  }

  alteraEstadoCheckTabela(indice: number) {
    this.clientesEncontrados[indice].checked = !this.clientesEncontrados[indice].checked;
  }

  checkAll() {
    this.botaoCheckAllHabilitado = !this.botaoCheckAllHabilitado;
    this.clientesEncontrados.forEach(cliente => {
      cliente.checked = this.botaoCheckAllHabilitado;
    })
  }

  GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
    return Array(n);
  }

  selecionarPagina(numeroPagina: number) {
    this.pageableInfo.pageNumber = numeroPagina;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  voltarPagina() {
    if (this.pageableInfo.pageNumber > 0) {
      this.pageableInfo.pageNumber--;
      this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    }
  }

  avancarPagina() {
    if (this.pageableInfo.pageNumber < this.pageObject.totalPages - 1) {
      this.pageableInfo.pageNumber++;
      this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    }
  }

}
