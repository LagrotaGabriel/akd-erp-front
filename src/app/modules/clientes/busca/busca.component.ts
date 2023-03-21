import { FiltrosService } from './../../../shared/services/filtros.service';
import { Component, } from '@angular/core';
import { Filtro } from 'src/app/shared/models/filtros/Filtro';
import { TiposFiltro } from 'src/app/shared/models/filtros/TiposFiltro';
import { trigger, style, animate, transition } from '@angular/animations';
import { FiltroAdicionado } from 'src/app/shared/models/filtros/FiltroAdicionado';
import { Chips } from 'src/app/shared/models/filtros/Chips';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class BuscaComponent {

  constructor(public filtrosService: FiltrosService, public datepipe: DatePipe, private _snackBar: MatSnackBar) { }

  popupFiltro: boolean = false;  // Verificação do estado do popup de adição de novos filtros

  // Estado atual dos chips
  chips: Chips = JSON.parse(localStorage.getItem("chips") || JSON.stringify({
    'chipsExibidos': false, 'matRippleOlhoDesabilitado': true,
    'iconeOlho': 'visibility', 'descricaoAoPassarMouse': 'Não há filtros a serem exibidos'
  }));

  tipoBuscaSelect: string = ""; // Select onde selecionamos o tipo de filtro a ser utilizado na busca
  inputBusca: string = ""; // Input com valor atualizado de um novo filtro
  tipoBuscaAtual: Filtro; // Objeto Filtro indicando qual é o tipo atual de filtro que está selecionado no popup
  public filtrosAdicionados: Array<FiltroAdicionado> = JSON.parse(localStorage.getItem("filtros") || '[]'); // Lista de filtros de busca ativos

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
  tiposBusca: Filtro[] = this.filtrosService.setaTiposFiltro(this.tiposFiltroBusca);

  // Método responsável por adicionar um novo filtro de busca
  adicionaFiltroDeBusca() {
    if (!this.validarFiltroDeBusca()) return;
    if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.DATA) {
      var dataConvertidaParaPadraoBr = this.datepipe.transform(new Date(this.inputBusca), 'dd-MM-yyyy')
      this.filtrosAdicionados.push(
        { tipoFiltro: this.tipoBuscaAtual.tipoFiltro, descricaoChip: this.tipoBuscaAtual.descricaoChip, valor: dataConvertidaParaPadraoBr }
      );
    }
    else if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.MES_ANO) {
      var mesAnoConvertidoParaPadraoBr = this.datepipe.transform(new Date(this.inputBusca), 'MM-yyyy');
      this.filtrosAdicionados.push(
        { tipoFiltro: this.tipoBuscaAtual.tipoFiltro, descricaoChip: this.tipoBuscaAtual.descricaoChip, valor: mesAnoConvertidoParaPadraoBr }
      );
    }
    else {
      this.filtrosAdicionados.push(
        { tipoFiltro: this.tipoBuscaAtual.tipoFiltro, descricaoChip: this.tipoBuscaAtual.descricaoChip, valor: this.inputBusca }
      );
    }
    this.abrePopupFiltro();
    localStorage.setItem('filtros', JSON.stringify(this.filtrosAdicionados));
    if (!this.chips.chipsExibidos && this.filtrosAdicionados.length == 1) this.alteraEstadoChips();
  }

  // Método executado pelo método adicionaFiltroDeBusca. Tem como objetivo validar as entradas de busca na adição de filtros
  validarFiltroDeBusca(): boolean {
    if (this.inputBusca == '' || this.inputBusca == null) return false;
    return true;
  }

  // Método responsável por realizar o tratamento dos inputs de adição de filtros em tempo real
  realizaTratamentoDoInputDeAdicaoDeNovoFiltro() {
    this.inputBusca = this.inputBusca.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "").trim();
    if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.EMAIL)
      this.inputBusca = this.inputBusca.replace(/\s/g, "");
    else if (this.tipoBuscaAtual.tipoFiltro == TiposFiltro.CPF_CNPJ)
      this.inputBusca = this.inputBusca.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, "").trim();
  }

  // Método executado quando o "x" dos chips forem acionados. Tem como objetivo remover um filtro de busca
  removeFiltro(index: number) {
    this.filtrosAdicionados.splice(index, 1);
    if (this.filtrosAdicionados) localStorage.setItem('filtros', JSON.stringify(this.filtrosAdicionados));
    if (this.chips.chipsExibidos && this.filtrosAdicionados.length == 0) this.alteraEstadoChips();

  }

  removeTodosFiltros() {
    this.filtrosAdicionados = [];
    this.chips = {
      'chipsExibidos': false, 'matRippleOlhoDesabilitado': true,
      'iconeOlho': 'visibility', 'descricaoAoPassarMouse': 'Não há filtros a serem exibidos'
    }
    this.abrePopupFiltro();
    localStorage.setItem('filtros', JSON.stringify(this.filtrosAdicionados));
    localStorage.setItem('chips', JSON.stringify(this.chips));

    this._snackBar.open("Todos os filtros de busca foram removidos com sucesso!", "X", {
      duration: 3000
    });
  }

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
      localStorage.setItem('chips', JSON.stringify(this.chips));
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
      localStorage.setItem('chips', JSON.stringify(this.chips));
    }
  }

}
