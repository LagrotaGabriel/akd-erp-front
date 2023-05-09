import { Subscription } from 'rxjs';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ColaboradorService } from '../../services/colaborador.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColaboradorNovo } from '../models/ColaboradorNovo';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html',
  styleUrls: ['./novo.component.scss']
})
export class NovoComponent {

  constructor(private colaboradorService: ColaboradorService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private ref: ChangeDetectorRef) { }

  private colaborador: ColaboradorNovo;
  protected dadosColaborador: FormGroup;
  protected dadosProfissionais: FormGroup;
  protected dadosAcesso: FormGroup;
  protected contratoContratacao: File;
  private criaNovoColaboradorSubscription$: Subscription;

  stepAtual: number = 0;

  ngAfterViewInit(): void {
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.criaNovoColaboradorSubscription$ != undefined) this.criaNovoColaboradorSubscription$.unsubscribe();
  }

  mudaPasso(event) {
    this.stepAtual = event.selectedIndex;
  }

  // FUNÇÕES QUE RECEBEM EMISSÃO DE EVENTOS DOS COMPONENTES FILHOS

  protected recebeFormGroupDadosPessoais(event) {
    this.dadosColaborador = event;
  }

  protected recebeFormGroupDadosProfissionais(event) {
    this.dadosProfissionais = event;
  }

  protected recebeFormGroupDadosAcesso(event) {
    this.dadosAcesso = event;
  }

  protected recebeContratoContratacao(event) {
    this.contratoContratacao = event;
  }

  // GETTERS
  protected getValueAtributoDadosColaborador(atributo: string): any {
    return this.dadosColaborador.controls[atributo].value;
  }

  protected getValueAtributoDadosProfissionais(atributo: string): any {
    return this.dadosProfissionais.controls[atributo].value;
  }

  protected getValueAtributoDadosAcesso(atributo: string): any {
    return this.dadosAcesso.controls[atributo].value;
  }


  private construirObjetoColaborador() {

    this.colaborador = {
      nome: this.getValueAtributoDadosColaborador('nome') != '' ? this.getValueAtributoDadosColaborador('nome') : null,
      cpfCnpj: this.getValueAtributoDadosColaborador('cpfCnpj') != '' ? this.getValueAtributoDadosColaborador('cpfCnpj') : null,
      dataNascimento: this.getValueAtributoDadosColaborador('dataNascimento') != '' ? this.getValueAtributoDadosColaborador('dataNascimento') : null,
      email: this.getValueAtributoDadosColaborador('email') != '' ? this.getValueAtributoDadosColaborador('email') : null,
      telefone: this.getValueAtributoDadosColaborador('tipoTelefone') != ''
        ? {
          tipoTelefone: this.getValueAtributoDadosColaborador('tipoTelefone'),
          prefixo: this.getValueAtributoDadosColaborador('prefixo'),
          numero: this.getValueAtributoDadosColaborador('numeroTelefone')
        }
        : null,
      endereco: this.getValueAtributoDadosColaborador('logradouro') != null && this.getValueAtributoDadosColaborador('logradouro') != ''
        ? {
          id: null,
          codigoPostal: this.getValueAtributoDadosColaborador('codigoPostal') != '' ? this.getValueAtributoDadosColaborador('codigoPostal') : null,
          estado: this.getValueAtributoDadosColaborador('estado') != '' ? this.getValueAtributoDadosColaborador('estado') : null,
          cidade: this.getValueAtributoDadosColaborador('cidade') != '' ? this.getValueAtributoDadosColaborador('cidade') : null,
          logradouro: this.getValueAtributoDadosColaborador('logradouro') != '' ? this.getValueAtributoDadosColaborador('logradouro') : null,
          numero: this.getValueAtributoDadosColaborador('numero') != '' ? this.getValueAtributoDadosColaborador('numero') : null,
          bairro: this.getValueAtributoDadosColaborador('bairro') != '' ? this.getValueAtributoDadosColaborador('bairro') : null,
          complemento: this.getValueAtributoDadosColaborador('complemento') != '' ? this.getValueAtributoDadosColaborador('complemento') : null
        }
        : null,
      tipoOcupacaoEnum: this.getValueAtributoDadosProfissionais('tipoOcupacaoEnum'),
      ocupacao: this.getValueAtributoDadosProfissionais('ocupacao') != '' ? this.getValueAtributoDadosProfissionais('ocupacao') : null,
      statusColaboradorEnum: this.getValueAtributoDadosProfissionais('statusColaboradorEnum') != ''
        ? this.getValueAtributoDadosProfissionais('statusColaboradorEnum')
        : null,
      modeloContratacaoEnum: this.getValueAtributoDadosProfissionais('modeloContratacaoEnum'),
      modeloTrabalhoEnum: this.getValueAtributoDadosProfissionais('modeloTrabalhoEnum'),
      salario: this.getValueAtributoDadosProfissionais('salario') != '' ? this.getValueAtributoDadosProfissionais('salario') : null,
      entradaEmpresa: this.getValueAtributoDadosProfissionais('entradaEmpresa') != ''
        ? this.getValueAtributoDadosProfissionais('entradaEmpresa')
        : null,
      saidaEmpresa: this.getValueAtributoDadosProfissionais('saidaEmpresa') != ''
        ? this.getValueAtributoDadosProfissionais('saidaEmpresa')
        : null,
      expediente: this.getValueAtributoDadosProfissionais('horaEntrada') != '' && this.getValueAtributoDadosProfissionais('horaEntrada') != null ? {
        horaEntrada: this.getValueAtributoDadosProfissionais('horaEntrada'),
        horaSaidaAlmoco: this.getValueAtributoDadosProfissionais('horaSaidaAlmoco'),
        horaEntradaAlmoco: this.getValueAtributoDadosProfissionais('horaEntradaAlmoco'),
        horaSaida: this.getValueAtributoDadosProfissionais('horaSaida'),
        cargaHorariaSemanal: this.getValueAtributoDadosProfissionais('cargaHorariaSemanal'),
        escalaEnum: this.getValueAtributoDadosProfissionais('escalaEnum')
      } : null,
      acessoSistema: {
        acessoSistemaAtivo: this.getValueAtributoDadosAcesso('acessoSistemaAtivo'),
        senha: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('senha') : null,
        permissaoEnum: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('permissaoEnum') : null,
        privilegios: this.getValueAtributoDadosAcesso('acessoSistemaAtivo') ? this.getValueAtributoDadosAcesso('privilegios') : null
      }
    }
  }

  protected enviarFormulario() {
    let matriculaGerada: string;
    this.construirObjetoColaborador();
    this.criaNovoColaboradorSubscription$ = this.colaboradorService.novoColaborador(this.colaborador, this.contratoContratacao).subscribe({
      next: (response: string) => {
        matriculaGerada = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.router.navigate(['/colaboradores']);
        this._snackBar.open("Ocorreu um erro durante o cadastro do colaborador. Entre em contato com o suporte", "Fechar", {
          duration: 5000
        });
      },
      complete: () => {
        this.router.navigate(['/colaboradores']);
        this._snackBar.open("Matrícula gerada para o colaborador cadastrado: " + matriculaGerada, "Fechar", {
          duration: 7500
        });
      }
    });
  }
}
