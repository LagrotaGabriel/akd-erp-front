import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'custom-table-pagination',
  templateUrl: './paginacao.component.html',
  styleUrls: ['./paginacao.component.scss']
})
export class PaginacaoComponent {
  @Input() pageObject: any;
  @Output() emissorDePageNumberAtualizado = new EventEmitter<number>();

  GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
    return Array(n);
  }

  selecionarPagina(numeroPagina: number) {
    this.pageObject.pageNumber = numeroPagina;
    this.emissorDePageNumberAtualizado.emit(this.pageObject.pageNumber);
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
    if (this.pageObject.pageNumber > 0) {
      this.pageObject.pageNumber--;
      this.emissorDePageNumberAtualizado.emit(this.pageObject.pageNumber);
    }
  }

  avancarPagina() {
    if (this.pageObject.pageNumber < this.pageObject.totalPages - 1) {
      this.pageObject.pageNumber++;
      this.emissorDePageNumberAtualizado.emit(this.pageObject.pageNumber);
    }
  }
}
