import { Component, ChangeDetectorRef } from '@angular/core';
import { ColaboradorService } from '../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Colaborador } from '../models/Colaborador';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private _snackBar: MatSnackBar) { }

  private idColaborador: number;
  protected colaborador: Colaborador;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.realizaValidacaoDoIdColaborador();
    this.realizaObtencaoDeDadosDoColaborador();
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
