import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcessoService } from '../../../services/acesso.service';
import { AcessoPageObject } from '../../models/AcessoPageObject';
import { Util } from 'src/app/modules/utils/Util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-acessos',
  templateUrl: './acessos.component.html',
  styleUrls: ['./acessos.component.scss']
})
export class AcessosComponent {
  constructor(
    private acessoService: AcessoService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
  }

  protected acessos: AcessoPageObject;

  protected getAcoesSubscription$: Subscription;

  ngAfterViewInit(): void {
    this.realizaObtencaoDasAdvertenciasDoColaborador();
  }

  ngOnDestroy(): void {
    if (Util.isNotObjectEmpty(this.getAcoesSubscription$)) this.getAcoesSubscription$.unsubscribe();
  }

  realizaObtencaoDasAdvertenciasDoColaborador() {
    this.getAcoesSubscription$ = this.acessoService.getAcoes(Util.isNotObjectEmpty(this.acessos) ? this.acessos : null,
      parseInt(this.activatedRoute.snapshot.paramMap.get('id'))).subscribe({
        next: (resposta => {
          this.acessos = resposta;
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
    this.acessos.pageNumber = numeroPagina;
    this.realizaObtencaoDasAdvertenciasDoColaborador();
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
    if (this.acessos.pageNumber > 0) {
      this.acessos.pageNumber--;
      this.realizaObtencaoDasAdvertenciasDoColaborador();
    }
  }

  avancarPagina() {
    if (this.acessos.pageNumber < this.acessos.totalPages - 1) {
      this.acessos.pageNumber++;
      this.realizaObtencaoDasAdvertenciasDoColaborador();
    }
  }

}
