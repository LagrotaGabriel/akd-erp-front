import { Component, ChangeDetectorRef } from '@angular/core';
import { ColaboradorService } from '../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Colaborador } from '../models/Colaborador';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Util } from 'src/app/modules/utils/Util';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class DetalhesComponent {

  constructor(
    private colaboradorService: ColaboradorService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private _snackBar: MatSnackBar) {
  }

  abaSelecionada: FormControl = new FormControl(0);

  mudaAbaSelecionadaSubscription$: Subscription = this.abaSelecionada.valueChanges.subscribe({
    next: () => {
      console.log('Aba atual: ' + this.abaSelecionada.value);
    }
  })

  private idColaborador: number;
  protected colaborador: Colaborador;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.realizaValidacaoDoIdColaborador();
    this.realizaObtencaoDeDadosDoColaborador();
  }

  ngOnDestroy(): void {
    if (Util.isNotObjectEmpty(this.mudaAbaSelecionadaSubscription$)) this.mudaAbaSelecionadaSubscription$.unsubscribe();
  }

  inicializaPathParams() {
    /*     this.pathParamsSubscription$ = this.activatedRoute.queryParams.subscribe((params) => {
          let navParam: string = params['nav']
          if (this.possiveisValoresNav.includes(navParam)) this.navAtivo = navParam;
          else {
            this.router.navigate(
              [],
              {
                relativeTo: this.activatedRoute,
                queryParams: { nav: this.possiveisValoresNav[0] },
                queryParamsHandling: 'merge', // remove to replace all query params by provided
              });
            this.navAtivo = this.possiveisValoresNav[0];
          }
        }) */
  }

  realizaValidacaoDoIdColaborador() {
    let id = this.activatedRoute.snapshot.paramMap.get('id')
    if (/^\d+$/.test(id)) this.idColaborador = parseInt(id);
    else {
      this.router.navigate(['/colaboradores']);
      this._snackBar.open("O colaborador que você tentou acessar não existe", "Fechar", {
        duration: 3500
      });
    }
  }

  realizaObtencaoDeDadosDoColaborador() {
    this.colaboradorService.obtemDetalhesDoColaboradorPorId(this.idColaborador).subscribe({
      next: (resposta => {
        console.log(resposta);
        this.colaborador = resposta;
      }),
      error: () => {
        this.router.navigate(['/colaboradores']);
        this._snackBar.open("O colaborador que você tentou acessar não existe", "Fechar", {
          duration: 3500
        });
      }
    })
  }

}
