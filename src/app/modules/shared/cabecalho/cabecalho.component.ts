import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { ClienteService } from '../../pages/clientes/services/cliente.service';
import { ColaboradorService } from '../../pages/colaboradores/services/colaborador.service';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.scss']
})
export class CabecalhoComponent {

  constructor(
    private clienteService: ClienteService,
    private colaboradorService: ColaboradorService) { }

  @Input() pageableObject: any;
  @Input() modulo: string;
  @Input() itensSelecionadosNaTabela: any[];
  @Input() inputPlaceholder: string;
  @Input() botaoCriarHabilitado: boolean = true;

  @Output() emissorDeSolicitacaoDeExclusaoEmMassaDeItens = new EventEmitter<number[]>();
  @Output() emissorDeSolicitacaoDeRelatorio = new EventEmitter<number[]>();
  @Output() emissorDePageSizeComQuantidadeDeItensPorPaginaAlterada = new EventEmitter<number>();
  @Output() emissorDeBuscaFormControl = new EventEmitter<FormControl>();
  @Output() emissorDeObjetoPageableAposTypeAhead = new EventEmitter<any>();

  busca: FormControl = new FormControl();

  buscaSubscribe$ = this.busca.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map((valorDigitado) => valorDigitado != undefined ? valorDigitado.trim().toUpperCase() : undefined),
      tap(() => {
        this.pageableObject.pageNumber = 0;
      }),
      switchMap((valorDigitado) => this.encaminhaTypeAheadParaServicoDeCaptacaoDeObjetosCorreto(valorDigitado)),
    ).subscribe({
      next: (response) => {
        let sortDirection = this.pageableObject == null ? this.pageableObject = undefined : this.pageableObject.sortDirection;
        this.pageableObject = response;
        this.pageableObject.sortDirection = sortDirection;
        if (this.pageableObject.sortDirection == undefined) this.pageableObject.sortDirection = 'DESC';
        this.emissorDeObjetoPageableAposTypeAhead.emit(this.pageableObject);
      },
      error: () => {
        this.pageableObject = null;
      }
    })

  ngOnDestroy(): void {
    if (this.buscaSubscribe$ != undefined) this.buscaSubscribe$.unsubscribe();
  }

  encaminhaTypeAheadParaServicoDeCaptacaoDeObjetosCorreto(valorDigitado: any) {
    switch (this.modulo) {
      case 'clientes': {
        return this.clienteService.getClientes(valorDigitado, this.pageableObject)
      }
      case 'colaboradores': {
        return this.colaboradorService.getColaboradores(valorDigitado, this.pageableObject)
      }
      default: {
        return null;
      }
    }
  }

  alteraQuantidadeItensExibidosPorPagina(select) {
    let value: string = select.value;
    this.emissorDePageSizeComQuantidadeDeItensPorPaginaAlterada.emit(parseInt(value));
  }

  verificaSeConteudoMaiorQueZero(): boolean {
    if (this.pageableObject != null) {
      if (this.pageableObject.content != null) {
        if (this.pageableObject.content.length > 0) return true;
      }
    }
    return false;
  }

  geraRelatorio() {
    //TODO
    // let listaDeIdsDeClientesSelecionadosNaTabela: number[] = [];
    // this.itensSelecionadosNaTabela.forEach(cliente => { listaDeIdsDeClientesSelecionadosNaTabela.push(cliente.id) })
    // if (this.itensSelecionadosNaTabela.length == 0) listaDeIdsDeClientesSelecionadosNaTabela = [];
    // this.geraRelatorio$ = this.clienteService.obtemRelatorioClientes(listaDeIdsDeClientesSelecionadosNaTabela);
  }

  emiteSolicitacaoDeExclusaoEmMassaDeItens() {
    let itensSelecionadosNaTabela: number[] = [];
    this.itensSelecionadosNaTabela.forEach(cliente => { itensSelecionadosNaTabela.push(cliente.id) })
    if (this.itensSelecionadosNaTabela.length == 0) return;
    this.emissorDeSolicitacaoDeExclusaoEmMassaDeItens.emit(itensSelecionadosNaTabela);
  }

  emiteSolicitacaoDeRelatorio() {
    let listaDeIdsSelecionadosNaTabela: number[] = [];
    this.itensSelecionadosNaTabela.forEach(cliente => { listaDeIdsSelecionadosNaTabela.push(cliente.id) })
    if (this.itensSelecionadosNaTabela.length == 0) listaDeIdsSelecionadosNaTabela = [];
    this.emissorDeSolicitacaoDeRelatorio.emit(listaDeIdsSelecionadosNaTabela);
  }

  emiteFormControl() {
    this.emissorDeBuscaFormControl.emit(this.busca);
  }

}
