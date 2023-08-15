import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { ClienteService } from '../../pages/clientes/services/cliente.service';
import { ColaboradorService } from '../../pages/colaboradores/services/colaborador.service';
import { DespesaService } from '../../pages/despesas/services/despesa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Util } from '../../utils/Util';

@Component({
  selector: 'custom-table-header',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.scss']
})
export class CabecalhoComponent {

  constructor(
    private clienteService: ClienteService,
    private colaboradorService: ColaboradorService,
    private despesaService: DespesaService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

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

  filtroMesAtual: string;

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
        response.content.forEach(objeto => {
          objeto.options = {
            detalhesHabilitado: true,
            editarHabilitado: true,
            removerHabilitado: true
          }
        })
        this.pageableObject = response;
        this.pageableObject.sortDirection = sortDirection;
        if (this.pageableObject.sortDirection == undefined) this.pageableObject.sortDirection = 'DESC';
        this.emissorDeObjetoPageableAposTypeAhead.emit(this.pageableObject);
      },
      error: () => {
        this.pageableObject = null;
      }
    })

  ngOnInit(): void {
    this.realizaValidacaoFiltroBuscaPorMes();
  }

  ngOnDestroy(): void {
    if (this.buscaSubscribe$ != undefined) this.buscaSubscribe$.unsubscribe();
  }

  realizaValidacaoFiltroBuscaPorMes(): boolean {
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
          return false;
        }
        else {
          this.filtroMesAtual = date;
          return true;
        }
      }
      else {
        this.filtroMesAtual = Util.getMesAnoAtual();
        return false;
      }
    }
    else {
      this.filtroMesAtual = Util.getMesAnoAtual();
      return false
    }
  }

  alteraFiltro(event) {
    let value: string = event.target.value;

    if (Util.isEmptyString(value)) value = Util.getMesAnoAtual();

    this.filtroMesAtual = value;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(
      () =>
        this.router.navigate([this.modulo], {
          queryParams: {
            date: value
          },
          queryParamsHandling: 'merge',
        })
    );



  }

  encaminhaTypeAheadParaServicoDeCaptacaoDeObjetosCorreto(valorDigitado: any) {

    if (this.realizaValidacaoFiltroBuscaPorMes()) {

      switch (this.modulo) {
        case 'clientes': {
          return this.clienteService.getClientes(valorDigitado, this.pageableObject)
        }
        case 'colaboradores': {
          return this.colaboradorService.getColaboradores(valorDigitado, this.pageableObject)
        }
        case 'despesas': {
          return this.despesaService.getDespesas(valorDigitado, this.activatedRoute.snapshot.queryParamMap.get('date'), this.pageableObject)
        }
        default: {
          return null;
        }
      }

    }
    else {
      this.router.navigate([], {
        queryParams: {
          date: Util.getMesAnoAtual()
        },
        queryParamsHandling: 'merge',
      });
      return null;
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

  exibeFiltros() {

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