import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColaboradorService } from '../../../services/colaborador.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageObject } from '../../models/PageObject';
import { FormControl } from '@angular/forms';
import { Colaborador } from '../../models/Colaborador';
import { Subscription, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['../../../../../../../dist/styles/cabecalho.scss'],
})
export class CabecalhoComponent {

  constructor(private colaboradorService: ColaboradorService, private _snackBar: MatSnackBar) { }

  @Input() pageableInfo: PageObject;
  @Input() colaboradoresSelecionadosNaTabela: Colaborador[];

  @Output() emissorDePageSizeComQuantidadeDeItensPorPaginaAlterada = new EventEmitter<number>();
  @Output() emissorDeBuscaColaboradoresFormControl = new EventEmitter<FormControl>();
  @Output() emissorDeSolicitacaoDeAtualizacaoDeTabela = new EventEmitter<any>();
  @Output() emissorDePageableInfoAposTypeAhead = new EventEmitter<PageObject>();

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
        this.emissorDePageableInfoAposTypeAhead.emit(this.pageableInfo);
      },
      error: () => {
        this.pageableInfo = null;
      }
    })

  geraRelatorio$: Subscription;
  removeColaboradorEmMassa$: Subscription;

  ngOnDestroy(): void {
    const startTime = performance.now();
    if (this.geraRelatorio$ != undefined) this.geraRelatorio$.unsubscribe();
    if (this.buscaColaboradoresSubscribe$ != undefined) this.buscaColaboradoresSubscribe$.unsubscribe();
    if (this.removeColaboradorEmMassa$ != undefined) this.removeColaboradorEmMassa$.unsubscribe();
    const duration = performance.now() - startTime;
    console.log(`ngOnDestroy levou ${duration}ms`);
  }

  alteraQuantidadeItensExibidosPorPagina(select) {
    let value: string = select.value;
    this.emissorDePageSizeComQuantidadeDeItensPorPaginaAlterada.emit(parseInt(value));
  }

  verificaSeConteudoMaiorQueZero(): boolean {
    if (this.pageableInfo != null) {
      if (this.pageableInfo.content != null) {
        if (this.pageableInfo.content.length > 0) return true;
      }
    }
    return false;
  }

  geraRelatorio() {
    const startTime = performance.now();
    let listaDeIdsDeColaboradoresSelecionadosNaTabela: number[] = [];
    this.colaboradoresSelecionadosNaTabela.forEach(colaborador => { listaDeIdsDeColaboradoresSelecionadosNaTabela.push(colaborador.id) })
    if (this.colaboradoresSelecionadosNaTabela.length == 0) listaDeIdsDeColaboradoresSelecionadosNaTabela = [];
    this.geraRelatorio$ = this.colaboradorService.obtemRelatorioColaboradores(listaDeIdsDeColaboradoresSelecionadosNaTabela);
    const duration = performance.now() - startTime;
    console.log(`Geração de relatórios levou ${duration}ms`);
  }

  excluiColaboradoresEmMassa() {
    let listaDeIdsDeColaboradoresSelecionadosNaTabela: number[] = [];
    this.colaboradoresSelecionadosNaTabela.forEach(colaborador => { listaDeIdsDeColaboradoresSelecionadosNaTabela.push(colaborador.id) })

    if (this.colaboradoresSelecionadosNaTabela.length == 0) return;

    this.removeColaboradorEmMassa$ = this.colaboradorService.removeColaboradoresEmMassa(listaDeIdsDeColaboradoresSelecionadosNaTabela).subscribe(
      {
        next: () => {
          this._snackBar.open("Colaboradores Excluídos com sucesso", "Fechar", {
            duration: 3000
          });
        },
        error: () => {
          this.emissorDeSolicitacaoDeAtualizacaoDeTabela.emit();
        },
        complete: () => {
          listaDeIdsDeColaboradoresSelecionadosNaTabela.forEach(idSelecionadoNaTabela => {
            let colaboradorRemovido: Colaborador[] = this.colaboradoresSelecionadosNaTabela.filter(colaborador => colaborador.id == idSelecionadoNaTabela);
            if (colaboradorRemovido.length == 1) this.colaboradoresSelecionadosNaTabela.splice(this.colaboradoresSelecionadosNaTabela.indexOf(colaboradorRemovido[0]), 1);
          })
          this.emissorDeSolicitacaoDeAtualizacaoDeTabela.emit();
          this._snackBar.open(listaDeIdsDeColaboradoresSelecionadosNaTabela.length > 1
            ? "Colaboradores removidos com sucesso"
            : "Colaborador removido com sucesso", "Fechar", {
            duration: 3500
          })
        }
      }
    );
  }

  emiteFormControl() {
    this.emissorDeBuscaColaboradoresFormControl.emit(this.buscaColaboradores);
  }

}
