import { Subscription, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageObject } from '../../models/PageObject';
import { Cliente } from '../../models/Cliente';
import { FormControl } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['../../../../../../dist/cabecalho.scss'],
})
export class CabecalhoComponent {

  constructor(private clienteService: ClienteService, private _snackBar: MatSnackBar) { }

  @Input() pageableInfo: PageObject;
  @Input() clientesSelecionadosNaTabela: Cliente[];

  @Output() emissorDePageSizeComQuantidadeDeItensPorPaginaAlterada = new EventEmitter<number>();
  @Output() emissorDeBuscaClientesFormControl = new EventEmitter<FormControl>();
  @Output() emissorDeSolicitacaoDeAtualizacaoDeTabela = new EventEmitter<any>();
  @Output() emissorDePageableInfoAposTypeAhead = new EventEmitter<PageObject>();

  buscaClientes: FormControl = new FormControl();

  buscaClientesSubscribe$ = this.buscaClientes.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map((valorDigitado) => valorDigitado != undefined ? valorDigitado.trim() : undefined),
      tap(() => {
        this.pageableInfo.pageNumber = 0;
      }),
      switchMap((valorDigitado) => this.clienteService.getClientes(valorDigitado, this.pageableInfo)),
    ).subscribe({
      next: (response: PageObject) => {
        let sortDirection = this.pageableInfo == null ? this.pageableInfo = undefined : this.pageableInfo.sortDirection;
        this.pageableInfo = response;
        this.pageableInfo.sortDirection = sortDirection;
        if (this.pageableInfo.sortDirection == undefined) this.pageableInfo.sortDirection = 'DESC';
        this.pageableInfo.content.forEach(cliente => {
          if (cliente.checked == null) cliente.checked = false;
          if (cliente.expanded == null) cliente.expanded = false;
        })
        this.emissorDePageableInfoAposTypeAhead.emit(this.pageableInfo);
      },
      error: () => {
        this.pageableInfo = null;
      }
    })

  geraRelatorio$: Subscription;
  removeClienteEmMassa$: Subscription;

  ngOnDestroy(): void {
    if (this.geraRelatorio$ != undefined) this.geraRelatorio$.unsubscribe();
    if (this.buscaClientesSubscribe$ != undefined) this.buscaClientesSubscribe$.unsubscribe();
    if (this.removeClienteEmMassa$ != undefined) this.removeClienteEmMassa$.unsubscribe();
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
    let listaDeIdsDeClientesSelecionadosNaTabela: number[] = [];
    this.clientesSelecionadosNaTabela.forEach(cliente => { listaDeIdsDeClientesSelecionadosNaTabela.push(cliente.id) })
    if (this.clientesSelecionadosNaTabela.length == 0) listaDeIdsDeClientesSelecionadosNaTabela = [];
    this.geraRelatorio$ = this.clienteService.obtemRelatorioClientes(listaDeIdsDeClientesSelecionadosNaTabela);
  }

  excluiClientesEmMassa() {
    let listaDeIdsDeClientesSelecionadosNaTabela: number[] = [];
    this.clientesSelecionadosNaTabela.forEach(cliente => { listaDeIdsDeClientesSelecionadosNaTabela.push(cliente.id) })

    if (this.clientesSelecionadosNaTabela.length == 0) return;

    this.removeClienteEmMassa$ = this.clienteService.removeClienteEmMassa(listaDeIdsDeClientesSelecionadosNaTabela).subscribe(
      {
        next: () => {
          this._snackBar.open("Clientes Excluídos com sucesso", "Fechar", {
            duration: 3000
          });
        },
        error: () => {
          this.emissorDeSolicitacaoDeAtualizacaoDeTabela.emit();
        },
        complete: () => {
          listaDeIdsDeClientesSelecionadosNaTabela.forEach(idSelecionadoNaTabela => {
            let clienteRemovido: Cliente[] = this.clientesSelecionadosNaTabela.filter(cliente => cliente.id == idSelecionadoNaTabela);
            if (clienteRemovido.length == 1) this.clientesSelecionadosNaTabela.splice(this.clientesSelecionadosNaTabela.indexOf(clienteRemovido[0]), 1);
          })
          this.emissorDeSolicitacaoDeAtualizacaoDeTabela.emit();
          this._snackBar.open(listaDeIdsDeClientesSelecionadosNaTabela.length > 1
            ? "Clientes removidos com sucesso"
            : "Cliente removido com sucesso", "Fechar", {
            duration: 3500
          })
        }
      }
    );
  }

  emiteFormControl() {
    this.emissorDeBuscaClientesFormControl.emit(this.buscaClientes);
  }

}
