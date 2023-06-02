import { ColaboradorService } from './../../services/colaborador.service';
import { Subscription, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { Colaborador } from '../../models/Colaborador';
import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { FormControl } from '@angular/forms';
import { PageObject } from '../models/PageObject';
import { Router } from '@angular/router';
import { fadeInOutAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['../../../../../../dist/styles/table.scss', './tabela.component.scss'],
  animations: [fadeInOutAnimation]
})
export class TabelaComponent implements OnDestroy {

  getColaboradores$: Subscription;
  removeColaborador$: Subscription;

  buscaColaboradores: FormControl = new FormControl();

  buscaColaboradoresSubscribe$ = this.buscaColaboradores.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map((valorDigitado) => valorDigitado != undefined ? valorDigitado.trim() : undefined),
      tap(() => {
        this.pageableInfo.pageNumber = 0;
      }),
      switchMap((valorDigitado) => this.colaboradorService.getColaboradores(valorDigitado, this.pageableInfo)),
    ).subscribe({
      next: (response: PageObject) => {
        let sortDirection = this.pageableInfo == null ? this.pageableInfo = undefined : this.pageableInfo.sortDirection;
        this.pageableInfo = response;
        this.pageableInfo.sortDirection = sortDirection;
        if (this.pageableInfo.sortDirection == undefined) this.pageableInfo.sortDirection = 'DESC';
        this.pageableInfo.content.forEach(colaborador => {
          if (colaborador.checked == null) colaborador.checked = false;
          if (colaborador.expanded == null) colaborador.expanded = false;
        })
      },
      error: () => {
        this.pageableInfo = null;
      }
    })

  colaboradoresSelecionadosNaTabela: Colaborador[] = JSON.parse(localStorage.getItem("itensSelecionadosNaTabela") || '[]');
  pageableInfo: PageObject = JSON.parse(localStorage.getItem("pageable") || 'null');
  filtrosAdicionados: FiltroAdicionado[] = JSON.parse(localStorage.getItem("filtros") || '[]');

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');

  constructor(
    private colaboradorService: ColaboradorService,
    private _snackBar: MatSnackBar,
    private router: Router) { }

  ngDoCheck(): void {
    localStorage.setItem('itensSelecionadosNaTabela', JSON.stringify(this.colaboradoresSelecionadosNaTabela));
    localStorage.setItem('pageable', JSON.stringify(this.pageableInfo));
    this.ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll();
    this.checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados();
  }

  ngOnInit(): void {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    if (this.pageableInfo != null && this.pageableInfo != undefined) this.pageableInfo.pageNumber = 0;
  }

  ngOnDestroy(): void {
    if (this.getColaboradores$ != undefined) this.getColaboradores$.unsubscribe();
    if (this.removeColaborador$ != undefined) this.removeColaborador$.unsubscribe();
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
    let buscaColaboradoresParam = this.buscaColaboradores.value != null && this.buscaColaboradores.value != '' ? this.buscaColaboradores.value : null;
    this.getColaboradores$ = this.colaboradorService.getColaboradores(buscaColaboradoresParam, this.pageableInfo).subscribe(
      {
        next: (response: PageObject) => {
          let sortDirection = this.pageableInfo == null ? this.pageableInfo = undefined : this.pageableInfo.sortDirection;
          this.pageableInfo = response;
          this.pageableInfo.sortDirection = sortDirection;
          if (this.pageableInfo.sortDirection == undefined) this.pageableInfo.sortDirection = 'DESC';

          this.pageableInfo.content.forEach(colaborador => {
            if (colaborador.checked == null || colaborador.checked == undefined) colaborador.checked = false;
            if (colaborador.expanded == null || colaborador.expanded == undefined) colaborador.expanded = false;
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
    this.colaboradoresSelecionadosNaTabela.forEach(colaboradorSelecionado => {
      let index: number = this.pageableInfo.content.findIndex(colaboradorEncontrado => colaboradorEncontrado.id === colaboradorSelecionado.id);
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
        this.colaboradoresSelecionadosNaTabela.findIndex(colaboradorSelecionado => colaboradorSelecionado.id === this.pageableInfo.content[indice].id);
      this.colaboradoresSelecionadosNaTabela =
        this.colaboradoresSelecionadosNaTabela.filter((_, item) => item < indiceNaListaDeSelecionados || item >= indiceNaListaDeSelecionados + 1);
    }
    else {
      this.colaboradoresSelecionadosNaTabela = this.colaboradoresSelecionadosNaTabela.concat(this.pageableInfo.content[indice]);
    }
    this.pageableInfo.content[indice].checked = !this.pageableInfo.content[indice].checked;

    this.ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll();
  }

  checkAll() {
    if (!this.botaoCheckAllHabilitado) {
      this.pageableInfo.content.forEach(itemTabela => {
        if (!itemTabela.checked) {
          itemTabela.checked = true;
          this.colaboradoresSelecionadosNaTabela.push(itemTabela);
        }
      })
    }
    else {
      this.pageableInfo.content.forEach(itemTabela => {
        if (itemTabela.checked) {
          let colaboradorListaTabela: Colaborador[] = this.colaboradoresSelecionadosNaTabela.filter(item => item.id == itemTabela.id)
          if (colaboradorListaTabela.length == 1) {
            this.colaboradoresSelecionadosNaTabela.splice(this.colaboradoresSelecionadosNaTabela.indexOf(colaboradorListaTabela[0]), 1);
            itemTabela.checked = false;
          }
        }
      })
    }

    this.botaoCheckAllHabilitado = !this.botaoCheckAllHabilitado;

    localStorage.setItem('checkAll', JSON.stringify(this.botaoCheckAllHabilitado));
  }

  excluiColaborador(id: number) {
    this.removeColaborador$ = this.colaboradorService.removeColaborador(id).subscribe(
      {
        next: (response: Colaborador) => {
          this._snackBar.open("Colaborador Excluído com sucesso", "Fechar", {
            duration: 3500
          });
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        },
        complete: () => {
          let colaboradorRemovido: Colaborador[] = this.colaboradoresSelecionadosNaTabela.filter(colaborador => colaborador.id == id);
          if (colaboradorRemovido.length == 1) this.colaboradoresSelecionadosNaTabela.splice(this.colaboradoresSelecionadosNaTabela.indexOf(colaboradorRemovido[0]), 1);
          this.invocaRequisicaoHttpGetParaAtualizarObjetos()
        }
      }
    );
  }

  alteraQuantidadeItensExibidosPorPagina() {
    this.pageableInfo.pageNumber = 0;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebePageNumberAtualizado(paginaAtualizada: number) {
    this.pageableInfo.pageNumber = paginaAtualizada;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeBuscaColaboradoresFormControl(buscaColaboradores: FormControl) {
    this.buscaColaboradores = buscaColaboradores;
  }

  recebeSolicitacaoDeAtualizacaoDaTabela() {
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  recebeObjetoPageableInfoAtualizadoPosTypeAhead(pageableInfo: PageObject) {
    this.pageableInfo = pageableInfo;
  }

  recebeQtdItensPorPaginaAlterada(pageSize: number) {
    this.pageableInfo.pageNumber = 0;
    this.pageableInfo.pageSize = pageSize;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  navegarParaDetalhesColaborador(idColaborador: number) {
    let pathUrl: string = 'colaboradores/' + (idColaborador.toString());
    this.router.navigate([pathUrl]);
  }

}
