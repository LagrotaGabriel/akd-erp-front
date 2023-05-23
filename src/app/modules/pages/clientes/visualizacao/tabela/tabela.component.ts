import { Subscription } from 'rxjs';
import { Cliente } from '../models/Cliente';
import { PageObject } from '../models/PageObject';
import { Component, OnDestroy } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { FormControl } from '@angular/forms';
import { fadeInOutAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['../../../../../../dist/styles/table.scss', './tabela.component.scss'],
  animations: [fadeInOutAnimation]
})
export class TabelaComponent implements OnDestroy {

  getClientes$: Subscription;
  removeCliente$: Subscription;

  buscaClientes: FormControl = new FormControl();

  clientesSelecionadosNaTabela: Cliente[] = JSON.parse(localStorage.getItem("itensSelecionadosNaTabela") || '[]');
  pageableInfo: PageObject = JSON.parse(localStorage.getItem("pageable") || 'null');
  filtrosAdicionados: FiltroAdicionado[] = JSON.parse(localStorage.getItem("filtros") || '[]');

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');

  constructor(private clienteService: ClienteService, private _snackBar: MatSnackBar) { }

  ngDoCheck(): void {
    localStorage.setItem('itensSelecionadosNaTabela', JSON.stringify(this.clientesSelecionadosNaTabela));
    localStorage.setItem('pageable', JSON.stringify(this.pageableInfo));
    this.ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll();
    this.checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados();
  }

  ngOnInit(): void {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    if (this.pageableInfo != null && this.pageableInfo != undefined) this.pageableInfo.pageNumber = 0;
  }

  ngOnDestroy(): void {
    if (this.getClientes$ != undefined) this.getClientes$.unsubscribe();
    if (this.removeCliente$ != undefined) this.removeCliente$.unsubscribe();
  }

  verificaSeConteudoMaiorQueZero(): boolean {
    if (this.pageableInfo != null) {
      if (this.pageableInfo.content != null) {
        if (this.pageableInfo.content.length > 0) return true;
      }
    }
    return false;
  }

  invocaRequisicaoHttpGetParaAtualizarObjetos() {
    let buscaClientesParam = this.buscaClientes.value != null && this.buscaClientes.value != '' ? this.buscaClientes.value : null;
    this.getClientes$ = this.clienteService.getClientes(buscaClientesParam, this.pageableInfo).subscribe(
      {
        next: (response: PageObject) => {
          let sortDirection = this.pageableInfo == null ? this.pageableInfo = undefined : this.pageableInfo.sortDirection;
          this.pageableInfo = response;
          this.pageableInfo.sortDirection = sortDirection;
          if (this.pageableInfo.sortDirection == undefined) this.pageableInfo.sortDirection = 'DESC';

          this.pageableInfo.content.forEach(cliente => {
            if (cliente.checked == null || cliente.checked == undefined) cliente.checked = false;
            if (cliente.expanded == null || cliente.expanded == undefined) cliente.expanded = false;
          })

        },
        error: () => {
          this.pageableInfo = null;
        }
      });
  }

  ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll() {
    if (this.verificaSeConteudoMaiorQueZero()) {
      if (this.pageableInfo.content.filter(e => e.checked === false).length > 0) {
        this.botaoCheckAllHabilitado = false;
      }
      else if (this.pageableInfo.content.filter(e => e.checked).length == this.pageableInfo.content.length) {
        this.botaoCheckAllHabilitado = true;
      }
    }
  }

  checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados() {
    this.clientesSelecionadosNaTabela.forEach(clienteSelecionado => {
      let index: number = this.pageableInfo.content.findIndex(clienteEncontrado => clienteEncontrado.id === clienteSelecionado.id);
      if (index != -1) this.pageableInfo.content[index].checked = true;
    })
  }

  alteraOrdenacao() {
    if (this.pageableInfo.sortDirection == "DESC") this.pageableInfo.sortDirection = "ASC";
    else this.pageableInfo.sortDirection = "DESC";
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  alteraEstadoExpansaoTabela(indice: number) {
    this.pageableInfo.content[indice].expanded = !this.pageableInfo.content[indice].expanded;
  }

  alteraEstadoCheckTabela(indice: number) {
    if (this.pageableInfo.content[indice].checked) {
      let indiceNaListaDeSelecionados: number =
        this.clientesSelecionadosNaTabela.findIndex(clienteSelecionado => clienteSelecionado.id === this.pageableInfo.content[indice].id);
      this.clientesSelecionadosNaTabela =
        this.clientesSelecionadosNaTabela.filter((_, item) => item < indiceNaListaDeSelecionados || item >= indiceNaListaDeSelecionados + 1);
    }
    else {
      this.clientesSelecionadosNaTabela = this.clientesSelecionadosNaTabela.concat(this.pageableInfo.content[indice]);
    }
    this.pageableInfo.content[indice].checked = !this.pageableInfo.content[indice].checked;

    this.ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll();
  }

  checkAll() {
    if (!this.botaoCheckAllHabilitado) {
      this.pageableInfo.content.forEach(itemTabela => {
        if (!itemTabela.checked) {
          itemTabela.checked = true;
          this.clientesSelecionadosNaTabela.push(itemTabela);
        }
      })
    }
    else {
      this.pageableInfo.content.forEach(itemTabela => {
        if (itemTabela.checked) {
          let clienteListaTabela: Cliente[] = this.clientesSelecionadosNaTabela.filter(item => item.id == itemTabela.id)
          if (clienteListaTabela.length == 1) {
            this.clientesSelecionadosNaTabela.splice(this.clientesSelecionadosNaTabela.indexOf(clienteListaTabela[0]), 1);
            itemTabela.checked = false;
          }
        }
      })
    }

    this.botaoCheckAllHabilitado = !this.botaoCheckAllHabilitado;

    localStorage.setItem('checkAll', JSON.stringify(this.botaoCheckAllHabilitado));
  }

  excluiCliente(id: number) {
    this.removeCliente$ = this.clienteService.removeCliente(id).subscribe(
      {
        next: (response: Cliente) => {
          this._snackBar.open("Cliente Excluído com sucesso", "Fechar", {
            duration: 3500
          });
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        },
        complete: () => {
          let clienteRemovido: Cliente[] = this.clientesSelecionadosNaTabela.filter(cliente => cliente.id == id);
          if (clienteRemovido.length == 1) this.clientesSelecionadosNaTabela.splice(this.clientesSelecionadosNaTabela.indexOf(clienteRemovido[0]), 1);
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        }
      }
    );
  }

  recebeQtdItensPorPaginaAlterada(pageSize: number) {
    this.pageableInfo.pageNumber = 0;
    this.pageableInfo.pageSize = pageSize;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebePageNumberAtualizado(paginaAtualizada: number) {
    this.pageableInfo.pageNumber = paginaAtualizada;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeBuscaClientesFormControl(buscaClientes: FormControl) {
    this.buscaClientes = buscaClientes;
  }

  recebeSolicitacaoDeAtualizacaoDaTabela() {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeObjetoPageableInfoAtualizadoPosTypeAhead(pageableInfo: PageObject) {
    this.pageableInfo = pageableInfo;
  }

}
