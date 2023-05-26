import { Component, ChangeDetectorRef } from '@angular/core';
import { ColaboradorService } from '../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Colaborador } from '../models/Colaborador';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Util } from 'src/app/modules/utils/Util';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { slideUpDownAnimation } from 'src/app/shared/animations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss'],
  animations: [slideUpDownAnimation]
})
export class DetalhesComponent {

  constructor(
    private colaboradorService: ColaboradorService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private _snackBar: MatSnackBar) {
  }

  urlImagemPerfil;

  abaSelecionada: FormControl = new FormControl(0);
  emiteMudancaDeAba: number = 0;

  mudaAbaSelecionadaSubscription$: Subscription = this.abaSelecionada.valueChanges.subscribe({
    next: () => {
      console.log('Aba atual: ' + this.abaSelecionada.value);
      this.emiteMudancaDeAba = this.abaSelecionada.value;
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
        this.obtemSrcImagem(resposta);
      }),
      error: () => {
        this.router.navigate(['/colaboradores']);
        this._snackBar.open("O colaborador que você tentou acessar não existe", "Fechar", {
          duration: 3500
        });
      }
    })
  }

  retornarParaTabela() {
    this.router.navigate(['/colaboradores'])
  }

  redirecionaParaEdicaoColaborador() {
    this.router.navigate(['/colaboradores/alterar/' + this.colaborador.id]);
  }

  invocaMetodoExclusaoColaborador() {
    this.colaboradorService.removeColaborador(this.colaborador.id).subscribe({
      complete: () => {
        this.router.navigate(['/colaboradores']);
        this._snackBar.open('Colaborador removido com sucesso', 'Fechar', {
          duration: 3500
        })
      }
    })
  }

  estiloStatusColaborador(statusColaborador: string): string {
    switch (statusColaborador) {
      case ('ATIVO'): return 'status_green';
      case ('AFASTADO'): return 'status_yellow';
      case ('FERIAS'): return 'status_yellow';
      case ('DISPENSADO'): return 'status_red';
      case ('EXCLUIDO'): return 'status_red';
      case ('FREELANCER'): return 'status_blue';
      default: return null;
    }
  }

  obtemSrcImagem(colaborador: Colaborador) {
    if (Util.isObjectEmpty(colaborador?.fotoPerfil)) this.urlImagemPerfil = '/assets/imgs/profile_photo.png';
    else {
      this.colaboradorService.obtemImagemPerfilColaborador(colaborador.id).subscribe({
        next: (resposta) => {
          const reader = new FileReader();
          reader.onload = (e) => this.urlImagemPerfil = e.target.result;
          reader.readAsDataURL(new Blob([resposta]));
        },
        error: () => {
          this.urlImagemPerfil = '/assets/imgs/profile_photo.png';
        }
      });

    }
  }

  realizaChamadaServicoDeAtualizacaoDeImagemDePerfilDoColaborador(event) {

    let fotoPerfil: File;

    if (this.colaborador.fotoPerfil != null) {
      if (window.confirm('Tem certeza que deseja substituir a imagem de perfil atual?')) null;
      else return;
    }

    if (event.target.files[0] == undefined) return;

    else {
      const max_size = 1048576;
      const allowed_types = ['image/png', 'image/jpeg'];

      if (event.target.files[0].size > max_size) {
        this._snackBar.open("O tamanho da imagem não pode ser maior do que 1MB", "Fechar", {
          duration: 5000
        })
        return;
      }
      else if (!(allowed_types.includes(event.target.files[0].type))) {
        this._snackBar.open("Tipo de arquivo inválido. Escolha uma imagem de extensão .jpg ou .png", "Fechar", {
          duration: 5000
        })
        return;
      }
      else {
        fotoPerfil = event.target.files[0];
        this.colaboradorService.atualizaImagemPerfilColaborador(this.colaborador.id, fotoPerfil).subscribe({
          next: (response: Colaborador) => {
            this.colaborador = response;
            this.obtemSrcImagem(response);
          },
          complete: () => {
            this._snackBar.open('Imagem de perfil atualizada com sucesso!', 'Fechar', {
              duration: 3000
            });
          }
        })

      }

    }
  }

  realizaChamadaServicoDeExclusaoDeImagemDePerfilDoColaborador() {
    this.colaboradorService.atualizaImagemPerfilColaborador(this.colaborador.id, null).subscribe({
      next: (response: Colaborador) => {
        this.colaborador = response;
      },
      complete: () => {
        this.urlImagemPerfil = '/assets/imgs/profile_photo.png'
        this._snackBar.open('Imagem de perfil removida com sucesso!', 'Fechar', {
          duration: 3000
        });
      }
    })
  }

}
