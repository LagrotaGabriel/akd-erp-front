import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Util } from '../../utils/Util';
import { TableTd } from './models/TableTd';
import { TableTh } from './models/TableTh';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'custom-table',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent {
  constructor(private router: Router,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private titleCasePipe: TitleCasePipe) { }

  @Input() theads: TableTh[];
  @Input() tbodies: TableTd[];
  @Input() objetos: any[];
  @Input() modulo: string;
  @Input() check: boolean = true;
  @Input() options: boolean = true;
  @Input() dblClickEnabled: boolean = true;
  @Input() isTableHeightAuto: boolean = false;

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');
  itensSelecionadosNaTabela: any[] = JSON.parse(localStorage.getItem("itensSelecionadosNaTabela") || '[]');

  @Output() emiteAlteracaoDoEstadoDeCheckDaTabela = new EventEmitter<any>();
  @Output() emiteSolicitacaoDeExclusaoDoItem = new EventEmitter<number>();

  ngDoCheck(): void {
    localStorage.setItem('itensSelecionadosNaTabela', JSON.stringify(this.itensSelecionadosNaTabela));
    this.ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll();
  }

  obtemTd(objeto: any, tbody: TableTd): TableTd {
    let valorCampo = objeto[tbody.campo] || '-';

    if (tbody.campo == 'telefone') {
      valorCampo = objeto['telefone'].telefoneCompleto;
    }

    let td: TableTd = {
      campo: valorCampo,
      hidden: tbody.hidden,
      maxLength: tbody.maxLength,
      type: tbody.type,
      titleCase: tbody.titleCase,
      tableTdCustomClasses: tbody.tableTdCustomClasses
    };

    return td;
  }

  obtemClassePersonalizada(tableTd: TableTd): string {

    let customClassName: string = null;

    if (tableTd.tableTdCustomClasses.length == 0) return customClassName;
    else {
      tableTd.tableTdCustomClasses.forEach(customClass => {
        if (tableTd.campo == customClass.value) customClassName = customClass.className;
      })
    }
    return customClassName;
  }

  realizaTratamentoPipe(tableTd: TableTd): string {
    let valor: string = tableTd.campo;
    switch (tableTd.type) {
      case 'money': {
        valor = Util.isNotEmptyString(tableTd.campo) && tableTd.campo != '-' ? (this.currencyPipe.transform(tableTd.campo, 'BRL')) : '-';
        break;
      }
      case 'date': {
        valor = Util.isNotEmptyString(tableTd.campo) && tableTd.campo != '-' ? (this.datePipe.transform(tableTd.campo, 'dd/MM/yyyy')) : '-';
        break;
      }
      default: {
        if (Util.isNotEmptyString(tableTd.campo) && tableTd.campo != '') {
          if (tableTd.titleCase) valor = this.titleCasePipe.transform(tableTd.campo);
        }
        else valor = '-';
      }
    }
    return valor;
  }

  checkAll() {
    if (!this.botaoCheckAllHabilitado) {
      this.objetos.forEach(itemTabela => {
        if (!itemTabela.checked) {
          itemTabela.checked = true;
          this.itensSelecionadosNaTabela.push(itemTabela);
        }
      })
    }
    else {
      this.objetos.forEach(itemTabela => {
        if (itemTabela.checked) {
          let itemListaTabela: any[] = this.itensSelecionadosNaTabela.filter(item => item.id == itemTabela.id)
          if (itemListaTabela.length == 1) {
            this.itensSelecionadosNaTabela.splice(this.itensSelecionadosNaTabela.indexOf(itemListaTabela[0]), 1);
            itemTabela.checked = false;
          }
        }
      })
    }

    this.botaoCheckAllHabilitado = !this.botaoCheckAllHabilitado;

    localStorage.setItem('checkAll', JSON.stringify(this.botaoCheckAllHabilitado));
  }

  alteraEstadoCheckTabela(indice: number) {
    if (this.objetos[indice].checked) {
      let indiceNaListaDeSelecionados: number =
        this.itensSelecionadosNaTabela.findIndex(itemSelecionado => itemSelecionado.id === this.objetos[indice].id);
      this.itensSelecionadosNaTabela =
        this.itensSelecionadosNaTabela.filter((_, item) => item < indiceNaListaDeSelecionados || item >= indiceNaListaDeSelecionados + 1);
    }
    else {
      this.itensSelecionadosNaTabela = this.itensSelecionadosNaTabela.concat(this.objetos[indice]);
    }
    this.objetos[indice].checked = !this.objetos[indice].checked;

    this.ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll();

    this.emiteAlteracaoDoEstadoDeCheckDaTabela.emit(this.itensSelecionadosNaTabela);
  }

  ajustaCheckDeObjetosNaTabelaComBaseNoCheckAll() {
    if (this.verificaSeConteudoMaiorQueZero()) {
      if (this.objetos.filter(e => e.checked === false).length > 0) {
        this.botaoCheckAllHabilitado = false;
      }
      else if (this.objetos.filter(e => e.checked).length == this.objetos.length) {
        this.botaoCheckAllHabilitado = true;
      }
    }
  }

  verificaSeConteudoMaiorQueZero(): boolean {
    if (this.objetos != null) {
      if (this.objetos.length > 0) return true;
    }
    return false;
  }

  excluiItem(id: number) {
    this.emiteSolicitacaoDeExclusaoDoItem.emit(id);
  }

  encaminhaParaAlteracaoItem(id: number) {
    this.router.navigate(
      [this.modulo + '/update'],
      { queryParams: { id: id } }
    );
  }

  navegarParaDetalhes(objeto) {
    if (Util.isNotEmptyString(objeto.options.urlDetalhes)) {
      let pathUrl: string = objeto.options.urlDetalhes;
      window.open(pathUrl);
    }
    else {
      let pathUrl: string = this.modulo + '/' + (objeto.id.toString());
      this.router.navigate([pathUrl]);
    }
  }
}
