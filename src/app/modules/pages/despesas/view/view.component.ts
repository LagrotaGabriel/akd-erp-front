import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DespesaResponse } from '../models/response/DespesaResponse';
import { DespesaPageObject } from '../models/response/DespesaPageObject';
import { Util } from 'src/app/modules/utils/Util';
import { DespesaService } from '../services/despesa.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableTh } from 'src/app/modules/shared/tabela/models/TableTh';
import { TableTd } from 'src/app/modules/shared/tabela/models/TableTd';
import { fadeInOutAnimation } from 'src/app/shared/animations';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fadeInOutAnimation]
})
export class ViewComponent {
  getItens$: Subscription;
  removeItem$: Subscription;
  removeItensEmMassa$: Subscription;
  geraRelatorio$: Subscription;
  obtemPorId$: Subscription;

  filtroMesAtual: string;

  buscaDespesas: FormControl = new FormControl();

  itensSelecionadosNaTabela: DespesaResponse[] = JSON.parse(localStorage.getItem("itensSelecionadosNaTabela") || '[]');
  pageObject: DespesaPageObject = JSON.parse(localStorage.getItem("pageable") || 'null');

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');

  constructor(
    private despesaService: DespesaService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.realizaValidacaoFiltroBuscaPorMes();
  }

  realizaValidacaoFiltroBuscaPorMes() {
    let params = this.activatedRoute.snapshot.queryParamMap;

    if (params.has('date')) {
      let date = params.get('date');
      if (/\d{4}\-\d{2}/.test(date)) {
        if (parseInt(date.split('-')[0]) < 1900
          || parseInt(date.split('-')[0]) > 2100
          || parseInt(date.split('-')[1]) < 1
          || parseInt(date.split('-')[1]) > 12) {
          this.router.navigate([], {
            queryParams: {
              date: Util.getMesAnoAtual()
            },
            queryParamsHandling: 'merge',
          });
          this.filtroMesAtual = Util.getMesAnoAtual();
        }
        else {
          this.filtroMesAtual = date;
        }
      }
      else {
        this.router.navigate([], {
          queryParams: {
            date: Util.getMesAnoAtual()
          },
          queryParamsHandling: 'merge',
        });
        this.filtroMesAtual = Util.getMesAnoAtual();
      }
    }
    else {
      this.router.navigate([], {
        queryParams: {
          date: Util.getMesAnoAtual()
        },
        queryParamsHandling: 'merge',
      });
      this.filtroMesAtual = Util.getMesAnoAtual();
    }
  }

  ngAfterViewInit(): void {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    if (Util.isNotObjectEmpty(this.pageObject)) this.pageObject.pageNumber = 0;

  }

  ngOnDestroy(): void {
    if (this.getItens$ != undefined) this.getItens$.unsubscribe();
    if (this.removeItem$ != undefined) this.removeItem$.unsubscribe();
    if (this.removeItensEmMassa$ != undefined) this.removeItensEmMassa$.unsubscribe();
    if (this.geraRelatorio$ != undefined) this.geraRelatorio$.unsubscribe();
    if (this.obtemPorId$ != undefined) this.obtemPorId$.unsubscribe();
  }

  obtemThsTabela(): TableTh[] {
    let thsTabela: TableTh[] = []
    thsTabela.push(
      {
        campo: 'PAGAMENTO',
        hidden: null
      },
      {
        campo: 'DESCRIÇÃO',
        hidden: null
      },
      {
        campo: 'VALOR',
        hidden: null
      },
      {
        campo: 'TIPO',
        hidden: null
      },
      {
        campo: 'AGENDAMENTO',
        hidden: null
      },
      {
        campo: 'RECORRENCIA',
        hidden: null
      }
    );

    return thsTabela;
  }

  obtemTdsTabela(): TableTd[] {
    let tdsTabela: TableTd[] = []
    tdsTabela.push(
      {
        campo: 'dataPagamento',
        hidden: null,
        maxLength: 30,
        type: 'date',
        titleCase: false,
        tableTdCustomClasses: [
          {
            value: 'Agendado',
            className: 'yellow_text'
          },
        ],
      },
      {
        campo: 'descricao',
        hidden: null,
        maxLength: 30,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: [],
      },
      {
        campo: 'valor',
        hidden: null,
        maxLength: 18,
        type: 'money',
        titleCase: false,
        tableTdCustomClasses: []
      },
      {
        campo: 'tipoDespesa',
        hidden: null,
        maxLength: 30,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: [],
      },
      {
        campo: 'dataAgendamento',
        hidden: null,
        maxLength: 30,
        type: 'date',
        titleCase: false,
        tableTdCustomClasses: [
          // {
          //   value: 'Pago',
          //   className: 'green_text'
          // },
          // {
          //   value: 'Amanhã',
          //   className: 'orange_text'
          // },
          // {
          //   value: 'Atrasado',
          //   className: 'red_text'
          // },
        ],
      },
      {
        campo: 'observacao',
        hidden: null,
        maxLength: 30,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: []
      }
    );

    return tdsTabela;
  }

