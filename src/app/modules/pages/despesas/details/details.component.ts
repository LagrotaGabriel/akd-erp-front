import { Subscription } from 'rxjs';
import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DespesaResponse } from '../models/response/DespesaResponse';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DespesaService } from '../services/despesa.service';
import { Util } from 'src/app/modules/utils/Util';
import { Location } from '@angular/common';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private despesaService: DespesaService,
    private _snackBar: MatSnackBar,
    private _location: Location,
    private ref: ChangeDetectorRef) {
  }

  protected idDespesa: number;
  @Input() despesa: DespesaResponse;

  protected obtemDetalhesDaDespesaPorIdSubscription$: Subscription;
  protected removeItem$: Subscription;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.realizaValidacaoDoIdDespesa();
    this.realizaObtencaoDeDadosDaDespesa();
  }

  ngOnDestroy(): void {
    if (Util.isNotObjectEmpty(this.obtemDetalhesDaDespesaPorIdSubscription$)) this.obtemDetalhesDaDespesaPorIdSubscription$.unsubscribe();
    if (Util.isNotObjectEmpty(this.removeItem$)) this.removeItem$.unsubscribe();
  }

  realizaValidacaoDoIdDespesa() {
    let id = this.activatedRoute.snapshot.paramMap.get('id')
    if (/^\d+$/.test(id)) this.idDespesa = parseInt(id);
    else {
      this.router.navigate(['/despesas']);
      this._snackBar.open("A despesa que você tentou acessar não existe", "Fechar", {
        duration: 3500
      });
    }
  }

  realizaObtencaoDeDadosDaDespesa() {
    this.obtemDetalhesDaDespesaPorIdSubscription$ = this.despesaService.obtemDespesaPorId(this.idDespesa).subscribe({
      next: (resposta => {
        this.despesa = resposta;
      }),
      error: () => {
        this.router.navigate(['/despesas']);
        this._snackBar.open("A despesa que você tentou acessar não existe", "Fechar", {
          duration: 3500
        });
      },
      complete: () => {
        console.log(this.despesa);
      }
    })
  }

  retornaParaTelaAnterior() {
    this._location.back();
  }

  redirecionaParaEdicao() {
    this.router.navigate(['despesas/update'], {
      queryParams: {
        id: this.idDespesa
      }
    });
  }

  imprimeDespesa() {
    window.print();
  }

  removeDespesa() {
    let exclusaoRecorrencias: boolean = false;

    if (window.confirm('Tem certeza que deseja remover essa despesa?')) {
      
      if (this.despesa.qtdRecorrencias > 0)
        if (window.confirm('A despesa possui recorrências. Deseja que elas também sejam excluídas?'))
          exclusaoRecorrencias = true;

      this.removeItem$ = this.despesaService.removeDespesa(this.idDespesa, exclusaoRecorrencias).subscribe(
        {
          next: () => {
            this._snackBar.open("Despesa excluída com sucesso", "Fechar", {
              duration: 3500
            });
          },
          complete: () => {
            this.retornaParaTelaAnterior();
          }
        }
      );
    }
  }

}
