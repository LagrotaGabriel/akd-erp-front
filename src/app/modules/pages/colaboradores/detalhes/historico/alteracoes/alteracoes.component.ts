import { Component } from '@angular/core';
import { AcaoPageObject } from '../../../models/response/acao/AcaoPageObject';
import { AcaoService } from '../../../services/acao.service';
import { Util } from 'src/app/modules/utils/Util';
import { ActivatedRoute, Router } from '@angular/router';
import { slideUpDownAnimation } from 'src/app/shared/animations';
import { Subscription } from 'rxjs';
import { AcaoResponse } from '../../../models/response/acao/AcaoResponse';

@Component({
  selector: 'app-alteracoes',
  templateUrl: './alteracoes.component.html',
  styleUrls: ['./alteracoes.component.scss'],
  animations: [slideUpDownAnimation]
})
export class AlteracoesComponent {

  constructor(
    private acaoService: AcaoService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
  }

  protected getAcoesSubscription$: Subscription;

  protected historicoAcoes: AcaoPageObject;

  ngAfterViewInit(): void {
    this.realizaObtencaoDasAcoesDoColaborador();
  }

  ngOnDestroy(): void {
    if (Util.isNotObjectEmpty(this.getAcoesSubscription$)) this.getAcoesSubscription$.unsubscribe();
  }

  converteTextoTipoAcao(acao: AcaoResponse): string {
    switch (acao.tipoAcaoEnum) {
      case 'CRIACAO': { return 'Criação'; }
      case 'ALTERACAO': { return 'Alteração'; }
      case 'REMOCAO': { return 'Remoção'; }
      case 'REMOCAO_EM_MASSA': { return 'Remoção'; }
      case 'RELATORIO': { return 'Relatório'; }
      default: { return 'Outro'; }
    }
  }

  converteTextoTipoModulo(acao: AcaoResponse): string {
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

  tituloAcao(acao: AcaoResponse): string {
    let texto: string = '';
    texto += this.converteTextoTipoAcao(acao) + ' de ' + this.converteTextoTipoModulo(acao);
    return texto;
  }

  realizaObtencaoDasAcoesDoColaborador() {
    this.getAcoesSubscription$ = this.acaoService.getAcoes(Util.isNotObjectEmpty(this.historicoAcoes) ? this.historicoAcoes : null,
      parseInt(this.activatedRoute.snapshot.paramMap.get('id'))).subscribe({
        next: (resposta => {
          this.historicoAcoes = resposta;
        }),
        error: () => {
          this.router.navigate(['/colaboradores/' + this.activatedRoute.snapshot.paramMap.get('id')]);
        }
      })
  }

  expandeAcao(acao: AcaoResponse) {
    if (Util.isNotEmptyString(acao?.observacao)) acao.expandido = !acao?.expandido;
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
