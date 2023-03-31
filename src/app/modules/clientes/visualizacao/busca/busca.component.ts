import { FiltrosService } from '../../../../shared/services/filtros.service';
import { Component, EventEmitter, Input, Output, DoCheck, OnInit } from '@angular/core';
import { Filtro } from 'src/app/shared/models/filtros/Filtro';
import { TiposFiltro } from 'src/app/shared/models/filtros/TiposFiltro';
import { trigger, style, animate, transition } from '@angular/animations';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { Chips } from 'src/app/shared/models/filtros/Chips';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../services/cliente.service';
import { MetaDadosCliente } from '../models/MetaDadosCliente';

@Component({
  selector: 'app-busca',
  templateUrl: './busca.component.html',
  styleUrls: ['./busca.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(300, style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class BuscaComponent implements OnInit, DoCheck {

  constructor(
    private filtrosService: FiltrosService,
    public datepipe: DatePipe,
    private _snackBar: MatSnackBar) { }

  ngDoCheck(): void {
    localStorage.setItem('filtros', JSON.stringify(this.filtrosAdicionados));
    localStorage.setItem('tiposBuscaHabilitados', JSON.stringify(this.tiposBusca));
    localStorage.setItem('chips', JSON.stringify(this.chips));
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.filtrosAdicionadosExportados.emit(this.filtrosAdicionados);
    }, 0);
    if (this.tiposBusca.length == 0) this.tiposBusca = this.filtrosService.setaTiposFiltro(this.tiposFiltroBusca);
  }

  metaDados: MetaDadosCliente; // Meta dados obtido através de requisição HTTP
  popupFiltro: boolean = false;  // Verificação do estado do popup de adição de novos filtros

  // Estado atual dos chips
  chips: Chips = JSON.parse(localStorage.getItem("chips") || JSON.stringify({
    'chipsExibidos': false, 'matRippleOlhoDesabilitado': true,
    'iconeOlho': 'visibility', 'descricaoAoPassarMouse': 'Não há filtros a serem exibidos'
  }));

  tipoBuscaSelect: string = ""; // Select onde selecionamos o tipo de filtro a ser utilizado na busca
  inputBusca: string = ""; // Input com valor atualizado de um novo filtro
  tipoBuscaAtual: Filtro; // Objeto Filtro indicando qual é o tipo atual de filtro que está selecionado no popup

  @Output() filtrosAdicionadosExportados = new EventEmitter();
  public filtrosAdicionados: FiltroAdicionado[] = JSON.parse(localStorage.getItem("filtros") || '[]'); // Lista de filtros de busca ativos

  // Iniciando listagem de tipos de filtros que serão utilizados no módulo
  tiposFiltroBusca: TiposFiltro[] =
    [
      TiposFiltro.NOME,
      TiposFiltro.EMAIL,
      TiposFiltro.CPF_CNPJ,
      TiposFiltro.BAIRRO,
      TiposFiltro.DATA,
      TiposFiltro.MES_ANO
    ]

  // Inicializando lista de objetos a serem filtrados com base nos tipos iniciados anteriormente
  tiposBusca: Filtro[] = JSON.parse(localStorage.getItem("tiposBuscaHabilitados") || '[]');

  @Input() public clientesSelecionadosNaTabela = [];

  // Método responsável por adicionar um novo filtro de busca
  adicionaFiltroDeBusca() {
    if (!this.validarFiltroDeBusca()) return;
    if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.DATA) {
      //var dataConvertidaParaPadraoBr = this.datepipe.transform(new Date(this.inputBusca), 'dd-MM-yyyy')
      this.filtrosAdicionados = this.filtrosAdicionados.concat(
        [{ tipoFiltro: this.tipoBuscaAtual.tipoFiltro, descricaoChip: this.tipoBuscaAtual.descricaoChip, valor: this.inputBusca }]
      )
    }
    else if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.MES_ANO) {
      //var mesAnoConvertidoParaPadraoBr = this.datepipe.transform(new Date(this.inputBusca), 'MM-yyyy');
      this.filtrosAdicionados = this.filtrosAdicionados.concat(
        [{ tipoFiltro: this.tipoBuscaAtual.tipoFiltro, descricaoChip: this.tipoBuscaAtual.descricaoChip, valor: this.inputBusca }]
      );
    }
    else {
      this.filtrosAdicionados = this.filtrosAdicionados.concat(
        [{ tipoFiltro: this.tipoBuscaAtual.tipoFiltro, descricaoChip: this.tipoBuscaAtual.descricaoChip, valor: this.inputBusca }]
      );
    }

    this.tiposBusca.forEach(tipoBusca => {
      if (this.tipoBuscaAtual.tipoFiltro == tipoBusca.tipoFiltro
        || this.tipoBuscaAtual.tipoFiltro == TiposFiltro.DATA && tipoBusca.tipoFiltro == TiposFiltro.MES_ANO
        || this.tipoBuscaAtual.tipoFiltro == TiposFiltro.MES_ANO && tipoBusca.tipoFiltro == TiposFiltro.DATA) {
        tipoBusca.disabled = true;
      }
    })

    this.abrePopupFiltro();
    this.filtrosAdicionadosExportados.emit(this.filtrosAdicionados);
    if (!this.chips.chipsExibidos && this.filtrosAdicionados.length == 1) this.alteraEstadoChips();
  }

  // Método executado pelo método adicionaFiltroDeBusca. Tem como objetivo validar as entradas de busca na adição de filtros
  validarFiltroDeBusca(): boolean {
    if (this.inputBusca == '' || this.inputBusca == null) return false;
    return true;
  }

  // Método responsável por realizar o tratamento dos inputs de adição de filtros em tempo real
  realizaTratamentoDoInputDeAdicaoDeNovoFiltro() {
    if (this.tipoBuscaAtual.tipoFiltro != TiposFiltro.DATA && this.tipoBuscaAtual.tipoFiltro != TiposFiltro.MES_ANO) {
      this.inputBusca = this.inputBusca.replace(/[&\/\\#,+@=()$~%.'":*?<>{}-]/g, "").trim();
      if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.EMAIL)
        this.inputBusca = this.inputBusca.replace(/\s/g, "");
    }
  }

  // Método executado quando o "x" dos chips forem acionados. Tem como objetivo remover um filtro de busca
  removeFiltro(index: number) {
    this.tiposBusca.forEach(tipoBusca => {
      if (tipoBusca.tipoFiltro.toString() == this.filtrosAdicionados[index].tipoFiltro.toString()
      || tipoBusca.tipoFiltro == TiposFiltro.DATA && this.filtrosAdicionados[index].tipoFiltro == TiposFiltro.MES_ANO
      || tipoBusca.tipoFiltro == TiposFiltro.MES_ANO && this.filtrosAdicionados[index].tipoFiltro == TiposFiltro.DATA) {
        this.tiposBusca[this.tiposBusca.indexOf(tipoBusca)].disabled = false;
      }
    })
    this.filtrosAdicionados = this.filtrosAdicionados.filter((_, item) => item < index || item >= index + 1);
    if (this.chips.chipsExibidos && this.filtrosAdicionados.length == 0) this.alteraEstadoChips();
    this.filtrosAdicionadosExportados.emit(this.filtrosAdicionados);
  }

  // Método responsável pela remoção de todos os filtros adicionados
  removeTodosFiltros() {
    this.filtrosAdicionados = [];
    this.chips = {
      'chipsExibidos': false, 'matRippleOlhoDesabilitado': true,
      'iconeOlho': 'visibility', 'descricaoAoPassarMouse': 'Não há filtros a serem exibidos'
    }
    this.abrePopupFiltro();

    this.tiposBusca.forEach(tipoBusca => {
      this.tiposBusca[this.tiposBusca.indexOf(tipoBusca)].disabled = false;
    })

    this._snackBar.open("Todos os filtros de busca foram removidos com sucesso!", "x", {
      duration: 3000
    });
    this.filtrosAdicionadosExportados.emit(this.filtrosAdicionados);
  }

  // Método responsável por exibir um pop up na parte inferior da tela ao remover todos os filtros
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  // Método executado ao mudar o valor do select do tipo de filtro de busca
  alteraTipoFiltro() {
    if (this.tipoBuscaSelect == "") {
      this.tipoBuscaAtual = null;
      return;
    }
    this.tiposBusca.forEach(tipoBusca => {
      if (this.tipoBuscaSelect == tipoBusca.descricao) {
        this.tipoBuscaAtual = tipoBusca;
        this.inputBusca = tipoBusca.valorDefault;
        return;
      }
    });
  }

  // Método executado ao abrir ou fechar o popup de adição de novos filtros de busca
  abrePopupFiltro() {
    this.popupFiltro = !this.popupFiltro;
    if (!this.popupFiltro) {
      this.tipoBuscaSelect = "";
      this.inputBusca = "";
      this.tipoBuscaAtual = null;
    }
  }

  // Método executado ao exibir ou ocultar os chips de buscas
  alteraEstadoChips() {

    if (!this.chips.chipsExibidos && this.filtrosAdicionados.length > 0) {
      // HABILITAR CHIPS
      this.chips.chipsExibidos = true;
      this.chips.matRippleOlhoDesabilitado = false;
      this.chips.iconeOlho = 'visibility_off';
      this.chips.descricaoAoPassarMouse = 'Ocultar filtros ativos';
    }
    else if (this.chips.chipsExibidos) {
      // DESABILITAR CHIPS
      this.chips.chipsExibidos = false;
      this.chips.matRippleOlhoDesabilitado = true;
      this.chips.iconeOlho = 'visibility';
      this.chips.descricaoAoPassarMouse = 'Exibir filtros ativos';
      if (this.filtrosAdicionados.length <= 0) {
        this.chips.descricaoAoPassarMouse = 'Não há filtros a serem exibidos';
        this.chips.matRippleOlhoDesabilitado = true;
      }
    }
  }

}
