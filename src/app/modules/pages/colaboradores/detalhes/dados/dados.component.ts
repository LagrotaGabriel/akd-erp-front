import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Util } from 'src/app/modules/utils/Util';
import { ColaboradorService } from '../../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { slideUpDownAnimation } from 'src/app/shared/animations';
import { Subscription } from 'rxjs';
import { ColaboradorResponse } from '../../models/response/colaborador/ColaboradorResponse';

@Component({
  selector: 'app-dados',
  templateUrl: './dados.component.html',
  styleUrls: ['./dados.component.scss'],
  animations: [slideUpDownAnimation]
})
export class DadosComponent {

  constructor(
    private colaboradorService: ColaboradorService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private _snackBar: MatSnackBar) {
  }

  private idColaborador: number;
  @Input() colaborador: ColaboradorResponse;

  dadosAcesso: boolean = false;

  urlImagemPerfil;

  protected obtemDetalhesDoColaboradorPorIdSubscription$: Subscription;
  protected removeColaboradorSubscription$: Subscription;
  protected obtemImagemPerfilColaboradorSubscription$: Subscription;
  protected atualizaImagemPerfilColaboradorSubscription$: Subscription;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
    this.realizaValidacaoDoIdColaborador();
    this.realizaObtencaoDeDadosDoColaborador();
  }

  ngOnDestroy(): void {
    if (Util.isNotObjectEmpty(this.obtemDetalhesDoColaboradorPorIdSubscription$)) this.obtemDetalhesDoColaboradorPorIdSubscription$.unsubscribe();
    if (Util.isNotObjectEmpty(this.removeColaboradorSubscription$)) this.removeColaboradorSubscription$.unsubscribe();
    if (Util.isNotObjectEmpty(this.obtemImagemPerfilColaboradorSubscription$)) this.obtemImagemPerfilColaboradorSubscription$.unsubscribe();
    if (Util.isNotObjectEmpty(this.atualizaImagemPerfilColaboradorSubscription$)) this.atualizaImagemPerfilColaboradorSubscription$.unsubscribe();
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
    this.obtemDetalhesDoColaboradorPorIdSubscription$ = this.colaboradorService.obtemDetalhesDoColaboradorPorId(this.idColaborador).subscribe({
      next: (resposta => {
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
    this.removeColaboradorSubscription$ = this.colaboradorService.removeColaborador(this.colaborador.id).subscribe({
      complete: () => {
        this.router.navigate(['/colaboradores']);
        this._snackBar.open('Colaborador removido com sucesso', 'Fechar', {
          duration: 3500
        })
      }
    })
  }

  obtemSrcImagem(colaborador: ColaboradorResponse) {
    if (Util.isObjectEmpty(colaborador?.fotoPerfil)) this.urlImagemPerfil = '/assets/imgs/profile_photo.png';
    else {
      this.obtemImagemPerfilColaboradorSubscription$ = this.colaboradorService.obtemImagemPerfilColaborador(colaborador.id).subscribe({
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
        this.atualizaImagemPerfilColaboradorSubscription$ = this.colaboradorService.atualizaImagemPerfilColaborador(this.colaborador.id, fotoPerfil).subscribe({
          next: (response: ColaboradorResponse) => {
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
    this.atualizaImagemPerfilColaboradorSubscription$ = this.colaboradorService.atualizaImagemPerfilColaborador(this.colaborador.id, null).subscribe({
      next: (response: ColaboradorResponse) => {
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
