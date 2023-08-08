import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ColaboradorPageObject } from '../models/response/colaborador/ColaboradorPageObject';
import { ColaboradorResponse } from '../models/response/colaborador/ColaboradorResponse';
import { ColaboradorService } from '../services/colaborador.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Util } from 'src/app/modules/utils/Util';
import { TableTh } from 'src/app/modules/shared/tabela/models/TableTh';
import { TableTd } from 'src/app/modules/shared/tabela/models/TableTd';
import { fadeInOutAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fadeInOutAnimation]
})
export class ViewComponent {


  getColaboradores$: Subscription;
  removeColaboradores$: Subscription;
  removeColaboradoresEmMassa$: Subscription;
  geraRelatorio$: Subscription;

  buscaColaboradores: FormControl = new FormControl();

  itensSelecionadosNaTabela: ColaboradorResponse[] = JSON.parse(localStorage.getItem("itensSelecionadosNaTabela") || '[]');
  pageObject: ColaboradorPageObject = JSON.parse(localStorage.getItem("pageable") || 'null');

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');

  constructor(private colaboradorService: ColaboradorService, private _snackBar: MatSnackBar) { }

  ngAfterViewInit(): void {
    console.log('AfterviewInit');
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    if (Util.isNotObjectEmpty(this.pageObject)) this.pageObject.pageNumber = 0;

  }

  ngOnDestroy(): void {
    if (this.getColaboradores$ != undefined) this.getColaboradores$.unsubscribe();
    if (this.removeColaboradores$ != undefined) this.removeColaboradores$.unsubscribe();
    if (this.removeColaboradoresEmMassa$ != undefined) this.removeColaboradoresEmMassa$.unsubscribe();
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
        campo: 'MATRICULA',
        hidden: null
      },
      {
        campo: 'CARGO',
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
        campo: 'statusColaboradorEnum',
        hidden: null,
        maxLength: 18,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: [
          {
            value: 'ATIVO',
            className: 'green_span'
          },
          {
            value: 'AFASTADO',
            className: 'yellow_span'
          },
          {
            value: 'FERIAS',
            className: 'yellow_span'
          },
          {
            value: 'DISPENSADO',
            className: 'red_span'
          },
          {
            value: 'EXCLUIDO',
            className: 'red_span'
          },
          {
            value: 'FREELANCER',
            className: 'blue_span'
          },
        ]
      },
      {
        campo: 'matricula',
        hidden: null,
        maxLength: 30,
        type: 'string',
        titleCase: false,
        tableTdCustomClasses: [],
      },
      {
        campo: 'ocupacao',
        hidden: null,
        maxLength: 30,
        type: 'string',
        titleCase: true,
        tableTdCustomClasses: [],
      },

    );

    return tdsTabela;
  }

  invocaRequisicaoHttpGetParaAtualizarObjetos() {
    let buscaColaboradoresParam = this.buscaColaboradores.value != null && this.buscaColaboradores.value != '' ? this.buscaColaboradores.value : null;
    this.getColaboradores$ = this.colaboradorService.getColaboradores(buscaColaboradoresParam, this.pageObject).subscribe(
      {
        next: (response: ColaboradorPageObject) => {
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
          console.log(this.pageObject);
          this.checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados();
        }
      });
  }

  checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados() {
    this.itensSelecionadosNaTabela.forEach(colaboradorSelecionado => {
      let index: number = this.pageObject.content.findIndex(colaboradorEncontrado => colaboradorEncontrado.id === colaboradorSelecionado.id);
      if (index != -1) this.pageObject.content[index].checked = true;
    })
  }

  recebeSolicitacaoDeAtualizacaoDaTabela() {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeBuscaFormControl(busca: FormControl) {
    this.buscaColaboradores = busca;
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
    this.removeColaboradores$ = this.colaboradorService.removeColaborador(id).subscribe(
      {
        next: () => {
          this._snackBar.open("Colaborador Excluído com sucesso", "Fechar", {
            duration: 3500
          });
        },
        error: () => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        },
        complete: () => {
          let colaboradorRemovido: ColaboradorResponse[] = this.itensSelecionadosNaTabela.filter(colaborador => colaborador.id == id);
          if (colaboradorRemovido.length == 1) this.itensSelecionadosNaTabela.splice(this.itensSelecionadosNaTabela.indexOf(colaboradorRemovido[0]), 1);
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        }
      }
    );
  }

  recebeSolicitacaoDeExclusaoDeColaboradoresEmMassa(ids: number[]) {
    this.removeColaboradoresEmMassa$ = this.colaboradorService.removeColaboradoresEmMassa(ids).subscribe(
      {
        next: () => {
          this._snackBar.open("Colaboradores Excluídos com sucesso", "Fechar", {
            duration: 3000
          });
        },
        error: () => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos();
        },
        complete: () => {
          ids.forEach(idSelecionadoNaTabela => {
            let colaboradorRemovido: ColaboradorResponse[] = this.itensSelecionadosNaTabela.filter(colaborador => colaborador.id == idSelecionadoNaTabela);
            if (colaboradorRemovido.length == 1) this.itensSelecionadosNaTabela.splice(this.itensSelecionadosNaTabela.indexOf(colaboradorRemovido[0]), 1);
          })
          this.invocaRequisicaoHttpGetParaAtualizarObjetos();
          this._snackBar.open(ids.length > 1
            ? "Colaboradores removidos com sucesso"
            : "Colaborador removido com sucesso", "Fechar", {
            duration: 3500
          })
        }
      }
    );
  }

  recebeSolicitacaoDeRelatorio(ids: number[]) {
    this.geraRelatorio$ = this.colaboradorService.obtemRelatorioColaboradores(ids);
  }

}
