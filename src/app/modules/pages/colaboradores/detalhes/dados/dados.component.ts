import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Colaborador } from '../../models/Colaborador';
import { Util } from 'src/app/modules/utils/Util';
import { ColaboradorService } from '../../services/colaborador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { slideUpDownAnimation } from 'src/app/shared/animations';

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
  @Input() colaborador: Colaborador;

  dadosAcesso: boolean = false;

  urlImagemPerfil;

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
