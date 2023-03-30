import { Cliente } from '../../models/Cliente';
import { Pageable, PageObject } from '../../../../shared/models/PageObject';
import { Component, Input, OnChanges, AfterViewInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Endereco } from 'src/app/shared/models/Endereco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements OnChanges, AfterViewInit {

  pageObject: PageObject;
  clientesEncontrados: Cliente[] = [];

  @Output() clientesSelecionadosNaTabelaExportados = new EventEmitter();
  clientesSelecionadosNaTabela: Cliente[] = JSON.parse(localStorage.getItem("clientesSelecionados") || '[]');
  pageableInfo: Pageable = JSON.parse(localStorage.getItem("pageable") || 'null');

  botaoCheckAllHabilitado: boolean = JSON.parse(localStorage.getItem("checkAll") || 'false');

  @Input() public filtrosAdicionados;

  constructor(private clienteService: ClienteService, private _snackBar: MatSnackBar) { }

  ngDoCheck(): void {
    localStorage.setItem('pageable', JSON.stringify(this.pageableInfo));
    localStorage.setItem('checkAll', JSON.stringify(this.botaoCheckAllHabilitado));
    localStorage.setItem('clientesSelecionados', JSON.stringify(this.clientesSelecionadosNaTabela));
    this.checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.clientesSelecionadosNaTabelaExportados.emit(this.clientesSelecionadosNaTabela);
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['filtrosAdicionados'].isFirstChange()) {
      this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    }
  }

  invocaRequisicaoHttpGetParaAtualizarObjetos() {
    this.clienteService.getClientes(this.filtrosAdicionados, this.pageableInfo).subscribe(
      (res: PageObject) => {
        this.pageObject = res;
        if (this.pageableInfo == null) {
          this.pageableInfo = this.pageObject.pageable;
          this.pageableInfo.sortDirection = "desc"
        }
        this.clientesEncontrados = this.pageObject.content;
        this.clientesEncontrados.forEach(cliente => {
          if (cliente.checked == null) cliente.checked = false;
          if (cliente.expanded == null) cliente.expanded = false;
        })
      },
      (error: HttpErrorResponse) => {
        if (error.status == 403) {
          //TODO Encerrar sessão e redirecionar usuário para página de login. Aplicar NG GUARD (Se necessário)
        }
        else if (error.status == 0)
          this._snackBar.open("Houve uma falha de comunicação com o servidor", "Fechar");
      }
    );
  }

  checkObjetosQueEstaoNoLocalStorageDeObjetosSelecionados() {
    this.clientesSelecionadosNaTabela.forEach(clienteSelecionado => {
      var index: number = this.clientesEncontrados.findIndex(clienteEncontrado => clienteEncontrado.id === clienteSelecionado.id);
      if (index != -1) this.clientesEncontrados[index].checked = true;
    })
  }

  alteraOrdenacao() {
    if (this.pageableInfo.sortDirection == "desc") this.pageableInfo.sortDirection = "asc";
    else this.pageableInfo.sortDirection = "desc";
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  alteraEstadoExpansaoTabela(indice: number) {
    this.clientesEncontrados[indice].expanded = !this.clientesEncontrados[indice].expanded;
  }

  alteraEstadoCheckTabela(indice: number) {
    if (this.clientesEncontrados[indice].checked) {
      let indiceNaListaDeSelecionados: number =
        this.clientesSelecionadosNaTabela.findIndex(clienteSelecionado => clienteSelecionado.id === this.clientesEncontrados[indice].id);
      this.clientesSelecionadosNaTabela =
        this.clientesSelecionadosNaTabela.filter((_, item) => item < indiceNaListaDeSelecionados || item >= indiceNaListaDeSelecionados + 1);
    }
    else {
      this.clientesSelecionadosNaTabela = this.clientesSelecionadosNaTabela.concat(this.clientesEncontrados[indice]);
    }
    this.clientesEncontrados[indice].checked = !this.clientesEncontrados[indice].checked;
    this.clientesSelecionadosNaTabelaExportados.emit(this.clientesSelecionadosNaTabela);
  }

  checkAll() {
    this.botaoCheckAllHabilitado = !this.botaoCheckAllHabilitado;
    if (this.botaoCheckAllHabilitado) this.clientesSelecionadosNaTabela = this.clientesEncontrados;
    else this.clientesSelecionadosNaTabela = [];
    this.clientesEncontrados.forEach(cliente => {
      cliente.checked = this.botaoCheckAllHabilitado;
    })
    this.clientesSelecionadosNaTabelaExportados.emit(this.clientesSelecionadosNaTabela);
  }

  trataEnderecoTabela(endereco: Endereco): string {
    var enderecoCompleto = ""
    if (endereco != null) {
      enderecoCompleto += (endereco.logradouro + ', ' + endereco.numero);
      if (endereco.bairro != null && endereco.cidade != null && endereco.estado != null)
        enderecoCompleto += (' - ' + endereco.bairro + ', ' + endereco.cidade + ' - ' + endereco.estado);
      if (endereco.codigoPostal != null)
        enderecoCompleto += (' - ' + endereco.codigoPostal);
      return enderecoCompleto;
    }
    else return '-';
  }

  excluiCliente(id: number) {
    this.clienteService.removeCliente(id).subscribe(
      (res: Cliente) => {
        console.log(res.nome + ' Excluído com sucesso');
        this.invocaRequisicaoHttpGetParaAtualizarObjetos();
        this._snackBar.open("Cliente Excluído com sucesso", "Fechar", {
          duration: 3000
        });
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
    return Array(n);
  }

  selecionarPagina(numeroPagina: number) {
    this.pageableInfo.pageNumber = numeroPagina;
    this.invocaRequisicaoHttpGetParaAtualizarObjetos();
  }

  voltarPagina() {
    if (this.pageableInfo.pageNumber > 0) {
      this.pageableInfo.pageNumber--;
      this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    }
  }

  avancarPagina() {
    if (this.pageableInfo.pageNumber < this.pageObject.totalPages - 1) {
      this.pageableInfo.pageNumber++;
      this.invocaRequisicaoHttpGetParaAtualizarObjetos();
    }
  }

}