  invocaRequisicaoHttpGetParaAtualizarObjetos() {
    let buscaParam = this.buscaDespesas.value != null && this.buscaDespesas.value != '' ? this.buscaDespesas.value : null;
    this.getItens$ = this.despesaService.getDespesas(buscaParam, this.filtroMesAtual, this.pageObject).subscribe(
      {
        next: (response: DespesaPageObject) => {
          let sortDirection = this.pageObject == null ? this.pageObject = undefined : this.pageObject.sortDirection;
          response.content.forEach(objeto => {
            objeto.options = {
              detalhesHabilitado: true,
              editarHabilitado: true,
              removerHabilitado: true
            }
          })
          this.pageObject = response;
          this.pageObject.sortDirection = sortDirection;
          if (this.pageObject.sortDirection == undefined) this.pageObject.sortDirection = 'DESC';
        },
        error: () => {
          this.pageObject = null;
        },
        complete: () => {
          this.checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados();
        }
      });
  }

  checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados() {
    this.itensSelecionadosNaTabela.forEach(itemSelecionado => {
      let index: number = this.pageObject.content.findIndex(itemEncontrado => itemEncontrado.id === itemSelecionado.id);
      if (index != -1) this.pageObject.content[index].checked = true;
    })
  }

  recebeSolicitacaoDeAtualizacaoDaTabela() {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeBuscaFormControl(busca: FormControl) {
    this.buscaDespesas = busca;
  }

  recebeQtdItensPorPaginaAlterada(pageSize: number) {
    this.pageObject.pageNumber = 0;
    this.pageObject.pageSize = pageSize;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeObjetoPageableInfoAtualizadoPosTypeAhead(pageableObject: any) {
    this.pageObject = pageableObject;
  }

  recebeAtualizacaoNosChecksDaTabela(itensSelecionados: any[]) {
    this.itensSelecionadosNaTabela = itensSelecionados;
  }

  recebePageNumberAtualizado(paginaAtualizada: number) {
    this.pageObject.pageNumber = paginaAtualizada;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeSolicitacaoDeExclusao(id: number) {

    let exclusaoRecorrencias: boolean = false;

    this.obtemPorId$ = this.despesaService.obtemDespesaPorId(id).subscribe(
      {
        next: (response: DespesaResponse) => {
          if (response.qtdRecorrencias > 0)
            if (window.confirm('A despesa possui recorrências. Deseja que elas também sejam excluídas?'))
              exclusaoRecorrencias = true;
        },
        error: () => {
          this._snackBar.open("Ocorreu um erro na exclusão da despesa", "Fechar", {
            duration: 3500
          })
        },
        complete: () => {
          this.removeItem$ = this.despesaService.removeDespesa(id, exclusaoRecorrencias).subscribe(
            {
              next: () => {
                this._snackBar.open("Despesa excluída com sucesso", "Fechar", {
                  duration: 3500
                });
              },
              error: () => {
                this.invocaRequisicaoHttpGetParaAtualizarObjetos()
              },
              complete: () => {
                let itemRemovido: DespesaResponse[] = this.itensSelecionadosNaTabela.filter(item => item.id == id);
                if (itemRemovido.length == 1) this.itensSelecionadosNaTabela.splice(this.itensSelecionadosNaTabela.indexOf(itemRemovido[0]), 1);
                this.invocaRequisicaoHttpGetParaAtualizarObjetos()
              }
            }
          );
        }
      }
    )
  }

  recebeSolicitacaoDeExclusaoDeDespesasEmMassa(ids: number[]) {
    this.removeItensEmMassa$ = this.despesaService.removeDespesasEmMassa(ids).subscribe(
      {
        next: () => {
          this._snackBar.open("Despesas excluídas com sucesso", "Fechar", {
            duration: 3000
          });
        },
        error: () => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos();
        },
        complete: () => {
          ids.forEach(idSelecionadoNaTabela => {
            let itemRemovido: DespesaResponse[] = this.itensSelecionadosNaTabela.filter(item => item.id == idSelecionadoNaTabela);
            if (itemRemovido.length == 1) this.itensSelecionadosNaTabela.splice(this.itensSelecionadosNaTabela.indexOf(itemRemovido[0]), 1);
          })
          this.invocaRequisicaoHttpGetParaAtualizarObjetos();
          this._snackBar.open(ids.length > 1
            ? "Despesas removidas com sucesso"
            : "Despesa removida com sucesso", "Fechar", {
            duration: 3500
          })
        }
      }
    );
  }

  recebeSolicitacaoDeRelatorio(ids: number[]) {
    this.geraRelatorio$ = this.despesaService.obtemRelatorio(ids);
  }

}
