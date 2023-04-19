import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageObject } from '../../models/PageObject';

@Component({
  selector: 'app-paginacao',
  templateUrl: './paginacao.component.html',
  styleUrls: ['../../../../../../dist/paginacao.scss'],
})
export class PaginacaoComponent {
  
  @Input() pageableInfo: PageObject;
  @Output() emissorDePageNumberAtualizado = new EventEmitter<number>();

  GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
    return Array(n);
  }

  selecionarPagina(numeroPagina: number) {
    this.pageableInfo.pageNumber = numeroPagina;
    //this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    this.emissorDePageNumberAtualizado.emit(this.pageableInfo.pageNumber);
  }

  geraBotaoVoltarPaginacao(): string {
    if (window.innerWidth > 340) return 'Voltar'
    else return '<';
  }

  geraBotaoAvancarPaginacao(): string {
    if (window.innerWidth > 340) return 'Próximo'
    else return '>';
  }

  voltarPagina() {
    if (this.pageableInfo.pageNumber > 0) {
      this.pageableInfo.pageNumber--;
      //this.invocaRequisicaoHttpGetParaAtualizarObjetos();
      this.emissorDePageNumberAtualizado.emit(this.pageableInfo.pageNumber);
    }
  }

  avancarPagina() {
    if (this.pageableInfo.pageNumber < this.pageableInfo.totalPages - 1) {
      this.pageableInfo.pageNumber++;
      //this.invocaRequisicaoHttpGetParaAtualizarObjetos();
      this.emissorDePageNumberAtualizado.emit(this.pageableInfo.pageNumber);
    }
  }
}

