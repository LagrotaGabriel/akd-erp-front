import { Component } from '@angular/core';
import { AcaoPageObject } from '../models/AcaoPageObject';
import { AcaoService } from '../../services/acao.service';
import { Util } from 'src/app/modules/utils/Util';
import { ActivatedRoute, Router } from '@angular/router';
import { Acao } from '../../models/Acao';

@Component({
  selector: 'app-alteracoes',
  templateUrl: './alteracoes.component.html',
  styleUrls: ['./alteracoes.component.scss']
})
export class AlteracoesComponent {

  constructor(
    private acaoService: AcaoService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
  }

  protected historicoAcoes: AcaoPageObject;

  ngAfterViewInit(): void {
    this.realizaObtencaoDasAcoesDoColaborador();
  }

  geraEndPointAcessoItemAcao(acao: Acao): string {

    if (Util.isEmptyNumber(acao.idObjeto) || acao.tipoAcaoEnum == 'REMOCAO' || acao.tipoAcaoEnum == 'REMOCAO_EM_MASSA') return null;

    switch (acao.moduloEnum) {
      case 'HOME': { return '/inicio/' + acao.idObjeto; }
      case 'CLIENTES': { return '/clientes/' + acao.idObjeto; }
      case 'VENDAS': { return '/vendas/' + acao.idObjeto; }
      case 'PDV(': { return '/vendas/' + acao.idObjeto; }
      case 'ESTOQUE': { return '/estoque/' + acao.idObjeto; }
      case 'DESPESAS': { return '/despesas/' + acao.idObjeto; }
      case 'FECHAMENTOS': { return '/fechamento/' + acao.idObjeto; }
      case 'PATRIMONIOS': { return '/patrimonios/' + acao.idObjeto; }
      case 'FORNECEDORES': { return '/fornecedores/' + acao.idObjeto; }
      case 'COMPRAS': { return '/compras/' + acao.idObjeto; }
      case 'COLABORADORES': { return '/colaboradores/' + acao.idObjeto; }
      case 'PRECOS': { return '/precos/' + acao.idObjeto; }
      default: { return null; }
    }
  }

  converteTextoTipoAcao(acao: Acao): string {
    switch (acao.tipoAcaoEnum) {
      case 'CRIACAO': { return 'Criação'; }
      case 'ALTERACAO': { return 'Alteração'; }
      case 'REMOCAO': { return 'Remoção'; }
      case 'REMOCAO_EM_MASSA': { return 'Remoção em massa'; }
      case 'RELATORIO': { return 'Relatório'; }
      default: { return 'Outro'; }
    }
  }

  converteTextoTipoModulo(acao: Acao): string {
    switch (acao.moduloEnum) {
      case 'HOME': { return 'Home'; }
      case 'CLIENTES': { return 'Cliente'; }
      case 'VENDAS': { return 'Venda'; }
      case 'PDV(': { return 'Venda'; }
      case 'ESTOQUE': { return 'Produto'; }
      case 'DESPESAS': { return 'Despesa'; }
      case 'FECHAMENTOS': { return 'Fechamento'; }
      case 'PATRIMONIOS': { return 'Patrimonio'; }
      case 'FORNECEDORES': { return 'Fornecedor'; }
      case 'COMPRAS': { return 'Compra'; }
      case 'COLABORADORES': { return 'Colaborador'; }
      case 'PRECOS': { return 'Preço'; }
      default: { return 'Outro'; }
    }
  }

  tituloAcao(acao: Acao): string {
    let texto: string = '';
    texto += this.converteTextoTipoAcao(acao) + ' de ' + this.converteTextoTipoModulo(acao);
    return texto;
  }

  realizaObtencaoDasAcoesDoColaborador() {
    this.acaoService.getAcoes(Util.isNotObjectEmpty(this.historicoAcoes) ? this.historicoAcoes : null,
      parseInt(this.activatedRoute.snapshot.paramMap.get('id'))).subscribe({
        next: (resposta => {
          console.log(resposta);
          this.historicoAcoes = resposta;
        }),
        error: () => {
          this.router.navigate(['/colaboradores/' + this.activatedRoute.snapshot.paramMap.get('id')]);
        }
      })
  }

  // ==================== PAGINAÇÃO ==========================

  GeraNumerosParaNavegarNaPaginacao(n: number): Array<number> {
    return Array(n);
  }

  selecionarPagina(numeroPagina: number) {
    this.historicoAcoes.pageNumber = numeroPagina;
    this.realizaObtencaoDasAcoesDoColaborador();
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
    if (this.historicoAcoes.pageNumber > 0) {
      this.historicoAcoes.pageNumber--;
      this.realizaObtencaoDasAcoesDoColaborador();
    }
  }

  avancarPagina() {
    if (this.historicoAcoes.pageNumber < this.historicoAcoes.totalPages - 1) {
      this.historicoAcoes.pageNumber++;
      this.realizaObtencaoDasAcoesDoColaborador();
    }
  }

}
