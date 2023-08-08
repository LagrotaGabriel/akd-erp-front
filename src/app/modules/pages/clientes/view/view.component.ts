import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableTd } from 'src/app/modules/shared/tabela/models/TableTd';
import { TableTh } from 'src/app/modules/shared/tabela/models/TableTh';
import { ClienteService } from '../services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { ClientePageObject } from '../models/ClientePageObject';
import { fadeInOutAnimation } from 'src/app/shared/animations';
import { Util } from 'src/app/modules/utils/Util';
import { ClienteResponse } from '../models/response/ClienteResponse';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fadeInOutAnimation]
})
export class ViewComponent {

  getClientes$: Subscription;
  removeCliente$: Subscription;
  removeClientesEmMassa$: Subscription;
  geraRelatorio$: Subscription;

  buscaClientes: FormControl = new FormControl();

  clientesSelecionadosNaTabela: ClienteResponse[] = JSON.parse(localStorage.getItem("itensSelecionadosNaTabela") || '[]');
  clientePageObject: ClientePageObject = JSON.parse(localStorage.getItem("pageable") || 'null');

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');

  constructor(private clienteService: ClienteService, private _snackBar: MatSnackBar) { }

  ngAfterViewInit(): void {
    console.log('AfterviewInit');
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    if (Util.isNotObjectEmpty(this.clientePageObject)) this.clientePageObject.pageNumber = 0;

  }

  ngOnDestroy(): void {
    if (this.getClientes$ != undefined) this.getClientes$.unsubscribe();
    if (this.removeCliente$ != undefined) this.removeCliente$.unsubscribe();
    if (this.removeClientesEmMassa$ != undefined) this.removeClientesEmMassa$.unsubscribe();
    if (this.geraRelatorio$ != undefined) this.geraRelatorio$.unsubscribe();
  }

  obtemThsTabela(): TableTh[] {
    let thsTabela: TableTh[] = []
    thsTabela.push(
      {
        campo: 'NOME',
        hidden: null
      },
      {
        campo: 'CPF/CNPJ',
        hidden: null
      },
      {
        campo: 'STATUS',
        hidden: null
      },
      {
        campo: 'TELEFONE',
        hidden: null
      },
      {
        campo: 'GIRO',
        hidden: null
      }
    );

    return thsTabela;
  }

  obtemTdsTabela(): TableTd[] {
    let tdsTabela: TableTd[] = []
    tdsTabela.push(
      {
        campo: 'nome',
        hidden: null,
        maxLength: 30,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: [],
      },
      {
        campo: 'cpfCnpj',
        hidden: null,
        maxLength: 18,
        type: 'string',
        titleCase: false,
        tableTdCustomClasses: [],
      },
      {
        campo: 'statusCliente',
        hidden: null,
        maxLength: 18,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: [
          {
            value: 'COMUM',
            className: 'blue_span'
          },
          {
            value: 'VIP',
            className: 'purple_span'
          },
          {
            value: 'DEVEDOR',
            className: 'red_span'
          },
          {
            value: 'ATENCAO',
            className: 'yellow_span'
          },
        ]
      },
      {
        campo: 'telefone',
        hidden: null,
        maxLength: 14,
        type: 'string',
        titleCase: false,
        tableTdCustomClasses: []
      },
      {
        campo: 'giro',
        hidden: null,
        maxLength: 15,
        type: 'money',
        titleCase: false,
        tableTdCustomClasses: []
      }
    );

    return tdsTabela;
  }

  invocaRequisicaoHttpGetParaAtualizarObjetos() {
    let buscaClientesParam = this.buscaClientes.value != null && this.buscaClientes.value != '' ? this.buscaClientes.value : null;
    this.getClientes$ = this.clienteService.getClientes(buscaClientesParam, this.clientePageObject).subscribe(
      {
        next: (response: ClientePageObject) => {
          let sortDirection = this.clientePageObject == null ? this.clientePageObject = undefined : this.clientePageObject.sortDirection;
          response.content.forEach(objeto => {
            objeto.options = {
              detalhesHabilitado: true,
              editarHabilitado: true,
              removerHabilitado: true
            }
          })
          this.clientePageObject = response;
          this.clientePageObject.sortDirection = sortDirection;
          if (this.clientePageObject.sortDirection == undefined) this.clientePageObject.sortDirection = 'DESC';
        },
        error: () => {
          this.clientePageObject = null;
        },
        complete: () => {
          this.checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados();
        }
      });
  }

  checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados() {
    this.clientesSelecionadosNaTabela.forEach(clienteSelecionado => {
      let index: number = this.clientePageObject.content.findIndex(clienteEncontrado => clienteEncontrado.id === clienteSelecionado.id);
      if (index != -1) this.clientePageObject.content[index].checked = true;
    })
  }

  recebeSolicitacaoDeAtualizacaoDaTabela() {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeBuscaFormControl(busca: FormControl) {
    this.buscaClientes = busca;
  }

  recebeQtdItensPorPaginaAlterada(pageSize: number) {
    this.clientePageObject.pageNumber = 0;
    this.clientePageObject.pageSize = pageSize;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeObjetoPageableInfoAtualizadoPosTypeAhead(pageableObject: any) {
    this.clientePageObject = pageableObject;
  }

  recebeAtualizacaoNosChecksDaTabela(itensSelecionados: any[]) {
    this.clientesSelecionadosNaTabela = itensSelecionados;
  }

  recebePageNumberAtualizado(paginaAtualizada: number) {
    this.clientePageObject.pageNumber = paginaAtualizada;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeSolicitacaoDeExclusao(id: number) {
    this.removeCliente$ = this.clienteService.removeCliente(id).subscribe(
      {
        next: () => {
          this._snackBar.open("Cliente Excluído com sucesso", "Fechar", {
            duration: 3500
          });
        },
        error: () => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        },
        complete: () => {
          let clienteRemovido: ClienteResponse[] = this.clientesSelecionadosNaTabela.filter(cliente => cliente.id == id);
          if (clienteRemovido.length == 1) this.clientesSelecionadosNaTabela.splice(this.clientesSelecionadosNaTabela.indexOf(clienteRemovido[0]), 1);
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        }
      }
    );
  }

  recebeSolicitacaoDeExclusaoDeClientesEmMassa(ids: number[]) {
    this.removeClientesEmMassa$ = this.clienteService.removeClienteEmMassa(ids).subscribe(
      {
        next: () => {
          this._snackBar.open("Clientes Excluídos com sucesso", "Fechar", {
            duration: 3000
          });
        },
        error: () => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos();
        },
        complete: () => {
          ids.forEach(idSelecionadoNaTabela => {
            let clienteRemovido: ClienteResponse[] = this.clientesSelecionadosNaTabela.filter(cliente => cliente.id == idSelecionadoNaTabela);
            if (clienteRemovido.length == 1) this.clientesSelecionadosNaTabela.splice(this.clientesSelecionadosNaTabela.indexOf(clienteRemovido[0]), 1);
          })
          this.invocaRequisicaoHttpGetParaAtualizarObjetos();
          this._snackBar.open(ids.length > 1
            ? "Clientes removidos com sucesso"
            : "Cliente removido com sucesso", "Fechar", {
            duration: 3500
          })
        }
      }
    );
  }

  recebeSolicitacaoDeRelatorio(ids: number[]) {
    this.geraRelatorio$ = this.clienteService.obtemRelatorioClientes(ids);
  }

}
